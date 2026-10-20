// Band timing vs ground truth, on the LIVE app. usage: node band.mjs name [name...]
import { boot, addAndScan, openTake, M, L, shot, HOOK } from "./h.mjs";
import fs from "fs";
const truth = JSON.parse(fs.readFileSync(M + "/truth.json"));
const names = process.argv.slice(2);
const out = [];
for (const T of truth.filter(t => !names.length || names.includes(t.name))) {
  const { b, pg, log } = await boot({ width: 390, init: HOOK });
  const row = { name: T.name, trueKey: T.key, bpmTrue: [T.bpm0, +T.bpm1.toFixed(1)] };
  try {
    row.scanMs = await addAndScan(pg, [`${M}/${T.name}.webm`]);
    await pg.waitForFunction(() => __ck.clips.some(c => c.status === "done" && __lp.t.pickOf(c)), null, { timeout: 120000 });
    Object.assign(row, await pg.evaluate(() => { const c = __ck.clips[0], p = __lp.t.pickOf(c); return { appKey: c.raw.info.key, appTempo: c.raw.info.tempo, pick: [+p.s.toFixed(2), +p.e.toFixed(2)], scanMsApp: c.scanMs }; }));
    await openTake(pg);
    // 1) band ON from the player (the real button), Pick window
    await pg.locator("#sStage .pb-band").click();
    await pg.waitForFunction(() => window.__srcLog.length >= 2 && __lp.q().bandPlaying, null, { timeout: 120000 });
    await pg.waitForTimeout(1500);
    // A/V sync: picture vs the heard sound, while the band plays (ms, + = picture ahead)
    row.av = await pg.evaluate(async () => { const { player, video } = __lp.q(), c = __lp.t.cur(), w = __lp.t.bandWindow(c), d = [];
      for (let i = 0; i < 24; i++) { await new Promise(r => setTimeout(r, 250)); if (!player.ext) break; d.push((video.currentTime - (w.s + player.ext())) * 1000); }
      const a = d.map(Math.abs).sort((x, y) => x - y); return { n: d.length, med: +(a[a.length >> 1] || 0).toFixed(0), max: +(a[a.length - 1] || 0).toFixed(0), muted: video.muted, paused: video.paused }; });
    await shot(pg, `band-${T.name}-playing`);
    // 2) stretch the Pick to the whole take (what many "+1 bar" taps do) and restart the band: band covers the whole take
    await pg.evaluate(() => { const c = __lp.t.cur(), p = __lp.t.pickOf(c), k = `${c._picks?.key}|${c.pickSel || 0}`; c.pickAdj = c.pickAdj || {}; c.pickAdj[k] = { s: -p.s, e: c.raw.duration - p.e }; __lp.t.renderStudio(); });
    await pg.locator("#sStage .pb-band").click(); await pg.waitForTimeout(300);   // off
    const n0 = await pg.evaluate(() => window.__srcLog.length);
    const tR = Date.now();
    await pg.locator("#sStage .pb-band").click();                                 // on, full take
    await pg.waitForFunction(n0 => window.__srcLog.length > n0 + 1 && __lp.q().bandPlaying, n0, { timeout: 300000 });
    row.renderFullMs = Date.now() - tR;
    await pg.waitForTimeout(800);
    const r = await pg.evaluate(async (n0) => {
      const c = __lp.t.cur(), K = __lp.t.bandKey(c), res = await __lp.t.bandRender(c), S = window.__srcLog.slice(n0);
      const take = S.find(x => Math.abs(x.len - (K.rw.e - K.rw.s)) < 0.6 && !Object.values(res.stems || {}).includes(x.buf) && x.buf !== res.buffer);
      const drumsLog = S.find(x => x.buf === res.stems?.drums);
      const tk = __lp.t.takeKeyOf(c), g = c._grid?.g;
      // drum onsets
      const onsets = buf => { if (!buf) return []; const sr = buf.sampleRate, n = buf.length, ch = [...Array(buf.numberOfChannels)].map((_, i) => buf.getChannelData(i)), H = Math.round(sr * 0.004), E = [];
        for (let i = 0; i + H < n; i += H) { let m = 0; for (let k = i; k < i + H; k++) { let v = 0; for (const d of ch) v += d[k]; m += v * v; } E.push(m); }
        const on = []; for (let i = 3; i < E.length - 8; i++) { const prev = (E[i - 1] + E[i - 2] + E[i - 3]) / 3; if (E[i] > 5 * prev + 1e-7 && E[i] > 1e-5) { if (on.length && i * 0.004 - on[on.length - 1][0] < 0.05) continue; let pk = 0; for (let j = i; j < i + 8; j++) pk = Math.max(pk, E[j]); on.push([+(i * 0.004).toFixed(4), pk]); } } return on; };
      // chroma of the harmonic stems
      const chroma = bufs => { bufs = bufs.filter(Boolean); if (!bufs.length) return null; const sr = bufs[0].sampleRate, N = 8192, out = new Array(12).fill(0); const re = new Float64Array(N), im = new Float64Array(N);
        const fft = () => { for (let i = 1, j = 0; i < N; i++) { let bit = N >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
          for (let len = 2; len <= N; len <<= 1) { const ang = -2 * Math.PI / len; for (let i = 0; i < N; i += len) for (let k = 0; k < len / 2; k++) { const wr = Math.cos(ang * k), wi = Math.sin(ang * k), a = i + k, b2 = a + len / 2, xr = re[b2] * wr - im[b2] * wi, xi = re[b2] * wi + im[b2] * wr; re[b2] = re[a] - xr; im[b2] = im[a] - xi; re[a] += xr; im[a] += xi; } } };
        const len = Math.min(...bufs.map(x => x.length)); let frames = 0;
        for (let s = 0; s + N < len && frames < 120; s += Math.max(N, Math.floor(len / 120))) { for (let i = 0; i < N; i++) { let v = 0; for (const bf of bufs) v += bf.getChannelData(0)[s + i]; re[i] = v * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / N)); im[i] = 0; } fft(); frames++;
          for (let k = 1; k < N / 2; k++) { const f = k * sr / N; if (f < 55 || f > 2000) continue; const pc = ((Math.round(12 * Math.log2(f / 440)) % 12) + 12 + 9) % 12; out[pc] += re[k] * re[k] + im[k] * im[k]; } }
        const t = out.reduce((a, b) => a + b, 0) || 1; return out.map(v => v / t); };
      const st = res.stems || {};
      return {
        rw: [K.rw.s, K.rw.e], bandBeats: K.A?.pulse ? K.A.beats : [], bpm: K.A?.bpm, pulse: !!K.A?.pulse, style: K.style, parts: K.parts,
        harmony: (K.harmony || []).map(h => h.name), hk: K.harmony ? [K.harmony.key, K.harmony.minor] : null,
        takeKey: tk, grid: g ? { bpm: g.bpm, steady: g.steady, clarity: g.clarity, reg: g.reg, n: g.beats.length, beats: g.beats } : null,
        drumOn: onsets(st.drums), drumLen: st.drums?.duration, chroma: chroma([st.bass, st.keys, st.extra]),
        sched: { takeWhen: take?.when, takeOff: take?.off, drumWhen: drumsLog?.when, drumOff: drumsLog?.off, nLogged: S.length },
        stems: Object.keys(st), mem: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : null };
    }, n0);
    Object.assign(row, { r });
  } catch (err) { row.err = String(err.message || err).slice(0, 300); await shot(pg, `band-${T.name}-ERR`).catch(() => { }); }
  row.log = log; out.push(row);
  fs.writeFileSync(`${L}/band_raw_${names.join("_") || "all"}.json`, JSON.stringify(out));
  console.log(T.name, row.err || "ok", row.scanMs, row.renderFullMs);
  await b.close();
}
