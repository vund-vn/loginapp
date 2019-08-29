const puppeteer = require('puppeteer');

const launchPuppeteer = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--disable-infobars'],
    ignoreDefaultArgs: ['--enable-automation'], // Hack to remove infobar
    defaultViewport: null,
    executablePath: '/Program Files (x86)/Google/Chrome/Application/chrome.exe'
  });
  const browserPages = await browser.pages();
  const page = await browserPages[0];
  await page.goto('https://google.com');
  // await browserPages[0].goto('https://google.com');
}

module.exports = {
  launchPuppeteer
}