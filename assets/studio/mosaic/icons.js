/* Mosaic v5: rasterises every icon of the brand icon sprites at 640 px (transparent PNG, src/icons/), replacing the
   old 100 to 200 px src/sets rasters. Run from the repo root:  node assets/studio/mosaic/icons.js */
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const OUT = 'assets/studio/mosaic/src/icons';
const SPRITES = [
  ['cr', 'assets/brand-v3/chore-royale/icons.svg', null],
  ['cr', 'assets/studio/marks/cw-icons.svg', null],
  ['fr', 'assets/brand-v3/fairent/icons.svg', null],
  ['rk', 'assets/brand-v3/rk/icons.svg', '#1F5BFF'],   /* currentColor icons: R&K Electric Blue */
];
const PX = 640;
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: PX + 40, height: PX + 40 }, deviceScaleFactor: 1 });
  let n = 0;
  for (const [p, file, col] of SPRITES) {
    const svg = fs.readFileSync(file, 'utf8');
    const ids = [...svg.matchAll(/<symbol id="([^"]+)"/g)].map(m => m[1]);
    await pg.setContent('<!doctype html><html><body style="margin:0;background:transparent">' + svg.replace(/style="display:none"/, 'style="position:absolute;width:0;height:0"') +
      '<div id="h" style="width:' + PX + 'px;height:' + PX + 'px;color:' + (col || '#000') + '"></div></body></html>');
    for (const id of ids) {
      await pg.evaluate(id => { document.getElementById('h').innerHTML = '<svg width="' + 640 + '" height="' + 640 + '" style="display:block"><use href="#' + id + '"/></svg>'; }, id);
      const el = await pg.$('#h');
      await el.screenshot({ path: path.join(OUT, p + '-' + id + '.png'), omitBackground: true });
      n++;
    }
  }
  await b.close();
  console.log('icons', n);
})();
