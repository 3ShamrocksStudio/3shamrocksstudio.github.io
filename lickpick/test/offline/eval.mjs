// offline regression: the app's bandGrid + takeKey on every dumped raw vs ground truth (same grid metric as the QA metrics.py)
import { loadApp } from "./load.mjs"; import fs from "fs";
const A = loadApp(), LM = A.LickMusic, KEYTHR = +(process.env.KEYTHR || 0.25);
const truth = (process.env.TRUTH ? JSON.parse(fs.readFileSync(process.env.TRUTH)) : [...JSON.parse(fs.readFileSync(new URL("../truth_qa.json", import.meta.url))), ...JSON.parse(fs.readFileSync(new URL("../truth_extra.json", import.meta.url)))]);
const rawPath = n => n.startsWith("gs_") ? `rawgs/${n.slice(3)}_comp_mic.json` : `raw/${n}.json`;
const QUIET = !!process.env.QUIET;
const only = process.argv.slice(2), NOTE = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"], NI = Object.fromEntries(NOTE.map((n, i) => [n, i])); NI["Db"] = 1; NI["D#"] = 3; NI["G#"] = 8; NI["A#"] = 10; NI["Gb"] = 6;
const parseKey = k => ({ r: NI[k.replace(/m$/, "")], minor: k.endsWith("m") });
const med = a => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y), i = (s.length - 1) * p / 100, lo = Math.floor(i); return s[lo] + (s[Math.min(s.length - 1, lo + 1)] - s[lo]) * (i - lo); };
const rows = [];
for (const T of truth) {
  if (only.length && !only.some(o => T.name.startsWith(o))) continue;
  const raw = JSON.parse(fs.readFileSync(rawPath(T.name))); const dur = raw.duration;
  const t0 = Date.now(); let g = null; try { g = LM.bandGrid(raw, 0, dur); } catch (e) { console.log(T.name, "ERR", e.stack); }
  const ms = Date.now() - t0;
  let An = null; try { if (g?.pulse) An = LM.analyze(raw, 0, dur, { beats: g.beats }); } catch (e) { }
  const tk = LM.takeKey(raw, g?.pulse ? g.beats : null);
  const tb = T.beats, P = 60 / T.bpm0, trueBpm = 60 / med(tb.slice(1).map((x, i) => x - tb[i]));
  let B = tb.filter(t => t >= 1 && t <= dur - 0.3 && t >= (T.played_from ? T.played_from + 0.5 : 0));
  const gb = g?.pulse ? g.beats : [];
  let G = null;
  if (gb.length > 4) {
    const e = B.map(t => { let bj = 0, bd = 1e9; for (const x of gb) { const d = Math.abs(x - t); if (d < bd) { bd = d; bj = x; } } return bj - t; }), a = e.map(Math.abs);
    let ev = 0, run = 0; for (const x of a.map(v => v > 0.05)) { if (x) run++; else { if (run >= 4) ev++; run = 0; } } if (run >= 4) ev++;
    G = { med: +(med(a) * 1000).toFixed(1), p95: +(pct(a, 95) * 1000).toFixed(1), lost: ev, sgn: +(med(e) * 1000).toFixed(1) };
  }
  const ratio = g?.pulse ? g.bpm / trueBpm : 0;
  const tempoOK = Math.abs(ratio - 1) < 0.04, tempoHD = tempoOK || Math.abs(ratio - 2) < 0.08 || Math.abs(ratio - 0.5) < 0.02;
  const tr = parseKey(T.key); let keyRes = "-";
  if (tk && tk.key != null) {
    const same = tk.key === tr.r && tk.minor === tr.minor, rel = tk.minor !== tr.minor && ((tr.minor ? (tr.r + 3) % 12 : (tr.r + 9) % 12) === tk.key);
    keyRes = same ? "ok" : rel ? "rel" : "WRONG";
  }
  const sure = tk && tk.conf >= KEYTHR, keyOK = !sure || keyRes === "ok" || keyRes === "rel";
  const kname = tk?.key != null ? NOTE[tk.key] + (tk.minor ? "m" : "") : "-";
  const r = { name: T.name, true: `${Math.round(trueBpm)} ${T.key}`, bpm: g?.pulse ? +g.bpm.toFixed(1) : null, ratio: +ratio.toFixed(2), tempoOK, tempoHD, steady: g?.steady, G, gridOK: !!G && G.med < 15 && G.p95 < 40 && G.lost === 0,
    key: `${kname} c${tk?.conf}`, kd: tk, keyRes, sure, keyOK, swing: An ? +(+An.swing).toFixed(2) : null, meter: An?.meter, feel: g?.feel, scanKey: raw.info?.key, ms };
  rows.push(r);
  if (!QUIET) console.log(`${r.name.padEnd(18)} ${r.true.padEnd(9)} bpm ${String(r.bpm).padEnd(6)} x${r.ratio} ${tempoOK ? "T✓" : "T✗"} | grid ${G ? `med ${G.med} p95 ${G.p95} lost ${G.lost} sgn ${G.sgn}` : "none"} ${r.gridOK ? "G✓" : "G✗"} | key ${r.key.padEnd(10)} ${keyRes} ${keyOK ? "K✓" : "K✗"} | sw ${r.swing} m${r.meter} ${r.feel ?? ""} | ${ms}ms`);
}
const n = rows.length; const gr = rows.filter(r => r.G); console.log(`TEMPO ${rows.filter(r => r.tempoOK).length}/${n} (half/double ok ${rows.filter(r => r.tempoHD).length})  GRID ${rows.filter(r => r.gridOK).length}/${n}  KEY ${rows.filter(r => r.keyOK).length}/${n}  sureKeys ${rows.filter(r => r.sure && r.keyOK).length}`);
fs.writeFileSync(process.env.OUT || "eval_last.json", JSON.stringify(rows, null, 1));
