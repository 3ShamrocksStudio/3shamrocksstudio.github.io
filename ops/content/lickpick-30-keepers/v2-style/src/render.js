// Render sting subframes: node render.js <outdir> [fps=90] [dur=6.5]
const {chromium} = require('playwright');
const path = require('path'), fs = require('fs');
const out = process.argv[2], FPS = +(process.argv[3] || 90), DUR = +(process.argv[4] || 6.5), SUB = FPS / 30;
fs.mkdirSync(out, {recursive: true});
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport: {width: 1080, height: 1920}, deviceScaleFactor: 1});
  await p.goto('file://' + path.join(__dirname, 'sting.html'));
  await p.waitForSelector('body[data-ready]');
  const N = Math.round(DUR * FPS);
  for (let i = 0; i < N; i++) {
    await p.evaluate(([t, f]) => render(t, f), [i / FPS, Math.floor(i / SUB)]);
    await p.screenshot({path: path.join(out, String(i).padStart(4, '0') + '.png')});
  }
  await b.close();
})();
