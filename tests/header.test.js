const puppeteer = require('puppeteer');

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

afterEach(async () => {
    await browser.close();
});