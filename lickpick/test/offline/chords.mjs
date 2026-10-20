// band chords (harmonyPlan with the take key when sure) vs the true progression, per bar/half-bar, on the whole take
import { loadApp } from "./load.mjs"; import fs from "fs";
const A = loadApp(), LM = A.LickMusic, truth = [...JSON.parse(fs.readFileSync(new URL("../truth_qa.json", import.meta.url))), ...JSON.parse(fs.readFileSync(new URL("../truth_extra.json", import.meta.url)))], PR = JSON.parse(fs.readFileSync(new URL("../progs.json", import.meta.url)));
const NI = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
const root = n => { const m = /^([A-G][#b]?)/.exec(n); return m ? NI[m[1]] : null; }, minorQ = n => /^[A-G][#b]?m(?!aj)/.test(n);
const out = [];
for (const T of truth) { if (process.argv[2] && !T.name.startsWith(process.argv[2])) continue; const raw = JSON.parse(fs.readFileSync(`raw/${T.name}.json`)), g = LM.bandGrid(raw, 0, raw.duration), tk = LM.takeKey(raw, g?.pulse ? g.beats : null);
  const sure = tk.conf >= LM.KEY_SURE; if (!g?.pulse) { out.push(T.name + " no pulse"); continue; }
  const An = LM.analyze(raw, 0, raw.duration, { beats: g.beats }), H = LM.harmonyPlan(raw, An, sure ? { key: tk.key, minor: tk.minor } : {});
  const [prog, meter, cpb] = PR[T.name], tb = T.beats; let n = 0, rOK = 0, qOK = 0;
  const at = t => { let i = tb.findIndex(b => b > t) - 1; if (i < 0) return null; if (T.played_from && t < T.played_from) return null; return prog[(Math.floor(i / meter) * cpb + Math.floor((i % meter) * cpb / meter)) % prog.length]; };
  for (const h of H) { for (let t = h.t0 + 0.05; t < h.t1 - 0.05; t += 0.25) { const tc = at(t); if (!tc || !h.name || h.name === "N") continue; n++; const r1 = root(h.name), r0 = root(tc); if (r1 === r0) { rOK++; if (tc.endsWith("5") || h.power || minorQ(h.name) === minorQ(tc)) qOK++; } } }
  out.push(`${T.name.padEnd(17)} key ${tk.key}${tk.minor ? "m" : ""} c${tk.conf.toFixed(2)} ${sure ? "SURE" : "drums-only"} | chord roots ${(rOK / n * 100).toFixed(0)}% roots+quality ${(qOK / n * 100).toFixed(0)}%  [${[...new Set(H.slice(0, 12).map(h => h.name))].join(" ")}]`); }
console.log(out.join("\n"));
