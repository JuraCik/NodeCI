const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

describe('When logged in', async () => {

    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating')
    });

    test('can see create blog form', async () => {
        const titleLabel = await page.getContentsOf('form label');
        expect(titleLabel).toEqual('Blog Title');
    });
});

afterEach(async () => {
    await page.close();
});