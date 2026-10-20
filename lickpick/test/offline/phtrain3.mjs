// Beat phase (on the beat / the "and" / a triplet off): collects the 4 phase candidates' features of every take whose
// tempo level is right, labels the candidate that lands on the true beats, and fits a linear softmax on the TUNE split
// (every set the same total weight; L2 chosen on two halves of tune). Prints PHW for index.html and test-split accuracy.
// usage: SETS="truth.json:rawroot,..." node phtrain3.mjs
import { loadApp } from "./load.mjs"; import fs from "fs"; import path from "path";
const A = loadApp(process.env.LPHTML), LM = A.LickMusic; LM._phw(null);
const med = a => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const near = (arr, t) => arr.reduce((b, x) => Math.abs(x - t) < Math.abs(b - t) ? x : b, arr[0]);
let rows = [];
const cache = process.env.CACHE;
if (cache && fs.existsSync(cache)) rows = JSON.parse(fs.readFileSync(cache));
else { for (const spec of process.env.SETS.split(",")) {
  const [tf, root] = spec.split(":"); const truth = JSON.parse(fs.readFileSync(tf));
  for (const T of truth) {
    if (T.kind === "step" || T.kind === "ramp") continue;
    const rp = path.join(root, T.raw || `raw_v3_${T.split}/${T.name}.json`); if (!fs.existsSync(rp)) continue;
    const raw = JSON.parse(fs.readFileSync(rp)); let g = null; try { g = LM.bandGrid(raw, 0, raw.duration); } catch { continue; }
    const PH = LM._ph(), F = LM._phfb(); if (!g || !PH || !F) continue;
    const TB = T.beats.filter(t => t <= raw.duration), P = med(TB.slice(1).map((t, i) => t - TB[i]));
    const fbT = F.fb.map(f => (F.a + f) / F.fr + F.off); const gp = med(fbT.slice(1).map((t, i) => t - fbT[i]));
    if (Math.abs(Math.log(gp / P)) > 0.04) continue;
    const errs = PH.map(p => { const sh = fbT.slice(0, -1).map((t, i) => t + p.ph * (fbT[i + 1] - t)).filter(t => t > 1 && t < raw.duration - 1); return med(sh.map(t => Math.abs(near(TB, t) - t))); });
    const lab = errs.indexOf(Math.min(...errs)); if (errs[lab] > 0.15 * P) continue;
    rows.push({ name: T.name, set: T.set || "synth", split: T.split, fam: T.fam || T.style, lab, pf: PH.map(p => p.pf), errs: errs.map(x => +x.toFixed(3)) });
  } console.error(tf, rows.length); }
  if (cache) fs.writeFileSync(cache, JSON.stringify(rows)); }
const NF = rows[0].pf[0].length, hsh = s => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
function train(tr, L2) { const sets = {}; for (const r of tr) sets[r.set] = (sets[r.set] || 0) + 1; const ns = Object.keys(sets).length, w = r => tr.length / ns / sets[r.set];
  const W = Array(NF).fill(0); W[9] = 1; const m = W.map(() => 0), v = W.map(() => 0);
  for (let it = 1; it <= 3000; it++) { const g = W.map(() => 0); let tw = 0;
    for (const r of tr) { const q = w(r); tw += q; const sc = r.pf.map(f => f.reduce((x, y, i) => x + y * W[i], 0)), mx = Math.max(...sc), ex = sc.map(x => Math.exp(x - mx)), Z = ex.reduce((a, b) => a + b, 0);
      r.pf.forEach((f, c) => { const d = q * (ex[c] / Z - (c === r.lab ? 1 : 0)); f.forEach((x, i) => g[i] += d * x); }); }
    for (let i = 0; i < NF; i++) { const gi = g[i] / tw + L2 * W[i]; m[i] = 0.9 * m[i] + 0.1 * gi; v[i] = 0.999 * v[i] + 0.001 * gi * gi; W[i] -= 0.02 * (m[i] / (1 - 0.9 ** it)) / (Math.sqrt(v[i] / (1 - 0.999 ** it)) + 1e-8); } }
  return W; }
const acc = (W, R) => { const by = {}; for (const r of R) { const k = r.set + "/" + (r.set === "synth" ? r.fam : ""); by[k] ||= [0, 0]; by[k][1]++; const sc = r.pf.map(f => f.reduce((x, y, i) => x + y * (W ? W[i] : 0), 0)); if (sc.indexOf(Math.max(...sc)) === r.lab) by[k][0]++; } return by; };
const tune = rows.filter(r => r.split === "tune"), test = rows.filter(r => r.split === "test");
let bestL2 = 0, bestA = -1;
for (const L2 of [1e-4, 1e-3, 1e-2, 3e-2]) { let ok = 0, n = 0; for (const cv of [0, 1]) { const W = train(tune.filter(r => hsh(r.name) % 2 === cv), L2); for (const [, [a, b]] of Object.entries(acc(W, tune.filter(r => hsh(r.name) % 2 !== cv)))) { ok += a; n += b; } } console.error("L2", L2, "cv acc", (ok / n).toFixed(3)); if (ok / n > bestA) { bestA = ok / n; bestL2 = L2; } }
const W = train(tune, bestL2);
const show = (nm, R) => { const old = acc(null, R), nw = acc(W, R); console.error(nm); for (const k of Object.keys(nw).sort()) console.error(`  ${k.padEnd(22)} DP-phase ${old[k][0]}/${old[k][1]}  learned ${nw[k][0]}/${nw[k][1]}`); };
show("TUNE", tune); show("TEST", test);
console.log(JSON.stringify(W.map(x => +x.toFixed(3))));
