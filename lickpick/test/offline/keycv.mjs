import fs from "fs"; const rows = JSON.parse(fs.readFileSync("keyrows.json"));
function fit(R) { const X = R.map(r => r.x), mu = X[0].map((_, j) => X.reduce((a, x) => a + x[j], 0) / X.length), sd = X[0].map((_, j) => Math.sqrt(X.reduce((a, x) => a + (x[j] - mu[j]) ** 2, 0) / X.length) || 1);
  const Z = X.map(x => x.map((v, j) => (v - mu[j]) / sd[j])); let w = new Array(Z[0].length).fill(0), b = 0;
  for (let it = 0; it < 3000; it++) { const gw = w.map(() => 0); let gb = 0; R.forEach((r, i) => { const z = Z[i].reduce((a, v, j) => a + v * w[j], b), p = 1 / (1 + Math.exp(-z)), wt = r.name.startsWith("gs_") ? 1 : 3, g = (p - (r.ok ? 1 : 0)) * wt; Z[i].forEach((v, j) => gw[j] += g * v); gb += g; }); w = w.map((v, j) => v - 0.01 * (gw[j] / R.length + 0.01 * v)); b -= 0.01 * gb / R.length; }
  return x => 1 / (1 + Math.exp(-x.reduce((a, v, j) => a + (v - mu[j]) / sd[j] * w[j], b))); }
for (const thr of [0.8, 0.85, 0.9]) { let sr = 0, sw = 0, n = 0; for (let f = 0; f < 6; f++) { const test = rows.filter(r => r.name.startsWith("gs_") && +r.name.slice(3, 5) === f), m = fit(rows.filter(r => !test.includes(r)));
  for (const r of test) { n++; const c = m(r.x); if (c >= thr) { if (r.ok) sr++; else sw++; } } } console.log(`CV GS thr ${thr}: sure-right ${sr} sure-wrong ${sw} of ${n} (precision ${(sr / (sr + sw) * 100).toFixed(1)}%)`); }
