// Meter (3 vs 2/4 beats a bar): meterFeats on the app's own grid of every take whose tempo level is right, logistic fit
// on the TUNE split (each set and each class the same total weight), report per set on tune and test. Prints MW.
// usage: SETS="truth.json:rawroot,..." [CACHE=f.json] node mtrain3.mjs
import { loadApp } from "./load.mjs"; import fs from "fs"; import path from "path";
const A = loadApp(process.env.LPHTML), LM = A.LickMusic;
const med = a => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
let rows = []; const cache = process.env.CACHE;
if (cache && fs.existsSync(cache)) rows = JSON.parse(fs.readFileSync(cache));
else { for (const spec of process.env.SETS.split(",")) { const [tf, root] = spec.split(":"); const truth = JSON.parse(fs.readFileSync(tf));
  for (const T of truth) { if (!T.meter || T.kind === "step" || T.kind === "ramp") continue;
    const rp = path.join(root, T.raw || `raw_v3_${T.split}/${T.name}.json`); if (!fs.existsSync(rp)) continue;
    const raw = JSON.parse(fs.readFileSync(rp)); let g = null; try { g = LM.bandGrid(raw, 0, raw.duration); } catch { continue; } if (!g?.pulse) continue;
    const TB = T.beats.filter(t => t <= raw.duration), tb = 60 / med(TB.slice(1).map((t, i) => t - TB[i])); if (Math.abs(Math.log(g.bpm / tb)) > 0.04) continue;
    const f = LM.meterFeats(raw, g.beats); if (!f) continue;
    rows.push({ name: T.name, set: T.set || "synth", split: T.split, fam: T.fam || T.style, y: T.meter === "3" ? 1 : 0, f: f.map(x => +x.toFixed(4)) }); }
  console.error(tf, rows.length); } if (cache) fs.writeFileSync(cache, JSON.stringify(rows)); }
const NF = rows[0].f.length, hsh = s => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
function train(tr, L2) { const cnt = {}; for (const r of tr) { const k = r.set + r.y; cnt[k] = (cnt[k] || 0) + 1; } const nk = Object.keys(cnt).length, w = r => tr.length / nk / cnt[r.set + r.y];
  const W = Array(NF).fill(0); let b = 0; const m = Array(NF + 1).fill(0), v = Array(NF + 1).fill(0);
  for (let it = 1; it <= 3000; it++) { const g = Array(NF + 1).fill(0); let tw = 0; for (const r of tr) { const q = w(r); tw += q; let z = b; r.f.forEach((x, i) => z += W[i] * x); const p = 1 / (1 + Math.exp(-z)), d = q * (p - r.y); r.f.forEach((x, i) => g[i] += d * x); g[NF] += d; }
    for (let i = 0; i <= NF; i++) { const gi = g[i] / tw + (i < NF ? L2 * W[i] : 0); m[i] = 0.9 * m[i] + 0.1 * gi; v[i] = 0.999 * v[i] + 0.001 * gi * gi; const st = 0.02 * (m[i] / (1 - 0.9 ** it)) / (Math.sqrt(v[i] / (1 - 0.999 ** it)) + 1e-8); if (i < NF) W[i] -= st; else b -= st; } }
  return { w: W, b }; }
const pred = (M, r) => { let z = M.b; r.f.forEach((x, i) => z += M.w[i] * x); return z > 0 ? 1 : 0; };
const rep = (M, R) => { const by = {}; for (const r of R) { const k = `${r.set} m${r.y ? 3 : 4}`; by[k] ||= [0, 0]; by[k][1]++; if (pred(M, r) === r.y) by[k][0]++; } return Object.entries(by).sort().map(([k, [a, n]]) => `${k} ${a}/${n}`).join(" | "); };
const tune = rows.filter(r => r.split === "tune"), test = rows.filter(r => r.split === "test");
let best = null; for (const L2 of [1e-3, 1e-2, 3e-2, 1e-1]) { let ok = 0, n = 0; for (const cv of [0, 1]) { const M = train(tune.filter(r => hsh(r.name) % 2 === cv), L2); for (const r of tune.filter(r => hsh(r.name) % 2 !== cv)) { n++; if (pred(M, r) === r.y) ok++; } } console.error("L2", L2, "cv", (ok / n).toFixed(3)); if (!best || ok / n > best.a) best = { a: ok / n, L2 }; }
const M = train(tune, best.L2); console.error("TUNE", rep(M, tune)); console.error("TEST", rep(M, test));
console.log(JSON.stringify({ w: M.w.map(x => +x.toFixed(3)), b: +M.b.toFixed(3) }));
