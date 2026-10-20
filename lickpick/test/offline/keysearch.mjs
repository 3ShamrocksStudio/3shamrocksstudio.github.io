import { loadApp } from "./load.mjs"; import fs from "fs";
const A = loadApp(), LM = A.LickMusic;
const T = [...[...JSON.parse(fs.readFileSync(new URL("../truth_qa.json", import.meta.url))), ...JSON.parse(fs.readFileSync(new URL("../truth_extra.json", import.meta.url)))], ...(fs.existsSync("truth_gs.json") ? JSON.parse(fs.readFileSync("truth_gs.json")) : []), ...(process.env.Z ? JSON.parse(fs.readFileSync(new URL("../truth_train.json", import.meta.url))) : [])];
const rawPath = n => n.startsWith("gs_") ? `rawgs/${n.slice(3)}_comp_mic.json` : /^z\d/.test(n) ? `rawz/${n}.json` : `raw/${n}.json`;
const NI = { C: 0, "C#": 1, D: 2, Eb: 3, E: 4, F: 5, "F#": 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
const items = T.map(t => { const raw = JSON.parse(fs.readFileSync(rawPath(t.name))); const g = LM.bandGrid(raw, 0, raw.duration); return { name: t.name, raw, beats: g?.pulse ? g.beats : null, r: NI[t.key.replace(/m$/, "")], minor: t.key.endsWith("m") }; });
export function score(p) { LM._keyp(p); let syn = 0, gs = 0, synEx = 0, gsEx = 0; const rows = [];
  for (const it of items) { const k = LM.takeKey(it.raw, it.beats); const ex = k.key === it.r && k.minor === it.minor, rel = k.minor !== it.minor && ((it.minor ? (it.r + 3) % 12 : (it.r + 9) % 12) === k.key); const ok = ex || rel;
    rows.push({ name: it.name, ok, ex, k }); if (it.name.startsWith("gs_")) { gs += ok; gsEx += ex; } else { syn += ok; synEx += ex; } }
  return { syn, gs, synEx, gsEx, rows }; }
if (process.argv[2] === "search") { const seed = +process.argv[3] || 1; let r = seed * 7919; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647; const pickF = a => a[Math.floor(rnd() * a.length)];
  const res = []; for (let i = 0; i < +(process.argv[4] || 40); i++) { const p = { a3: pickF([0, 0.1, 0.2, 0.3]), a5: pickF([0, 0.05, 0.1, 0.15]), a7: pickF([0, 0.05, 0.1]), q3: pickF([1.2, 1.5, 2, 2.5]), t3: pickF([0.08, 0.15, 0.25, 0.35]), bassW: pickF([0.1, 0.25, 0.4, 0.6]), wProf: pickF([0.2, 0.5, 1, 1.5]), wBass: pickF([0.1, 0.3, 0.6, 1]), wEdge: pickF([0, 0.05, 0.1, 0.2]) };
    const s = score(p); res.push({ p, syn: s.syn, gs: s.gs, synEx: s.synEx, gsEx: s.gsEx }); }
  fs.writeFileSync(`ks_${seed}.json`, JSON.stringify(res)); }
