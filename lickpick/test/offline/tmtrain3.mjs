// Trains the tempo-level ranker (TM in index.html): softmax over each take's candidate levels, score = linear + 6 tanh
// units, on the TUNE split only (synthetic gen_v3 tune + GuitarSet players 00-02 + Ballroom/GTZAN even items); every set
// gets the same total weight. Reports exact-level accuracy per set on tune and on the held-out test split.
// usage: node tmtrain3.mjs feats.json[,feats2.json] [init-from-app=1] > TM.json   (stderr: report)
import fs from "fs"; import { loadApp } from "./load.mjs";
const rows = process.argv[2].split(",").flatMap(f => JSON.parse(fs.readFileSync(f)));
const NF = rows[0].C[0].F.length, H = 6, L2 = +(process.env.L2 || 3e-3), IT = +(process.env.IT || 2500), SEED = +(process.env.SEED || 7);
let rs = SEED; const rnd = () => { rs = (rs * 1103515245 + 12345) % 2147483648; return rs / 2147483648; };
const init = () => { if (process.argv[3] !== "0") { const T = loadApp().LickMusic._tm(); return { W1: T.W1.map(r => Array.from({ length: NF }, (_, i) => r[i] ?? 0)), b1: [...T.b1], w2: [...T.w2], lin: Array.from({ length: NF }, (_, i) => T.lin[i] ?? 0) }; }
  return { W1: Array.from({ length: H }, () => Array.from({ length: NF }, () => (rnd() - 0.5) * 0.4)), b1: Array(H).fill(0), w2: Array.from({ length: H }, () => (rnd() - 0.5) * 0.4), lin: Array(NF).fill(0) }; };
const score = (M, x) => { let s = 0; const hs = []; for (let j = 0; j < H; j++) { let z = M.b1[j]; for (let i = 0; i < NF; i++) z += M.W1[j][i] * x[i]; const h = Math.tanh(z); hs.push(h); s += M.w2[j] * h; } for (let i = 0; i < NF; i++) s += M.lin[i] * x[i]; return [s, hs]; };
const hsh = s => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
const CV = process.env.CV;   // CV=0|1: train on one half of the tune split, report on the other half (choosing L2 without the test split)
let tr = rows.filter(r => r.split === "tune" && r.lab >= 0), te = rows.filter(r => r.split === "test");
if (CV != null) { te = rows.filter(r => r.split === "tune" && hsh(r.name) % 2 !== +CV); tr = tr.filter(r => hsh(r.name) % 2 === +CV); }
const setW = {}; for (const r of tr) setW[r.set] = (setW[r.set] || 0) + 1; const nSets = Object.keys(setW).length;
const wOf = r => tr.length / nSets / setW[r.set];
const acc = (M, R) => { const by = {}; for (const r of R) { const k = r.set; by[k] ||= [0, 0]; by[k][1]++; const sc = r.C.map(c => score(M, c.F)[0]); const p = sc.indexOf(Math.max(...sc)); if (p === r.lab) by[k][0]++; } return Object.fromEntries(Object.entries(by).map(([k, [a, n]]) => [k, `${a}/${n} ${(100 * a / n).toFixed(1)}%`])); };
const M = init(); const flat = () => [...M.W1.flat(), ...M.b1, ...M.w2, ...M.lin];
const setFlat = v => { let k = 0; for (let j = 0; j < H; j++) for (let i = 0; i < NF; i++) M.W1[j][i] = v[k++]; for (let j = 0; j < H; j++) M.b1[j] = v[k++]; for (let j = 0; j < H; j++) M.w2[j] = v[k++]; for (let i = 0; i < NF; i++) M.lin[i] = v[k++]; };
console.error("before tune", JSON.stringify(acc(M, tr.concat(rows.filter(r => r.split === "tune" && r.lab < 0)))), "\nbefore test", JSON.stringify(acc(M, te)));
let P = flat(); const m = P.map(() => 0), v2 = P.map(() => 0), lr = 0.01;
for (let it = 1; it <= IT; it++) {
  const g = P.map(() => 0); let loss = 0, W = 0;
  for (const r of tr) { const w = wOf(r); W += w; const out = r.C.map(c => score(M, c.F)), sc = out.map(o => o[0]), mx = Math.max(...sc), ex = sc.map(s => Math.exp(s - mx)), Z = ex.reduce((a, b) => a + b, 0);
    loss -= w * Math.log(ex[r.lab] / Z);
    r.C.forEach((c, ci) => { const d = w * (ex[ci] / Z - (ci === r.lab ? 1 : 0)), hs = out[ci][1]; let k = 0;
      for (let j = 0; j < H; j++) { const dz = d * M.w2[j] * (1 - hs[j] * hs[j]); for (let i = 0; i < NF; i++) g[k++] += dz * c.F[i]; }
      for (let j = 0; j < H; j++) g[k++] += d * M.w2[j] * (1 - hs[j] * hs[j]);
      for (let j = 0; j < H; j++) g[k++] += d * hs[j];
      for (let i = 0; i < NF; i++) g[k++] += d * c.F[i]; }); }
  for (let k = 0; k < P.length; k++) { g[k] = g[k] / W + L2 * P[k]; m[k] = 0.9 * m[k] + 0.1 * g[k]; v2[k] = 0.999 * v2[k] + 0.001 * g[k] * g[k]; P[k] -= lr * (m[k] / (1 - 0.9 ** it)) / (Math.sqrt(v2[k] / (1 - 0.999 ** it)) + 1e-8); }
  setFlat(P); if (it % 500 === 0) console.error(it, "loss", (loss / W).toFixed(4));
}
console.error("after tune", JSON.stringify(acc(M, tr)), "\nafter test", JSON.stringify(acc(M, te)));
const R = x => +x.toFixed(3); console.log(JSON.stringify({ W1: M.W1.map(r => r.map(R)), b1: M.b1.map(R), w2: M.w2.map(R), lin: M.lin.map(R) }));
