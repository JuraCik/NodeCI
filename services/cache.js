const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

const redisClient = redis.createClient(keys.redisUrl);

const nativeExec = mongoose.Query.prototype.exec;

redisClient.hset = util.promisify(redisClient.hset);
redisClient.hget = util.promisify(redisClient.hget);

mongoose.Query.prototype.cache = async function (options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');

    return this;
}

mongoose.Query.prototype.exec = async function () {
    console.log('!this.useCache', !this.useCache);

    if (!this.useCache) {
        return nativeExec.apply(this, arguments);
    }


    const collectionName = this.mongooseCollection.name
    const key = JSON.stringify({...this.getQuery(), collectionName});
    const cachedValue = await redisClient.hget(this.hashKey, key);

    if (cachedValue) {
        const {model: Model} = this;

        const doc = JSON.parse(cachedValue);
        return Array.isArray(doc)
            ? doc.map(Model)
            : new Model(doc)
    }
    const result = await nativeExec.apply(this, arguments);

    await redisClient.hset(this.hashKey, key, JSON.stringify(result));

    return result
};

module.exports = {
    clearHash(hashKey) {
        console.log('clearHash');
        
        redisClient.del(JSON.stringify(hashKey))
    }
}