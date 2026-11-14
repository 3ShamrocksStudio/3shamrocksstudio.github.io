// Render the 4 style frames: node shoot.js  (run from this folder)
const {chromium} = require('playwright');
const path = require('path');
const names = {1: '01-intro-logo-reveal', 2: '02-lesson-frame', 3: '03-transition', 4: '04-outro'};
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport: {width: 1080, height: 1920}, deviceScaleFactor: 1});
  for (const f of [1, 2, 3, 4]) {
    await p.goto('file://' + path.join(__dirname, 'frames.html') + '?f=' + f);
    await p.waitForSelector('body[data-ready]');
    await p.waitForTimeout(150);
    await p.screenshot({path: path.join(__dirname, '..', names[f] + '.png')});
  }
  await b.close();
})();
