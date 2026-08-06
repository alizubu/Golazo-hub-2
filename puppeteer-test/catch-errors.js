const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.setCookie({
    name: 'golazo_session',
    value: 'admin',
    domain: '127.0.0.1',
    path: '/',
  });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push('CONSOLE ERROR: ' + msg.text());
    }
  });

  page.on('pageerror', err => {
    errors.push('PAGE ERROR: ' + err.toString());
  });

  console.log('Navigating to /admin...');
  await page.goto('http://127.0.0.1:3000/admin', { waitUntil: 'networkidle2', timeout: 30000 }).catch(e => console.log('Goto timeout', e.message));

  const checkErrorText = async (step) => {
    const text = await page.evaluate(() => document.body.innerText);
    if (text && text.includes('Something went wrong')) {
      console.log(`\n!!! CRASH FOUND AT STEP: ${step} !!!`);
      const errorText = await page.evaluate(() => {
          const el = document.querySelector('.text-red-400');
          return el ? el.innerText : 'No stack trace found in DOM';
      });
      console.log('STACK TRACE:', errorText);
      return true;
    }
    return false;
  };

  if (await checkErrorText('Initial Load')) {
    await browser.close();
    return;
  }

  const tabLabels = ['Overview', 'Players', 'Tournament', 'Matches', 'Trophies', 'Announcements', 'Broadcast', 'Hall of Fame'];
  
  for (const label of tabLabels) {
    console.log(`Clicking tab: ${label}`);
    
    // Find the button containing the label text
    const clicked = await page.evaluate((l) => {
      const spans = Array.from(document.querySelectorAll('span'));
      const span = spans.find(s => s.innerText === l);
      if (span && span.closest('button')) {
        span.closest('button').click();
        return true;
      }
      return false;
    }, label);

    if (clicked) {
      await new Promise(r => setTimeout(r, 2000));
      if (await checkErrorText(`After clicking ${label}`)) {
        console.log('All Errors caught in console:');
        console.log(errors.join('\n'));
        await browser.close();
        return;
      }
    } else {
      console.log(`Could not find button for ${label}`);
    }
  }

  console.log('No crashes found across all tabs.');
  if (errors.length > 0) {
    console.log('Errors caught in console:');
    console.log(errors.join('\n'));
  }

  await browser.close();
})();
