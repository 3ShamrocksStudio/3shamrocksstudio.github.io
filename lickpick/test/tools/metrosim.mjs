// Set the beat (2026-10-22), simulated players. Per take, a player who knows the true beats listens to the click and fixes
// it through the REAL Set-the-beat buttons (meter chips, ÷2 / ×2, Tap tempo with human jitter, Earlier / Later / Flip ½,
// Tap on 1) until the click sits on the true beats, then taps Lock it. Taps are counted. After the lock:
//   grid     the band's beats (bandKey) vs the true beats
//   preview  the drum stem's onsets as rendered + where the preview schedules the stems against your take (Web Audio clock)
//   export   the saved file (take muted, band only): onsets vs the true beats
// Each is median / p95 |error| (ms) over the true beats, drift = mean signed error last quarter - first quarter (ms).
// usage: LPURL=... node metrosim.mjs MEDIA_DIR name[:full][:noexport] [...]   (MEDIA_DIR/truth.json or truth_part.json)
//        env JITTER=ms (default 12), SEED, OUT (json path)
import { boot, addAndScan, openTake, HOOK, L } from "./h.mjs";
import fs from "fs"; import { execFileSync } from "child_process";
const [MD, ...args] = process.argv.slice(2);
const truthF = fs.existsSync(`${MD}/truth.json`) ? `${MD}/truth.json` : `${MD}/truth_part.json`;
const TR = Object.fromEntries(JSON.parse(fs.readFileSync(truthF)).map(t => [t.name, t]));
const JIT = +(process.env.JITTER ?? 12) / 1000; let seed = +(process.env.SEED || 7);
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const gauss = () => { const u = Math.max(1e-9, rnd()), v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const med = a => { const b = a.slice().sort((x, y) => x - y); return b.length ? b[b.length >> 1] : NaN; };
const pct = (a, p) => { const b = a.slice().sort((x, y) => x - y); return b.length ? b[Math.min(b.length - 1, Math.floor(p * b.length))] : NaN; };
const near = (A, t) => { let b = A[0]; for (const x of A) if (Math.abs(x - t) < Math.abs(b - t)) b = x; return b; };
function onsets(x, sr) {
  const H = Math.max(1, Math.round(sr * 0.002)), E = []; for (let i = 0; i + H <= x.length; i += H) { let s = 0; for (let j = i; j < i + H; j++) s += x[j] * x[j]; E.push(s / H); }
  let mx = 0; for (const e of E) if (e > mx) mx = e; const out = []; let last = -1e9;
  for (let i = 3; i < E.length - 8; i++) { const prev = (E[i - 1] + E[i - 2] + E[i - 3]) / 3; if (E[i] > 6 * prev + 1e-12 && E[i] > 2e-4 * mx && i - last > 0.05 * sr / H) { let pk = 0; for (let j = i; j < i + 8; j++) pk = Math.max(pk, E[j]); out.push([i * H / sr, pk]); last = i; } }
  return out;
}
// error of band onsets (take time) vs the truth: for each band beat, the strongest onset within 40 ms is that beat's hit
function score(hits, T, rng) {
  const e = []; for (const h of hits) { if (h < rng[0] || h > rng[1]) continue; const t = near(T, h); if (Math.abs(t - h) < 0.25) e.push([t, h - t]); }
  if (e.length < 4) return null; const a = e.map(x => Math.abs(x[1]) * 1000), q = Math.max(1, e.length >> 2);
  const drift = (e.slice(-q).reduce((s, x) => s + x[1], 0) / q - e.slice(0, q).reduce((s, x) => s + x[1], 0) / q) * 1000;
  return { n: e.length, med: +med(a).toFixed(1), p95: +pct(a, 0.95).toFixed(1), drift: +drift.toFixed(1), signed: +(med(e.map(x => x[1])) * 1000).toFixed(1) };
}
// only real hits count (>= 5% of the loudest onset's energy): ghost transients a few % strong are not where a beat sounds
function hitsNear(ons, beats, off) { const H = [], mx = Math.max(...ons.map(o => o[1])), strong = ons.filter(o => o[1] >= 0.05 * mx); for (const b of beats) { let best = null; for (const [t, pk] of strong) { const tt = t + off; if (Math.abs(tt - b) <= 0.04 && (!best || pk > best[1])) best = [tt, pk]; } if (best) H.push(best[0]); } return H; }
const ROWS = [];
for (const arg of args) {
  const [name, ...flags] = arg.split(":"), full = flags.includes("full"), noexp = flags.includes("noexport"), T = TR[name];
  const row = { name, meter: T.meter || 4, taps: [], ok: false };
  const { b, pg, log } = await boot({ width: 390, init: HOOK });
  const q = (f, a) => pg.evaluate(f, a);
  try {
    await addAndScan(pg, [`${MD}/${name}.webm`]);
    await pg.waitForFunction(() => __ck.clips.some(c => c.status === "done" && __lp.t.pickOf(c)), null, { timeout: 300000 });
    await openTake(pg, 0);
    // rock (a free style), drums forced on, so every take can be measured on its drum hits and saved without Pro
    await q(full => { const c = __lp.t.cur(); c.band = { style: "rock", gain: 0.8, parts: { drums: true, bass: true, keys: true, extra: false }, touched: { drums: true, bass: true, keys: true, extra: true } };
      if (full) { const p = __lp.t.pickOf(c), k = `${c._picks?.key}|${c.pickSel || 0}`; c.pickAdj = c.pickAdj || {}; c.pickAdj[k] = { s: -p.s, e: c.raw.duration - p.e }; } __lp.t.renderStudio(); }, full);
    const tap = async (sel, what) => { await pg.locator(sel).first().click(); row.taps.push(what); await pg.waitForTimeout(250); };
    await tap("#sStage .pb-band", "band");
    await pg.waitForFunction(() => __ck.metro && __lp.q().bandPlaying && document.querySelector("#metro"), null, { timeout: 120000 });
    await pg.waitForTimeout(600);
    const st = () => q(() => { const c = __lp.t.cur(), M = __ck.metro, w = __lp.t.bandWindow(c), P = __lp.t.metroPlan(c); return { B: P.B, kd: P.kd, bpb: P.bpb, meter: M.d.meter, mode: M.d.mode, bpm: __lp.t.lockBpm(c, M.d), w: [w.s, w.e], free: P.free, playing: __lp.q().bandPlaying, now: __lp.t.bandPreview.clock ? __lp.t.bandPreview.clock() : null }; });
    let S = await st(); row.guess = { bpm: S.bpm, meter: S.meter, mode: S.mode };
    const W = S.w, free = (T.free || []).map(([u, v]) => [u - 0.3, v + 0.5]), inFree = t => free.some(([u, v]) => t > u && t < v);
    const TB = T.beats.filter(t => t > W[0] + 0.3 && t < W[1] - 0.3 && !inFree(t)), pT = med(TB.slice(1).map((t, i) => t - TB[i]).filter(x => x < 3));
    const TD = (T.down || []).map(i => T.beats[i]).filter(t => t > W[0] && t < W[1] && !inFree(t));
    const want = { "6/8": "6/8", "12/8": "6/8", "3": "3/4", "6": "6/8" }[String(T.meter)] || "4/4";
    // timed taps on the true beats (or downbeats), on the clock you hear, with human jitter, through the real button
    const timed = async (sel, targets, what) => {
      for (let tries = 0; tries < 2; tries++) {
        S = await st(); const now = S.now ?? -1, nxt = targets.filter(t => t > now + 0.5).slice(0, sel.includes("tap") ? 4 : 1);
        if (!S.playing || nxt.length < (sel.includes("tap") ? 4 : 1)) { await q(() => { const c = __lp.t.cur(); __lp.t.stopBand(); __lp.t.bandPreview(c, 0); }); row.taps.push("play"); await pg.waitForTimeout(900); continue; }
        const J = nxt.map(t => t + gauss() * JIT);
        await q(async ([sel, J]) => { const clk = () => __lp.t.bandPreview.clock ? __lp.t.bandPreview.clock() : -1; for (const x of J) { while (clk() < x) await new Promise(r => setTimeout(r, 1)); document.querySelector(sel)?.click(); await new Promise(r => setTimeout(r, 20)); } }, [sel, J]);
        for (const _ of J) row.taps.push(what); await pg.waitForTimeout(300); return true; }
      return false; };
    let nudges = 0; for (let it = 0; it < 14; it++) {
      S = await st(); const D = S.B.filter(t => t > W[0] + 0.3 && t < W[1] - 0.3 && !inFree(t)), pD = med(D.slice(1).map((t, i) => t - D[i])), r = pT / pD;
      if (S.meter !== want) { await tap(`#metro [data-metro="m:${want}"]`, "meter"); continue; }
      if (Math.abs(r - 1) > 0.012) { if (Math.abs(r - 2) < 0.1) await tap('#metro [data-metro="half"]', "÷2"); else if (Math.abs(r - 0.5) < 0.03) await tap('#metro [data-metro="x2"]', "×2"); else await timed("#metro .mtap", TB, "tap"); continue; }
      const f = med(D.map(t => { let x = (t - near(TB, t)) / pT; return x > 0.5 ? x - 1 : x <= -0.5 ? x + 1 : x; })), eMs = f * pT * 1000;
      if (Math.abs(f) > 0.375) { await tap('#metro [data-metro="flip"]', "flip"); continue; }
      if (Math.abs(f) >= 0.125 || Math.abs(eMs) > 45) { await timed("#metro .mtap", TB, "tap"); continue; }
      // a trained ear hears a click more than ~12 ms off its notes: Earlier / Later, 10 ms a tap
      if (Math.abs(eMs) > 12 && nudges < 6) { for (let k = 0; k < Math.round(Math.abs(eMs) / 10); k++) { await tap(`#metro [data-metro="${eMs > 0 ? "early" : "late"}"]`, eMs > 0 ? "earlier" : "later"); nudges++; } continue; }
      if (TD.length >= 2) { const DS = S.B.filter((t, k) => ((k - S.kd) % S.bpb + S.bpb) % S.bpb === 0 && t > W[0] + 0.3 && t < W[1] - 0.3 && !inFree(t)), okD = DS.filter(t => Math.abs(near(TD, t) - t) < 0.08).length / Math.max(1, DS.length);
        if (okD < 0.8) { await timed('#metro [data-metro="one"]', TD, "on1"); continue; } }
      row.ok = true; break;
    }
    S = await st(); row.before = { bpm: S.bpm, meter: S.meter, mode: S.mode };
    const n0 = await q(() => window.__srcLog.length);
    await tap('#metro [data-metro="lock"]', "lock");
    await pg.waitForFunction(n0 => __lp.q().bandPlaying && !__ck.metro && window.__srcLog.length > n0 + 2, n0, { timeout: 300000 });
    await pg.waitForTimeout(1500);
    // play the locked band from the top, so the preview's schedule is measured on a full run (the lock may come near the end)
    const n0b = await q(() => { const c = __lp.t.cur(); __lp.t.stopBand(); const n = window.__srcLog.length; __lp.t.bandPreview(c, 0); return n; });
    await pg.waitForFunction(n => __lp.q().bandPlaying && __lp.t.bandPreview.map && window.__srcLog.length > n + 1, n0b, { timeout: 300000 }); await pg.waitForTimeout(2500);
    const G = await q(async n0 => { const c = __lp.t.cur(), K = __lp.t.bandKey(c), r = await __lp.t.bandRender(c), S = window.__srcLog.slice(n0), stems = Object.values(r.stems || {});
      // the preview's own map: your take's position 0 plays at t0 - at0 on the audio clock; every band buffer must start there too
      const m = __lp.t.bandPreview.map, zT = m ? m.t0 - m.at0 : null, zs = zT == null ? [] : S.filter(x => x.len > 2 && x.when >= m.t0 - 0.01).map(x => x.when - x.off - zT);
      const d = r.stems?.drums; return { rw: [K.rw.s, K.rw.e], beats: K.A.beats, lock: c.band.lock, sched: zs, sr: d?.sampleRate, drums: d ? Array.from(d.getChannelData(0)) : null, parts: K.parts, style: K.style }; }, n0b);
    const rng = [W[0] + 0.5, W[1] - 0.5], TBf = T.beats.filter(t => !inFree(t));
    row.grid = score(G.beats.filter(t => !inFree(t)), TBf, rng);
    row.schedMs = G.sched.length ? +(Math.max(...G.sched.map(Math.abs)) * 1000).toFixed(2) : null;
    if (G.drums) { const on = onsets(Float32Array.from(G.drums), G.sr), sOff = G.sched.length ? med(G.sched) : 0; row.preview = score(hitsNear(on, G.beats, G.rw[0] + sOff).filter(t => !inFree(t)), TBf, rng); row.renderLat = score(hitsNear(on, G.beats, G.rw[0]), G.beats, rng); }
    row.lock = G.lock; row.style = G.style; row.parts = G.parts;
    if (!noexp) {
      // the save, band only (take muted). drums alone by default (every onset in the file is then a drum hit; bass and keys attacks ramp and blur onsets), FULLMIX=1 = the whole band
      await q(dOnly => { const c = __lp.t.cur(); c.snd = { ...(c.snd || {}), takeOn: false }; __lp.t.exOpts(c).band = true; if (dOnly) c.band.parts = { drums: true, bass: false, keys: false, extra: false }; __lp.t.stopBand(); window.__lpExport(); }, process.env.FULLMIX !== "1");
      await pg.waitForTimeout(1000);
      const dl = pg.waitForEvent("download", { timeout: 900000 }).catch(() => null);
      await pg.locator('[data-act="export-go"]').filter({ visible: true }).first().click(); row.taps.push("save");
      const d = await dl;
      if (d) { const p = `${L}/metrosim_${name}.mp4`; await d.saveAs(p); row.exportName = d.suggestedFilename();
        const raw = execFileSync("ffmpeg", ["-v", "error", "-i", p, "-f", "f32le", "-ac", "1", "-ar", "44100", "-"], { maxBuffer: 1 << 30 });
        const x = new Float32Array(raw.buffer, raw.byteOffset, raw.length >> 2), on = onsets(x, 44100);
        const S0 = await q(() => { const c = __lp.t.cur(); return __lp.t.srcOf(c).ranges[0][0]; });
        row.export = score(hitsNear(on, G.beats, S0).filter(t => !inFree(t)), TBf, rng); row.exportFile = p;
        if (process.env.DUMP) fs.writeFileSync(`${L}/metrosim_${name}_dump.json`, JSON.stringify({ S0, beats: G.beats, on, truth: TBf, drums: G.drums ? onsets(Float32Array.from(G.drums), G.sr).map(([t, pk]) => [t + G.rw[0], pk]) : null })); }
      else row.export = { err: "no download" };
    }
  } catch (err) { row.err = String(err.message || err).slice(0, 300); await pg.screenshot({ path: `${L}/metrosim_${name}_ERR.png` }).catch(() => { }); }
  row.consoleErr = log.console.filter(x => x.startsWith("[error]") && !/favicon|ERR_|net::|Failed to load resource/.test(x)).slice(0, 3); row.pageerr = log.pageerr.slice(0, 3);
  row.fixTaps = row.taps.filter(t => !["band", "lock", "save"].includes(t)).length;
  console.log(JSON.stringify({ name, ok: row.ok, guess: row.guess, before: row.before, taps: row.taps.join(","), grid: row.grid, preview: row.preview, export: row.export, sched: row.schedMs, render: row.renderLat, err: row.err, cerr: row.consoleErr, perr: row.pageerr }));
  ROWS.push(row); await b.close();
}
fs.writeFileSync(process.env.OUT || `${L}/metrosim.json`, JSON.stringify(ROWS, null, 1));
