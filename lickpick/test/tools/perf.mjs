import { boot, M, L, openTake } from "./h.mjs";
import fs from "fs";
const { b, ctx, pg, log } = await boot({ width: 390 });
const cdp = await ctx.newCDPSession(pg); await cdp.send("Performance.enable");
const mem = async () => { await cdp.send("HeapProfiler.collectGarbage"); await pg.waitForTimeout(300); const m = await cdp.send("Performance.getMetrics"); const g = k => m.metrics.find(x => x.name === k)?.value; const dom = await cdp.send("Memory.getDOMCounters"); return { heapMB: +(g("JSHeapUsedSize") / 1e6).toFixed(1), nodes: dom.nodes, listeners: dom.jsEventListeners, docs: dom.documents }; };
const files = ["t3_rock128", "t1_ballad70", "t6_break110", "t7_silence4_96", "t8_melody84", "t4_punk160", "t2_shuffle92"];
const rows = [{ i: 0, ...(await mem()) }];
for (let i = 1; i <= 20; i++) {
  const f = files[(i - 1) % files.length], t0 = Date.now();
  await pg.setInputFiles("#pick", [`${M}/perf/p${i}_${f}.webm`]);
  await pg.waitForFunction(n => __ck.clips.length >= n && __ck.clips.every(c => !["queued", "listening"].includes(c.status)), i, { timeout: 180000, polling: 250 });
  const ms = Date.now() - t0; const app = await pg.evaluate(() => Math.round(__ck.clips.find(c => c.status === "done" && c.scanMs)?.scanMs || 0));
  rows.push({ i, f, ms, ...(await mem()) }); console.log(JSON.stringify(rows[rows.length - 1]));
}
// 6-minute take: scan time + memory when its band plays (Pick) and over the whole take
const t0 = Date.now(); await pg.setInputFiles("#pick", [`${M}/t9_long6min120.webm`]);
await pg.waitForFunction(() => __ck.clips.every(c => !["queued", "listening"].includes(c.status)), null, { timeout: 300000, polling: 250 });
const long = { wallMs: Date.now() - t0, appMs: await pg.evaluate(() => Math.round(__ck.clips.find(c => /long6/.test(c.name)).scanMs)), afterScan: await mem() };
await pg.waitForTimeout(1500);
const k = await pg.evaluate(() => [...document.querySelectorAll("#list .card")].findIndex(c => /long6min/.test(c.innerText)));
await pg.locator("#list .card").nth(k).click(); await pg.waitForTimeout(2000);
await pg.locator("#sStage .pb-band").click(); await pg.waitForFunction(() => __lp.q().bandPlaying && __lp.q().player.ext, null, { timeout: 120000 }); await pg.waitForTimeout(2000);
long.bandPick = await mem();
await pg.evaluate(() => { const c = __lp.t.cur(), p = __lp.t.pickOf(c), k = `${c._picks?.key}|${c.pickSel || 0}`; c.pickAdj = c.pickAdj || {}; c.pickAdj[k] = { s: -p.s, e: c.raw.duration - p.e }; __lp.t.renderStudio(); });
await pg.locator("#sStage .pb-band").click(); await pg.waitForTimeout(300); const tR = Date.now(); await pg.locator("#sStage .pb-band").click();
await pg.waitForFunction(() => __lp.q().bandPlaying && __lp.q().player.ext, null, { timeout: 300000 }); long.fullBandMs = Date.now() - tR; await pg.waitForTimeout(2000);
long.bandFull = await mem();
// close the studio and see what is released
await pg.locator("#sStage .pb-band").click(); await pg.goBack(); await pg.waitForTimeout(1500); long.afterClose = await mem();
const proc = await pg.evaluate(() => performance.memory ? { used: Math.round(performance.memory.usedJSHeapSize / 1e6), total: Math.round(performance.memory.totalJSHeapSize / 1e6), limit: Math.round(performance.memory.jsHeapSizeLimit / 1e6) } : null);
fs.writeFileSync(`${L}/perf.json`, JSON.stringify({ rows, long, proc, log }, null, 1)); console.log(JSON.stringify({ long, proc }, null, 1));
await b.close();
