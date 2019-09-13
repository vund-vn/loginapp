const puppeteer = require('puppeteer');

let browser = null;

const launchPuppeteer = async (initialUrl) => {
  browser = await puppeteer.launch({
    headless: false,
    args: ['--disable-infobars', '--window-size=1920,1040'],
    ignoreDefaultArgs: ['--enable-automation'], // Hack to remove infobar
    defaultViewport: null,
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
  });
  const browserPages = await browser.pages();
  const page = await browserPages[0];
  await page.goto(initialUrl);
}

const closePuppeteer = () => {
  if(browser){
    browser.close();
  }
}

module.exports = {
  launchPuppeteer,
  closePuppeteer
}