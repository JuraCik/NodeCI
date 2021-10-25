const puppeteer = require('puppeteer');
const userFactory = require("../factories/userFactory");
const sessionFactory = require("../factories/sessionFactory");

class CustomPage {
    static async build() {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });
        const page = await browser.newPage();
        const customPage = new CustomPage(page);
        return new Proxy(customPage, {
            get: function (target, property) {
                return customPage[property] || browser[property] || page[property]
            }
        })
    }

    constructor(page) {
        this.page = page;
    }

    async login() {
        const user = await userFactory();
        const {sessionString, sig} = sessionFactory(user);

        console.log('sessionString', sessionString);
        console.log('sig', sig);

        await this.page.setCookie({name: 'session.sig', value: sig, domain: 'localhost'});
        await this.page.setCookie({name: 'session', value: sessionString, domain: 'localhost'});

        await this.page.goto('http://localhost:3000/blogs');
        await this.page.waitFor('a[href="/auth/logout"]');
    }

    async getContentsOf(selector) {
        return await this.page.$eval(selector, el => el.innerHTML);
    }

    get(path) {
        return this.page.evaluate(({path}) => {
            return fetch(path, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then(res => res.json());
        }, {path});
    }

    post(path, data) {
        return this.page.evaluate(({path, data}) => {
            return fetch(path, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            }).then(res => res.json());
        }, {path, data});
    }
}

module.exports = CustomPage;