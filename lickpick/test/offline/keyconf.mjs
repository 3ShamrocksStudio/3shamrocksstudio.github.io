import fs from "fs"; const { score } = await import("./keysearch.mjs");
const P = JSON.parse(process.argv[2]); const s = score(P);
const rows = s.rows.map(r => ({ name: r.name, ok: r.ok, ex: r.ex, x: [r.k.margin, r.k.parMargin, r.k.relMargin, r.k.inKey, r.k.bassIn, r.k.tonal, r.k.r, r.k.thirds, Math.min(r.k.parMargin, 0.3) * r.k.thirds] }));
fs.writeFileSync("keyrows.json", JSON.stringify(rows)); console.log("syn", s.syn, "gs", s.gs);
// logistic regression (standardised), weighted: synthetic x3
const X = rows.map(r => r.x), mu = X[0].map((_, j) => X.reduce((a, x) => a + x[j], 0) / X.length), sd = X[0].map((_, j) => Math.sqrt(X.reduce((a, x) => a + (x[j] - mu[j]) ** 2, 0) / X.length) || 1);
const Z = X.map(x => x.map((v, j) => (v - mu[j]) / sd[j])); let w = new Array(Z[0].length).fill(0), b = 0;
for (let it = 0; it < 4000; it++) { const gw = w.map(() => 0); let gb = 0; rows.forEach((r, i) => { const z = Z[i].reduce((a, v, j) => a + v * w[j], b), p = 1 / (1 + Math.exp(-z)), wt = r.name.startsWith("gs_") ? 1 : 3, g = (p - (r.ok ? 1 : 0)) * wt; Z[i].forEach((v, j) => gw[j] += g * v); gb += g; }); w = w.map((v, j) => v - 0.01 * (gw[j] / rows.length + 0.01 * v)); b -= 0.01 * gb / rows.length; }
const conf = rows.map((r, i) => 1 / (1 + Math.exp(-Z[i].reduce((a, v, j) => a + v * w[j], b))));
console.log("w(raw)", w.map((v, j) => (v / sd[j]).toFixed(3)).join(","), "b", (b - w.reduce((a, v, j) => a + v * mu[j] / sd[j], 0)).toFixed(3));
for (const t of [0.5, 0.6, 0.7, 0.8, 0.85, 0.9]) { const S = rows.map((r, i) => ({ r, c: conf[i] })); const f = x => x.r.name.startsWith("gs_");
  const synW = S.filter(x => !f(x) && !x.r.ok && x.c >= t).length, synR = S.filter(x => !f(x) && x.r.ok && x.c >= t).length, gsW = S.filter(x => f(x) && !x.r.ok && x.c >= t).length, gsR = S.filter(x => f(x) && x.r.ok && x.c >= t).length;
  console.log(`thr ${t}: synthetic sure-right ${synR} sure-wrong ${synW} | GS sure-right ${gsR} sure-wrong ${gsW}`); }
console.log("synthetic:", rows.map((r, i) => r.name.startsWith("gs_") ? null : `${r.name.slice(0, 8)}:${r.ok ? (r.ex ? "ok" : "rel") : "WR"}:${conf[i].toFixed(2)}`).filter(Boolean).join(" "));
