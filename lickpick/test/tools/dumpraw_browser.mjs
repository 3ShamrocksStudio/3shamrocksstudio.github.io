// scan takes in the real app (browser decode + listening model) and save each take's raw analysis: node dumpraw_browser.mjs OUTDIR file...
import { boot, addAndScan } from "./h.mjs"; import fs from "fs"; import path from "path";
const [out, ...files] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
for (const f of files) { const { b, pg } = await boot({ width: 390 }); await addAndScan(pg, [f]);
  const raw = await pg.evaluate(() => JSON.stringify(__ck.clips[0].raw)); fs.writeFileSync(path.join(out, path.basename(f).replace(/\.\w+$/, "") + ".json"), raw); console.log(path.basename(f), raw.length); await b.close(); }
