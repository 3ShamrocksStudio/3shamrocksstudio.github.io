// Collects the tempo-level ranker's candidates (features F, bpm) and the meter features of every take, with truth labels.
// usage: SETS="truth.json:rawroot,..." OUT=feats.json node tlcollect3.mjs
import { loadApp } from "./load.mjs"; import fs from "fs"; import path from "path";
const A = loadApp(process.env.LPHTML), LM = A.LickMusic, out = [];
const med = a => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
for (const spec of process.env.SETS.split(",")) {
  const [tf, root] = spec.split(":"); const truth = JSON.parse(fs.readFileSync(tf));
  for (const T of truth) {
    if (T.kind === "step" || T.kind === "ramp") continue;
    const rp = path.join(root, T.raw || `raw_v3_${T.split}/${T.name}.json`); if (!fs.existsSync(rp)) continue;
    const raw = JSON.parse(fs.readFileSync(rp)); let g = null; try { g = LM.bandGrid(raw, 0, raw.duration); } catch (e) { continue; }
    const C = LM._tlg(); if (!C?.length) continue;
    const TB = T.beats.filter(t => t <= raw.duration), tb = 60 / med(TB.slice(1).map((t, i) => t - TB[i]));
    const lab = C.findIndex(c => Math.abs(Math.log(c.bpm / tb)) < 0.04);
    out.push({ name: T.name, set: T.set || "synth", split: T.split, meter: T.meter, fam: T.fam || T.style, tb, lab, C: C.map(c => ({ bpm: +c.bpm.toFixed(2), F: c.F.map(v => +(+v).toFixed(4)) })), gbpm: g?.bpm });
  }
  console.log(tf, out.length);
}
fs.writeFileSync(process.env.OUT, JSON.stringify(out));
