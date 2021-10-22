const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

test('The header has the correct text', async () => {
    const text = await page.getContentsOf('a.brand-logo');
    expect(text).toEqual('Blogster');
})

test('Clicking the "log in" starts logIn flow', async () => {
    await page.click('.right a');
    const expectedUrlPart = 'accounts.google.com';
    const pageUrl = await page.url();

    expect(pageUrl).toMatch(`/${expectedUrlPart}/`);
});

test('When signed in show logOut button', async () => {

    await page.login();
    const buttonText = await page.getContentsOf('a[href="/auth/logout"]');

    expect(buttonText).toEqual('Logout')
});

afterEach(async () => {
    await page.close();
});