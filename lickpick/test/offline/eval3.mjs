// Round-3 offline evaluation: the app's own bandGrid / analyze / takeKey on every take of a truth file (synthetic gen_v3
// sets or the real sets from real_truth.py), with tempo level, grid error at the detected level, beat phase, meter,
// tempo-section re-lock, swing and key (precision at the confidence threshold).
// usage: TRUTH=truth.json RAWROOT=dir [SPLIT=tune|test] [LPHTML=app.html] [OUT=rows.json] node eval3.mjs [name-prefix...]
import { loadApp } from "./load.mjs"; import fs from "fs"; import path from "path";
const A = loadApp(process.env.LPHTML), LM = A.LickMusic;
const truth = JSON.parse(fs.readFileSync(process.env.TRUTH)), ROOT = process.env.RAWROOT, SPLIT = process.env.SPLIT, QUIET = !!process.env.QUIET;
const only = process.argv.slice(2);
const NI = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 }, NOTE = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const med = a => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : NaN; };
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y), i = (s.length - 1) * p / 100, lo = Math.floor(i); return s[lo] + ((s[Math.min(s.length - 1, lo + 1)] ?? s[lo]) - s[lo]) * (i - lo); };
const nearest = (arr, t) => { let lo = 0, hi = arr.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (arr[m] < t) lo = m; else hi = m; } return Math.abs(arr[lo] - t) < Math.abs(arr[hi] - t) ? arr[lo] : arr[hi]; };
const rows = [];
for (const T of truth) {
  if (SPLIT && T.split !== SPLIT) continue;
  if (only.length && !only.some(o => T.name.startsWith(o) || (T.fam || T.style || "").startsWith(o))) continue;
  const rp = path.join(ROOT, T.raw || `raw_v3_${T.split}/${T.name}.json`); if (!fs.existsSync(rp)) continue;
  const raw = JSON.parse(fs.readFileSync(rp)), dur = raw.duration;
  let g = null, An = null, tk = null; const t0 = Date.now();
  try { g = LM.bandGrid(raw, 0, dur); } catch (e) { console.log(T.name, "ERR grid", e.message); }
  const ms = Date.now() - t0;
  try { if (g?.pulse) An = LM.analyze(raw, 0, dur, { beats: g.beats, meter: g.meter, compound: g.compound }); } catch (e) { console.log(T.name, "ERR an", e.message); }
  try { tk = LM.takeKey(raw, g?.pulse ? g.beats : null); } catch (e) { console.log(T.name, "ERR key", e.message); }
  const TB = T.beats.filter(t => t <= dur - 0.2), tibi = TB.slice(1).map((t, i) => t - TB[i]);
  const steadyT = !(T.kind === "step" || T.kind === "ramp");
  // truth tempo: the first section (or the whole take)
  const tbpm = 60 / med(T.kind === "step" ? tibi.filter((_, i) => TB[i] < T.change - 1) : tibi);
  const meterT = T.meter === "6/8" ? "6/8" : T.meter ? +T.meter : null;
  const r = { name: T.name, set: T.set || "synth", fam: T.fam || T.style, kind: T.kind || "steady", meterT, tbpm: +tbpm.toFixed(1), ms };
  if (g?.pulse) {
    const gb = g.beats; let ratio = 60 / med(gb.slice(1).map((t, i) => t - gb[i]).filter((_, i) => T.kind !== "step" || gb[i] < T.change - 1)) / tbpm;
    r.bpm = +g.bpm.toFixed(1); r.ratio = +ratio.toFixed(3);
    r.lvl = Math.abs(ratio - 1) < 0.04 ? 1 : Math.abs(ratio - 2) < 0.08 ? 2 : Math.abs(ratio - 0.5) < 0.02 ? 0.5 : Math.abs(ratio - 3) < 0.12 ? 3 : Math.abs(ratio - 1 / 3) < 0.015 ? 1 / 3 : Math.abs(ratio - 1.5) < 0.06 ? 1.5 : Math.abs(ratio - 2 / 3) < 0.03 ? 2 / 3 : 0;
    // grid error at the detected level: reference = truth beats (x1), truth beats + midpoints (x2), every truth beat for x0.5 (measured from the band's beats)
    let ref = null; if (r.lvl === 1) ref = TB; else if (r.lvl === 2) ref = TB.flatMap((t, i) => i + 1 < TB.length ? [t, (t + TB[i + 1]) / 2] : [t]); else if (r.lvl === 3) ref = TB.flatMap((t, i) => i + 1 < TB.length ? [t, t + (TB[i + 1] - t) / 3, t + 2 * (TB[i + 1] - t) / 3] : [t]);
    const lo = Math.max(1, T.played_from || 0), hi = dur - 0.3;
    let err = null;
    if (ref) { const q = ref.filter(t => t >= lo && t <= hi); err = q.map(t => nearest(gb, t) - t); r.errT = q; }
    else if (r.lvl === 0.5 || r.lvl === 1 / 3) { const q = gb.filter(t => t >= lo && t <= hi); err = q.map(t => t - nearest(TB, t)); r.errT = q; }
    if (err && err.length > 4) { const a = err.map(Math.abs); let ev = 0, run = 0; for (const x of a.map(v => v > 0.05)) { if (x) run++; else { if (run >= 4) ev++; run = 0; } } if (run >= 4) ev++;
      const P = 60 / tbpm / (r.lvl || 1);
      r.G = { med: +(med(a) * 1000).toFixed(1), p95: +(pct(a, 95) * 1000).toFixed(1), lost: ev, sgn: +(med(err) * 1000).toFixed(1), onAnd: +(a.filter(x => Math.abs(x - P / 2) < 0.07 * P + 0.02).length / a.length).toFixed(2) };
      r.err = err.map(x => +x.toFixed(4)); }
    // tempo sections: bars after the change until the grid is back within 40 ms for 4 beats in a row
    if (T.kind === "step" && err) { const tc = T.change, bar = (T.meter === "3" ? 3 : 4) * 60 / T.bpm1; let lock = null;
      for (let i = 0; i < r.errT.length; i++) { if (r.errT[i] < tc) continue; if (err.slice(i, i + 4).length === 4 && err.slice(i, i + 4).every(x => Math.abs(x) < 0.04)) { lock = r.errT[i]; break; } }
      r.relockBars = lock == null ? 99 : +Math.max(0, (lock - tc) / bar).toFixed(2);
      const after = gb.filter(t => t > tc + 2 * bar); if (after.length > 6) { const b2 = 60 / med(after.slice(1).map((t, i) => t - after[i])); r.bpm2 = +b2.toFixed(1); r.ratio2 = +(b2 / T.bpm1).toFixed(3); } }
  }
  r.steadyT = steadyT;
  r.meter = g?.pulse ? (g.meter || An?.meter || 4) : null; r.meterA = An?.meter ?? null; r.compound = !!g?.compound;
  r.swing = An ? +(+An.swing).toFixed(2) : null; r.swingT = !!T.swing; r.feel = g?.feel; r.style = g?.style || null;
  if (T.key) { const kr = NI[T.key.replace(/m$/, "")], km = T.key.endsWith("m"); r.keyT = T.key;
    if (tk && tk.key != null) { r.key = NOTE[tk.key] + (tk.minor ? "m" : ""); r.conf = tk.conf; const same = tk.key === kr && tk.minor === km, rel = tk.minor !== km && (km ? (kr + 3) % 12 : (kr + 9) % 12) === tk.key;
      r.keyRes = same ? "ok" : rel ? "rel" : "wrong"; r.kd = tk; } else r.keyRes = "none"; }
  rows.push(r);
  if (!QUIET) console.log(`${r.name.padEnd(28)} ${String(r.meterT).padEnd(3)} ${String(r.tbpm).padEnd(6)} -> ${String(r.bpm).padEnd(6)} x${r.lvl ?? "-"} m${r.meter}${r.compound ? "c" : ""} | ${r.G ? `med ${r.G.med} p95 ${r.G.p95} lost ${r.G.lost} and ${r.G.onAnd}` : "no grid"}${r.relockBars != null ? ` relock ${r.relockBars} bars x2 ${r.ratio2}` : ""} | key ${r.keyT ?? "-"} ${r.key ?? ""} c${r.conf ?? ""} ${r.keyRes ?? ""} | sw ${r.swing} ${r.swingT ? "T" : ""}`);
}
fs.writeFileSync(process.env.OUT || "eval3_last.json", JSON.stringify(rows.map(r => ({ ...r, err: undefined, errT: undefined }))));
// summary
const by = (k, f = () => true) => { const m = {}; for (const r of rows.filter(f)) (m[k(r)] ||= []).push(r); return m; };
const valid = r => r.lvl === 1 || ((r.meterT === 4 || r.meterT === 2 || r.meterT == null) && (r.lvl === 2 || r.lvl === 0.5));
console.log("\nTEMPO (right | valid incl. half/double for duple) and GRID on steady takes at a right/valid level");
for (const [k, R] of Object.entries(by(r => `${r.set}/${r.fam}`))) {
  const st = R.filter(r => r.steadyT && r.G && valid(r)), gm = st.map(r => r.G.med), gp = st.map(r => r.G.p95);
  console.log(`${k.padEnd(30)} n${String(R.length).padEnd(4)} right ${R.filter(r => r.lvl === 1).length} valid ${R.filter(valid).length} (${(100 * R.filter(valid).length / R.length).toFixed(0)}%) | grid med-of-med ${gm.length ? med(gm).toFixed(1) : "-"} p95-of-p95 ${gp.length ? pct(gp, 95).toFixed(1) : "-"} gridOK ${st.filter(r => r.G.med < 15 && r.G.p95 < 40 && !r.G.lost).length}/${st.length} onAnd>0.5: ${R.filter(r => r.G?.onAnd > 0.5).length}`);
}
const all = rows, v = all.filter(valid).length; console.log(`ALL n${all.length} right ${all.filter(r => r.lvl === 1).length} valid ${v} (${(100 * v / all.length).toFixed(1)}%)`);
const st = all.filter(r => r.steadyT && r.G && valid(r)); console.log(`GRID steady valid n${st.length}: median of medians ${med(st.map(r => r.G.med)).toFixed(1)} ms, median p95 ${med(st.map(r => r.G.p95)).toFixed(1)}, takes OK (med<15,p95<40,no lost) ${st.filter(r => r.G.med < 15 && r.G.p95 < 40 && !r.G.lost).length}/${st.length}`);
const mt = all.filter(r => r.meterT && r.meter); if (mt.length) { const mm = r => r.meterT === "6/8" ? (r.compound ? "6/8" : "x") : r.meterT === 3 ? 3 : 4, md = r => r.compound ? "6/8" : r.meter === 3 ? 3 : 4;
  const cm = {}; for (const r of mt) { const k = `${mm(r)}->${md(r)}`; cm[k] = (cm[k] || 0) + 1; } console.log("METER", JSON.stringify(cm), `acc ${(100 * mt.filter(r => String(mm(r)) === String(md(r))).length / mt.length).toFixed(1)}%`); }
const sec = all.filter(r => r.relockBars != null); if (sec.length) console.log(`SECTIONS n${sec.length} relock<=2 bars ${sec.filter(r => r.relockBars <= 2).length} median ${med(sec.map(r => r.relockBars))} | 2nd tempo right ${sec.filter(r => Math.abs(r.ratio2 / (r.lvl || 1) - 1) < 0.04).length}`);
const sw = all.filter(r => r.swing != null); if (sw.length) console.log(`SWING detected on swung ${sw.filter(r => r.swingT && r.swing > 0.58).length}/${sw.filter(r => r.swingT).length}, false on straight ${sw.filter(r => !r.swingT && r.swing > 0.58).length}/${sw.filter(r => !r.swingT).length}`);
const ky = all.filter(r => r.keyT); if (ky.length) { for (const thr of [0.5, 0.7, 0.85, 0.9, 0.95]) { const s = ky.filter(r => r.conf >= thr); console.log(`KEY thr ${thr}: sure ${s.length}/${ky.length} exact ${s.filter(r => r.keyRes === "ok").length} +rel ${s.filter(r => r.keyRes === "ok" || r.keyRes === "rel").length} precision ${(100 * s.filter(r => r.keyRes === "ok").length / (s.length || 1)).toFixed(1)}% (+rel ${(100 * s.filter(r => r.keyRes !== "wrong").length / (s.length || 1)).toFixed(1)}%)`); }
  console.log(`KEY top-1 exact ${ky.filter(r => r.keyRes === "ok").length}/${ky.length}, +rel ${ky.filter(r => r.keyRes !== "wrong" && r.keyRes !== "none").length}`); }
