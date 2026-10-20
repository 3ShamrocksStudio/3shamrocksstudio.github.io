// DOM nodes released after closing the studio (with the band on). usage: LPURL=... node domrel.mjs
import { boot, addAndScan, openTake, M } from "./h.mjs";
const { b, ctx, pg } = await boot({ width: 390 }); const cdp = await ctx.newCDPSession(pg);
const nodes = async () => { await cdp.send("HeapProfiler.collectGarbage"); await pg.waitForTimeout(400); return (await cdp.send("Memory.getDOMCounters")).nodes; };
await addAndScan(pg, [`${M}/t3_rock128.webm`, `${M}/t1_ballad70.webm`]); await pg.waitForTimeout(1500);
const before = await nodes(); await openTake(pg);
await pg.locator("#sStage .pb-band").click(); await pg.waitForFunction(() => __lp.q().bandPlaying, null, { timeout: 120000 }); await pg.waitForTimeout(2000);
await pg.locator('.stepbar [data-sc="band"]').click().catch(() => { }); await pg.waitForTimeout(1200);
const open = await nodes(); await pg.goBack(); await pg.waitForTimeout(1500); const after = await nodes();
console.log(JSON.stringify({ before, open, after, released: after <= before * 1.15 }));
await b.close();
