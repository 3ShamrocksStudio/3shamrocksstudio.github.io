// node cover.js <index.html> <t> <out.png>  -> one full-res PNG frame
const { chromium } = require('playwright'); const path = require('path');
(async () => { const [h, t, out] = process.argv.slice(2); const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); await p.goto('file://' + path.resolve(h));
  await p.evaluate(() => document.fonts.ready); await p.evaluate(t => window.seek(t), parseFloat(t));
  await p.screenshot({ path: out }); await b.close(); console.log('cover', out); })();
