const puppeteer = require('puppeteer');
const sessionFactory = require('./factories/sessionFactory');
const userFactory = require('./factories/userFactory');

let browser, page;
beforeEach(async () => {
    browser = await puppeteer.launch({
        // headless: false // UI
    });
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
});

test('The header has the correct text', async () => {
    const text = await page.$eval('a.brand-logo', el => el.innerHTML);
    expect(text).toEqual('Blogster');
})

test('Clicking the "log in" starts logIn flow', async () => {
    await page.click('.right a');
    const expectedUrlPart = 'accounts.google.com';
    const pageUrl = await page.url();

    expect(pageUrl).toMatch(`/${expectedUrlPart}/`);
});

test('When signed in show logOut button', async () => {
    const user = await userFactory();
    const {sessionString, sig} = sessionFactory(user);

    await page.setCookie({name: 'session.sig', value: sig});
    await page.setCookie({name: 'session', value: sessionString});

    await page.goto('http://localhost:3000');
    await page.waitFor('a[href="/auth/logout"]');
    const buttonText = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);

    expect(buttonText).toEqual('Logout')
});

afterEach(async () => {
    await browser.close();
});