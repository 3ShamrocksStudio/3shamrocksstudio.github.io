// Key (round 3): fits the key-score weights (KW3) and the confidence model (KC3) on the TUNE split only, then reports
// the held-out TEST split: top-1 accuracy and the precision / coverage at KEY_SURE (0.85), per set.
// Every set has the same total weight. Correct = the exact key; "rel" (relative major/minor) is reported separately.
// usage: SETS="truth.json:rawroot,..." CACHE=keyfeats.json node keytune3.mjs  -> prints {KW3, KC3}
import { loadApp } from "./load.mjs"; import fs from "fs"; import path from "path";
const A = loadApp(process.env.LPHTML), LM = A.LickMusic;
const NI = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
let rows = []; const cache = process.env.CACHE;
if (cache && fs.existsSync(cache)) rows = JSON.parse(fs.readFileSync(cache));
else { for (const spec of process.env.SETS.split(",")) { const [tf, root] = spec.split(":"); const truth = JSON.parse(fs.readFileSync(tf));
  for (const T of truth) { if (!T.key) continue; const rp = path.join(root, T.raw || `raw_v3_${T.split}/${T.name}.json`); if (!fs.existsSync(rp)) continue;
    const raw = JSON.parse(fs.readFileSync(rp)); let g = null; try { g = LM.bandGrid(raw, 0, raw.duration); } catch { } const KF = LM.keyFeats3(raw, g?.pulse ? g.beats : null); if (!KF) continue;
    rows.push({ name: T.name, set: T.set || "synth", split: T.split, fam: T.fam || T.style, kr: NI[T.key.replace(/m$/, "")], km: T.key.endsWith("m"), tonal: KF.tonal, nSeg: KF.nSeg,
      keys: KF.keys.map(x => ({ k: x.k, m: x.minor, f: x.f.map(v => +v.toFixed(4)), outM: +x.outM.toFixed(4), fit: +x.fit.toFixed(4), cad: +x.cad.toFixed(3) })) }); }
  console.error(tf, rows.length); } if (cache) fs.writeFileSync(cache, JSON.stringify(rows)); }
const tune = rows.filter(r => r.split === "tune"), test = rows.filter(r => r.split === "test");
const setN = R => { const c = {}; for (const r of R) c[r.set] = (c[r.set] || 0) + 1; return c; };
const decide = (r, w) => { const sc = r.keys.map(x => ({ ...x, sc: x.f.reduce((a, v, i) => a + v * w[i], 0) })).sort((x, y) => y.sc - x.sc); return sc; };
const res = (r, b0) => b0.k === r.kr && b0.m === r.km ? "ok" : b0.m !== r.km && (r.km ? (r.kr + 3) % 12 : (r.kr + 9) % 12) === b0.k ? "rel" : "wrong";
const objective = (R, w) => { const c = setN(R), ns = Object.keys(c).length; let s = 0; for (const r of R) { const x = res(r, decide(r, w)[0]); s += (x === "ok" ? 1 : x === "rel" ? 0.4 : 0) / c[r.set] / ns; } return s; };
let W = Object.values(LM._kw3()).slice(0, 9); console.error("start tune obj", objective(tune, W).toFixed(4));
for (let pass = 0; pass < 4; pass++) for (let i = 0; i < W.length; i++) { let best = W[i], bo = objective(tune, W); for (const m of [0, 0.25, 0.5, 0.75, 1.33, 1.5, 2, 3]) { const w2 = W.slice(); w2[i] = W[i] === 0 ? m : W[i] * m; const o = objective(tune, w2); if (o > bo + 1e-6) { bo = o; best = w2[i]; } } W[i] = best; }
console.error("weights", JSON.stringify(W.map(x => +x.toFixed(3))), "tune obj", objective(tune, W).toFixed(4));
// confidence features (same as takeKey) and the logistic fit for "exact key right"
const cfOf = (r, sc) => LM.keyConfFeats(sc.map(x => ({ ...x, minor: x.m })), { tonal: r.tonal, nSeg: r.nSeg }, W);
const prep = R => R.map(r => { const sc = decide(r, W); return { r, x: cfOf(r, sc), y: res(r, sc[0]) === "ok" ? 1 : 0, res: res(r, sc[0]) }; });
// the confidence model and its calibration use CALSETS (default: the sets that look like LickPick takes: synth, guitarset)
const CAL = (process.env.CALSETS || "synth,guitarset").split(","), PTall = prep(tune), PT = PTall.filter(p => CAL.includes(p.r.set)), PS = prep(test), NF = PT[0].x.length;
// two calibrated confidences: SCALE (the key or its relative major/minor: the same notes, so the band can't clash) gates
// the band's chords; EXACT (the key's name) decides whether the name is shown alone or as "C major / A minor"
const c = setN(PT.map(p => p.r)), ns = Object.keys(c).length;
function fitConf(yf) { let w = Array(NF).fill(0), b = 0; const m = Array(NF + 1).fill(0), v = Array(NF + 1).fill(0);
  for (let it = 1; it <= 4000; it++) { const g = Array(NF + 1).fill(0); let tw = 0; for (const p of PT) { const q = 1 / c[p.r.set] / ns, y = yf(p); tw += q; let z = b; p.x.forEach((x, i) => z += w[i] * x); const pr = 1 / (1 + Math.exp(-z)), d = q * (pr - y); p.x.forEach((x, i) => g[i] += d * x); g[NF] += d; }
    for (let i = 0; i <= NF; i++) { const gi = g[i] / tw + (i < NF ? 1e-3 * w[i] : 0); m[i] = 0.9 * m[i] + 0.1 * gi; v[i] = 0.999 * v[i] + 0.001 * gi * gi; const st = 0.03 * (m[i] / (1 - 0.9 ** it)) / (Math.sqrt(v[i] / (1 - 0.999 ** it)) + 1e-8); if (i < NF) w[i] -= st; else b -= st; } }
  const zOf = p => p.x.reduce((a, x, i) => a + x * w[i], b);
  // calibration on the tune split: conf >= 0.85 exactly where tune precision is still >= PREC
  const zs = PT.map(p => [zOf(p), yf(p)]).sort((x, y) => y[0] - x[0]); let zt = zs[0][0] + 1, okN = 0;
  for (let i = 0; i < zs.length; i++) { okN += zs[i][1]; if (okN / (i + 1) >= +(process.env.PREC || 0.98) && (i + 1 === zs.length || zs[i + 1][0] < zs[i][0])) zt = zs[i][0]; }
  b += Math.log(0.85 / 0.15) - zt; return { w, b, conf: p => { const v = 1 / (1 + Math.exp(-p.x.reduce((a, x, i) => a + x * w[i], b))); return p.x[4] < 0.35 ? Math.min(v, 0.6) : v; } }; }   // same guard as takeKey
const SC = fitConf(p => p.res !== "wrong" ? 1 : 0), EX = fitConf(p => p.y);
const report = (nm, P) => { const by = {}; for (const p of P) { const k = p.r.set; (by[k] ||= []).push(p); } console.error(nm);
  for (const [k, L] of Object.entries(by)) { const s = L.filter(p => SC.conf(p) >= 0.85), x = L.filter(p => EX.conf(p) >= 0.85);
    console.error(`  ${k.padEnd(10)} n${L.length} top1 exact ${L.filter(p => p.y).length} (+rel ${L.filter(p => p.res !== "wrong").length}) | SCALE conf>=0.85: ${s.length} (${(100 * s.length / L.length).toFixed(0)}%) precision ${(100 * s.filter(p => p.res !== "wrong").length / (s.length || 1)).toFixed(1)}% | EXACT conf>=0.85: ${x.length} precision ${(100 * x.filter(p => p.y).length / (x.length || 1)).toFixed(1)}%`); } };
report("TUNE", PTall); report("TEST", PS);
const R3 = M => ({ w: M.w.map(x => +x.toFixed(3)), b: +M.b.toFixed(3) });
console.log(JSON.stringify({ KW3: Object.fromEntries(["pr", "out", "fit", "cad", "ton", "tb", "last", "first", "minor"].map((k, i) => [k, +W[i].toFixed(3)])), KC3: R3(SC), KX3: R3(EX) }));
