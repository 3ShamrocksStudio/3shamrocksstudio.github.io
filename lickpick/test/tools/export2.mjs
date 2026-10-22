// Save with the band (take muted in the mixer) and keep the file: the band as EXPORTED. usage: node export.mjs name [full]
import { boot, addAndScan, openTake, M, L, lockIfAsked } from "./h.mjs";
import fs from "fs";
const [name, full] = process.argv.slice(2); fs.mkdirSync(`${L}/export2`, { recursive: true });
const { b, pg, log } = await boot({ width: 412 });
await addAndScan(pg, [`${M}/${name}.webm`]); await pg.waitForTimeout(1000); await openTake(pg);
if (full) await pg.evaluate(() => { const c = __lp.t.cur(), p = __lp.t.pickOf(c), k = `${c._picks?.key}|${c.pickSel || 0}`; c.pickAdj = c.pickAdj || {}; c.pickAdj[k] = { s: -p.s, e: c.raw.duration - p.e }; __lp.t.renderStudio(); });
await pg.locator("#sStage .pb-band").click(); await lockIfAsked(pg); await pg.waitForTimeout(3000);
await pg.locator("#sStage .pb-band").click(); await lockIfAsked(pg); await pg.waitForTimeout(300); await pg.locator("#sStage .pb-band").click(); await lockIfAsked(pg); await pg.waitForTimeout(1500);
// rock is a free style: saving with it needs no Pro. Take muted (the mixer's take switch), band at 100%.
await pg.evaluate((process_env_BAND) => { const c = __lp.t.cur(); c.band.style = "rock"; c.band.gain = 1; if (process_env_BAND === "0") { __lp.t.exOpts(c).band = false; } else c.snd = { ...(c.snd || {}), takeOn: true }; }, process.env.BAND || "1");
const meta = await pg.evaluate(() => { const c = __lp.t.cur(), K = __lp.t.bandKey(c); return { rw: [K.rw.s, K.rw.e], beats: K.A?.beats || [], style: K.style, parts: K.parts, bandOn: __lp.t.exOpts(c).band }; });
const dl = pg.waitForEvent("download", { timeout: 600000 });
await pg.locator('#sBar [data-act="export-open"]').click({ force: true }); await pg.waitForTimeout(1000);
const t0 = Date.now(); await pg.locator('[data-act="export-go"]').filter({ visible: true }).first().click();
const d = await dl; const p = `${L}/export2/${name}_band${process.env.BAND || "1"}${full ? "_full" : ""}.mp4`; await d.saveAs(p);
meta.exportMs = Date.now() - t0; meta.file = p; meta.suggested = d.suggestedFilename(); meta.log = log;
fs.writeFileSync(`${L}/export2/${name}_band${process.env.BAND || "1"}${full ? "_full" : ""}.json`, JSON.stringify(meta));
console.log(name, meta.suggested, meta.exportMs, meta.rw, meta.style, meta.bandOn, log.console.length, log.pageerr.length);
await b.close();
