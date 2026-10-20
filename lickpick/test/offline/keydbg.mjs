import { loadApp } from "./load.mjs"; import fs from "fs";
const A = loadApp(), LM = A.LickMusic, N = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
for (const n of process.argv.slice(2)) { const raw = JSON.parse(fs.readFileSync(n.startsWith("gs_") ? `rawgs/${n.slice(3)}_comp_mic.json` : `raw/${n}.json`)); const g = LM.bandGrid(raw, 0, raw.duration);
  const tk = LM.takeKey(raw, g?.pulse ? g.beats : null); const D = LM._kd();
  console.log(n, "→", N[tk.key] + (tk.minor ? "m" : ""), JSON.stringify(tk));
  console.log("  chords:", D.ch.slice(0, 40).map(c => N[c.r] + (c.q === "min" ? "m" : c.q === "5" ? "5" : "") + (c.margin < 0.05 ? "?" : "")).join(" "));
  console.log("  bass:", N.map((x, i) => x + ":" + D.bass[i].toFixed(0)).join(" "), "| prof:", N.map((x, i) => x + ":" + (D.prof[i] / Math.max(...D.prof)).toFixed(2)).join(" "));
  for (const s of D.scores.slice(0, 4)) console.log("   ", (N[s.k] + (s.minor ? "m" : "")).padEnd(4), "sc", s.sc.toFixed(3), "fit", s.fit.toFixed(3), "inKey", s.inKey.toFixed(2), "pr", s.pr.toFixed(3), "bIn", s.bIn.toFixed(2), "tB", s.tonicBass.toFixed(2), "edge", s.edge); }
