// Round-3 band check in a real browser: per take, the band's first-sound latency (tap -> first band sound scheduled to
// play), what the band plays (tempo, meter, 3/4 or 6/8, sections, style, swing) and how its beats sit on the true beats.
// usage: LPMEDIA=dir-with-truth.json+webm LPURL=... node band3.mjs name [name...]
import { boot, addAndScan, openTake, M, L, HOOK } from "./h.mjs";
import fs from "fs";
const truth = JSON.parse(fs.readFileSync(M + "/truth.json")), names = process.argv.slice(2), out = [];
const near = (arr, t) => arr.reduce((b, x) => Math.abs(x - t) < Math.abs(b - t) ? x : b, arr[0]);
for (const T of truth.filter(t => !names.length || names.includes(t.name))) {
  const { b, pg, log } = await boot({ width: 390, init: HOOK }); const row = { name: T.name, fam: T.fam, meterT: T.meter, bpmT: [T.bpm0, T.bpm1] };
  try {
    row.scanMs = await addAndScan(pg, [`${M}/${T.name}.webm`]);
    await pg.waitForFunction(() => __ck.clips.some(c => c.status === "done" && __lp.t.pickOf(c)), null, { timeout: 120000 });
    await openTake(pg);
    // stretch the Pick to the whole take so the band covers every section, then tap the band on
    await pg.evaluate(() => { const c = __lp.t.cur(), p = __lp.t.pickOf(c), k = `${c._picks?.key}|${c.pickSel || 0}`; c.pickAdj = c.pickAdj || {}; c.pickAdj[k] = { s: -p.s, e: c.raw.duration - p.e }; __lp.t.renderStudio(); });
    const n0 = await pg.evaluate(() => window.__srcLog.length), tTap = Date.now();
    await pg.locator("#sStage .pb-band").click();
    await pg.waitForFunction(n0 => window.__srcLog.length > n0 + 1 && __lp.q().bandPlaying, n0, { timeout: 300000 });
    const tFirst = Date.now();
    const lat = await pg.evaluate(n0 => { const S = window.__srcLog.slice(n0), band = S.filter(x => x.len && x.len < 1e4); const f = band[0]; return f ? Math.max(0, f.when - f.now) : null; }, n0);
    row.firstSoundMs = tFirst - tTap + Math.round((lat || 0) * 1000);
    await pg.waitForTimeout(9000);   // past the head -> full switch
    row.r = await pg.evaluate(n0 => { const c = __lp.t.cur(), K = __lp.t.bandKey(c), g = c._grid?.g, S = window.__srcLog.slice(n0);
      return { bpm: K.A?.bpm, meter: K.A?.meter, compound: !!K.A?.compound, swing: K.A?.swing, style: K.style, beats: K.A?.pulse ? K.A.beats : [], rw: [K.rw.s, K.rw.e], sections: g?.sections || null, gmeter: g?.meter,
        nSrc: S.length, heads: S.filter(x => x.len && x.len < 6.5).length, key: c.raw.info.key, playing: __lp.q().bandPlaying }; }, n0);
    const B = row.r.beats, TB = T.beats.filter(t => t > 1 && t < T.dur - 0.5);
    if (B.length > 4) { const e = TB.map(t => Math.abs(near(B, t) - t)).sort((x, y) => x - y); row.grid = { med: +(e[e.length >> 1] * 1000).toFixed(1), p95: +(e[Math.floor(e.length * 0.95)] * 1000).toFixed(1) }; }
  } catch (err) { row.err = String(err.message || err).slice(0, 200); }
  row.console = log.console.filter(x => x.startsWith("[error]")); row.pageerr = log.pageerr; out.push(row);
  console.log(JSON.stringify({ ...row, r: row.r && { ...row.r, beats: row.r.beats.length } }));
  await b.close();
}
fs.writeFileSync(`${L}/band3.json`, JSON.stringify(out, null, 1));
