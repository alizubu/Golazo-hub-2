const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => {
    console.log('BROWSER CONSOLE:', msg.type(), msg.text());
  });
  page.on('pageerror', error => {
    console.log('PAGE EXCEPTION:', error.message);
  });
  await page.goto('http://127.0.0.1:3000/admin');
  await new Promise(r => setTimeout(r, 2000));
  const elements = await page.$$('button');
  for (const el of elements) {
    const text = await page.evaluate(e => e.textContent, el);
    if (text && text.includes('Broadcast')) {
      await el.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
})();
