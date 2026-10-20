import fs from "fs";
const D0 = JSON.parse(fs.readFileSync("tl.json")).filter(d => d.C.some(c => c.y));
const feat = c => { const F = c.F; return [F[0], F[1], Math.log2(c.bpm / 110), F[2], F[3], F[10], F[4], F[5], F[6], F[8], F[9], F[13] ?? 0]; };
const D = D0.map(d => ({ name: d.name, X: d.C.map(feat), y: d.C.findIndex(c => c.y), bpm: d.C.map(c => c.bpm), tbpm: d.tbpm }));
const NI = D[0].X[0].length, NH = +(process.env.NH || 6), L2 = +(process.env.L2 || 3e-3), EP = +(process.env.EP || 400), SW = +(process.env.SW || 3);
function rngF(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function init(seed) { const r = rngF(seed); return { W1: Array.from({ length: NH }, () => Array.from({ length: NI }, () => (r() - 0.5) * 0.6)), b1: new Array(NH).fill(0), w2: Array.from({ length: NH }, () => (r() - 0.5) * 0.6), lin: new Array(NI).fill(0) }; }
const fwd = (M, x) => { const h = M.W1.map((w, j) => Math.tanh(w.reduce((s, v, i) => s + v * x[i], M.b1[j]))); return { h, s: h.reduce((s, v, j) => s + v * M.w2[j], 0) + M.lin.reduce((s, v, i) => s + v * x[i], 0) }; };
function train(S, seed = 1) { const M = init(seed); const lr = 0.05;
  for (let ep = 0; ep < EP; ep++) { for (const d of S) { const o = d.X.map(x => fwd(M, x)), mx = Math.max(...o.map(z => z.s)), ex = o.map(z => Math.exp(z.s - mx)), Z = ex.reduce((a, b) => a + b, 0), p = ex.map(v => v / Z); const wt = d.name.startsWith("gs_") ? 1 : SW;
      d.X.forEach((x, k) => { const g = (p[k] - (k === d.y ? 1 : 0)) * wt * lr; o[k].h.forEach((hv, j) => { const gh = g * M.w2[j] * (1 - hv * hv); M.w2[j] -= g * hv; M.b1[j] -= gh; for (let i = 0; i < NI; i++) M.W1[j][i] -= gh * x[i]; }); for (let i = 0; i < NI; i++) M.lin[i] -= g * x[i]; }); }
    for (const w of M.W1) for (let i = 0; i < NI; i++) w[i] *= (1 - L2); for (let j = 0; j < NH; j++) M.w2[j] *= (1 - L2); }
  return M; }
const pick = (M, d) => { const s = d.X.map(x => fwd(M, x).s); return s.indexOf(Math.max(...s)); };
const folds = 6; let gs = 0, ngs = 0, syn = 0, nsyn = 0; const fails = []; const isZ = d => /^z\d/.test(d.name);
for (let f = 0; f < folds; f++) { const test = D.filter((d, i) => !isZ(d) && (d.name.startsWith("gs_") ? +d.name.slice(3, 5) === f : i % folds === f)), tr = D.filter(d => !test.includes(d)); const M = train(tr);
  for (const d of test) { const ok = pick(M, d) === d.y; if (d.name.startsWith("gs_")) { ngs++; gs += ok; } else { nsyn++; syn += ok; if (!ok) fails.push(d.name); } } }
const M = train(D); let fg = 0, fs2 = 0; const ff = []; let fz = 0, nz = 0; for (const d of D) { const ok = pick(M, d) === d.y; if (isZ(d)) { nz++; fz += ok; continue; } if (d.name.startsWith("gs_")) fg += ok; else { fs2 += ok; if (!ok) ff.push(d.name + "→" + Math.round(d.bpm[pick(M, d)])); } }
console.log(`NH ${NH} L2 ${L2} EP ${EP} SW ${SW} | CV gs ${gs}/${ngs} syn ${syn}/${nsyn} [${fails.join(" ")}] | full gs ${fg} syn ${fs2} z ${fz}/${nz} [${ff.join(" ")}]`);
if (process.env.SAVE) fs.writeFileSync(process.env.SAVE, JSON.stringify(M));
