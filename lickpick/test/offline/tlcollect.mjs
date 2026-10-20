// collect the app's tempo-level candidate tables (features + bpm) for every take, labelled with the true tempo
import { loadApp } from "./load.mjs"; import fs from "fs";
const A = loadApp(), LM = A.LickMusic;
const T = [...[...JSON.parse(fs.readFileSync(new URL("../truth_qa.json", import.meta.url))), ...JSON.parse(fs.readFileSync(new URL("../truth_extra.json", import.meta.url)))], ...(fs.existsSync("truth_gs.json") ? JSON.parse(fs.readFileSync("truth_gs.json")) : []), ...JSON.parse(fs.readFileSync(new URL("../truth_train.json", import.meta.url)))];
const rawPath = n => n.startsWith("gs_") ? `rawgs/${n.slice(3)}_comp_mic.json` : /^z\d/.test(n) ? `rawz/${n}.json` : `raw/${n}.json`;
const med = a => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const out = [];
for (const t of T) { const raw = JSON.parse(fs.readFileSync(rawPath(t.name))); try { LM.bandGrid(raw, 0, raw.duration); } catch (e) { console.log(t.name, e.message); continue; }
  const C = LM._tl(); const tb = t.beats, tbpm = 60 / med(tb.slice(1).map((x, i) => x - tb[i]));
  out.push({ name: t.name, tbpm, C: (C || []).map(c => ({ bpm: c.bpm, m: c.m, F: c.F, y: Math.abs(c.bpm / tbpm - 1) < 0.04 })) }); }
fs.writeFileSync("tl.json", JSON.stringify(out));
const miss = out.filter(o => !o.C.some(c => c.y)); console.log("takes", out.length, "no correct candidate:", miss.length, miss.map(m => m.name + "(" + Math.round(m.tbpm) + ":" + m.C.map(c => Math.round(c.bpm)).join("/") + ")").join(" "));
