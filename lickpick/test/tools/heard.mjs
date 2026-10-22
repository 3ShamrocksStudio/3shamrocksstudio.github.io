// what "Already in your take" hears, per file (quick + listening model): node heard.mjs file...
import { boot, addAndScan, lockIfAsked } from "./h.mjs";
for (const f of process.argv.slice(2)) { const { b, pg } = await boot({ width: 390 }); await addAndScan(pg, [f]); await pg.waitForTimeout(800);
  const has = await pg.evaluate(() => !!__lp.t.pickOf(__ck.clips[0])); if (!has) { console.log(f.split("/").pop(), "no pick"); await b.close(); continue; }
  await pg.locator("#list .card").first().click(); await pg.waitForTimeout(1200); await pg.locator("#sStage .pb-band").click(); await lockIfAsked(pg);
  await pg.waitForFunction(() => __lp.q().bandPlaying, null, { timeout: 120000 }).catch(() => { }); await pg.locator('.stepbar [data-sc="band"]').click().catch(() => { });
  await pg.waitForFunction(() => { const h = __lp.t.cur().band?.heard; return h && !h.busy && h.deep; }, null, { timeout: 180000 }).catch(() => { });
  const r = await pg.evaluate(() => { const c = __lp.t.cur(), h = c.band?.heard; return { p: h?.p && Object.fromEntries(Object.entries(h.p).filter(([x]) => x !== "feats").map(([k, v]) => [k, typeof v === "number" ? +v.toFixed(3) : v])), lowP: h?.p?.feats?.lowPofLow, parts: c.band.parts, chips: [...document.querySelectorAll(".heardchips [aria-pressed=true]")].map(e => e.innerText.trim()) }; });
  console.log(f.split("/").pop(), JSON.stringify(r)); await b.close(); }
