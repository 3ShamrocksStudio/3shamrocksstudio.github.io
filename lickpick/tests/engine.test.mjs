// LickPick engine checks, run with: node lickpick/tests/engine.test.mjs
// Loads the scan engine (ClipEngine) and the lick finder (LickMusic) straight from the app and runs them on synthetic jams.
import { readFileSync } from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const html = readFileSync(new URL("../app/index.html", import.meta.url), "utf8");
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const ctx = vm.createContext({ console, setTimeout, Math, Float32Array, Float64Array, Int8Array, Uint8Array, Int16Array, Array, Object, Number, JSON, Set, Map, WeakMap, Promise });
ctx.globalThis = ctx;
for (const name of ["root.ClipEngine =", "root.LickMusic ="]) vm.runInContext(blocks.find(b => b.includes(name)), ctx);
const { ClipEngine: E, LickMusic: M } = ctx;

// a jam: a plucked 4-chord loop (a note on every beat, a chord change every bar)
const sr = 22050, roots = [220, 174.6, 261.6, 196];
function jam(dur, bpm) { const y = new Float32Array(sr * dur), bt = 60 / bpm;
  for (let b = 0; b * bt < dur; b++) { const t0 = b * bt, f = roots[Math.floor(b / 4) % 4] * [1, 1.25, 1.5, 2][b % 4];
    for (let i = Math.floor(t0 * sr); i < Math.min(y.length, Math.floor((t0 + bt) * sr)); i++) { const t = i / sr - t0; y[i] += 0.3 * Math.exp(-4 * t) * (Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(4 * Math.PI * f * t)); } }
  return E.analyzePCM(y, sr, () => { }, 1e9); }
const dur = 60, raw = await jam(dur, 120);
const n = raw.nCells, step = 0.5, T = Array.from({ length: dur / step }, (_, i) => i * step);
const pics = {
  normal: T.map((t, i) => ({ t, luma: 120, std: 45, sharp: 180 + (i % 7) * 10, diff: i ? 3 : NaN, sc: 0.01 })),
  flat: T.map((t, i) => ({ t, luma: 128, std: 0, sharp: 0, diff: i ? 0 : NaN, sc: 0 })),           // one flat colour
  dark: T.map((t, i) => ({ t, luma: 6, std: 2.5, sharp: 1.2, diff: i ? 0.8 : NaN, sc: 0.002 })),  // face-down / dark room
};
const keep = {};
for (const [k, frames] of Object.entries(pics)) {
  const r = { ...raw, penalty: { ...raw.penalty } }, vp = E.videoPenalties(frames, n, step); delete vp._shots; Object.assign(r.penalty, vp);
  const res = E.decide(r, { strictness: 0.5, minKeep: 45 });
  keep[k] = res.kept;
  if (k !== "normal") {
    for (const why of ["lens covered / too dark", "out of focus", "camera moving", "camera re-aimed (new shot)"]) assert.ok(vp[why].every(v => v === 0), `${k} video: no "${why}" penalty`);
    assert.ok(!res.removed.some(x => x.reasons.some(w => /focus|dark|camera/.test(w))), `${k} video: nothing cut for the picture`);
  }
}
assert.ok(keep.normal > 30, `the jam itself is kept (${keep.normal} s)`);
assert.equal(keep.flat, keep.normal, "a flat-colour video keeps the same audio as a normal picture");
assert.equal(keep.dark, keep.normal, "a dark video keeps the same audio as a normal picture");
console.log("PASS flat/dark video: audio decides", keep);

// licks A, B and C on a repetitive loop: different stretches, at most a fifth shared with one already chosen
// (70 s at 100 BPM: before the fix B and C shared 40% of their length)
const loop = await jam(70, 100), L = await M.picksAsync(loop, [[0, 70]], "auto", null);
assert.ok(L.length >= 1, "at least one lick");
for (let i = 0; i < L.length; i++) for (let j = 0; j < i; j++) {
  const ov = Math.min(L[i].e, L[j].e) - Math.max(L[i].s, L[j].s);
  assert.ok(ov <= 0.2 * Math.min(L[i].len, L[j].len) + 1e-6, `lick ${"ABC"[i]} overlaps ${"ABC"[j]} by ${ov.toFixed(1)} s`);
}
console.log("PASS licks distinct", L.map(p => `${p.s.toFixed(1)}-${p.e.toFixed(1)}`));
assert.equal(raw.info.tempoExact, undefined, "no dead tempoExact field");
console.log("PASS all");
