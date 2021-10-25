const Page = require('./helpers/page');

Number.prototype._called = {}; // unhandled issue;

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

    describe('and using invalid inputs', async () => {
        beforeEach(async () => {
            await page.click('form button');
        });
        test('the form shows error', async () => {
            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');

            expect(titleError).toEqual('You must provide a value')
            expect(contentError).toEqual('You must provide a value')
        });
    });

    describe('adn using valid inputs', async () => {
        beforeEach(async () => {
            await page.type('.title input', 'My title');
            await page.type('.content input', 'My content');
            await page.click('form button');
        });

        test('Submitting takes user to review page', async () => {
            const confirmText = await page.getContentsOf('form h5');

            expect(confirmText).toEqual('Please confirm your entries')
        });
        test('Submitting then saving takes user to blogs page', async () => {
            await page.click('button.green');
            await page.waitFor('.card');

            const title = await page.getContentsOf('.card-title');
            const content = await page.getContentsOf('p');

            expect(title).toEqual('My title');
            expect(content).toEqual('My content');
        });
    });
});

describe('When are not logged in', async () => {

    test('Should return 401 on create blog request', async () => {
        const createBlogResp = await page.post('/api/blogs/', {
            title: 'Title here',
            content: 'Content here',
        })

        expect(createBlogResp).toHaveProperty('error');
        expect(createBlogResp.error).toEqual('You must log in!');
    });
    test('Should return 401 on get blogs request', async () => {

        const getBlogResp = await page.get('/api/blogs/');

        expect(getBlogResp).toHaveProperty('error');
        expect(getBlogResp.error).toEqual('You must log in!');
    });
});

afterEach(async () => {
    await page.close();
});