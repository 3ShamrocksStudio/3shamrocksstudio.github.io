// Round-4 offline evaluation: the app's own bandGrid / tapSnap / analyze / takeKey / harmonyPlan / chordFollow on every take
// of a truth file (gen_v4 sets, or the real sets from real_truth.py + gs_chords.py). Per take: is the band's beat right
// when it plays on its own (level + phase + compound feel), did the confidence gate ask for 4 taps instead, does a 4-tap
// fix (simulated: taps on the true beats, 20 ms jitter, 15 ms late) give the right beat, free time (band over free playing /
// band missing steady playing), meter, downbeats (incl. after an odd bar), harmony coverage and chord-tone accuracy of the
// notes the band would play, and the grid's signed latency.
// usage: TRUTH=truth.json RAWROOT=dir [SPLIT=tune|test] [LPHTML=app.html] [OUT=rows.json] [QUIET=1] node eval4.mjs [name-prefix...]
import { loadApp } from "./load.mjs"; import fs from "fs"; import path from "path";
const A = loadApp(process.env.LPHTML), LM = A.LickMusic;
if (process.env.G4) LM._g4(JSON.parse(process.env.G4));
const truth = JSON.parse(fs.readFileSync(process.env.TRUTH)), ROOT = process.env.RAWROOT, SPLIT = process.env.SPLIT, QUIET = !!process.env.QUIET;
const only = process.argv.slice(2);
const NI = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
const med = a => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : NaN; };
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); if (!s.length) return NaN; const i = (s.length - 1) * p / 100, lo = Math.floor(i); return s[lo] + ((s[Math.min(s.length - 1, lo + 1)] ?? s[lo]) - s[lo]) * (i - lo); };
const nearest = (arr, t) => { let lo = 0, hi = arr.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (arr[m] < t) lo = m; else hi = m; } return Math.abs(arr[lo] - t) < Math.abs(arr[hi] - t) ? arr[lo] : arr[hi]; };
let seed = 12345; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }, gauss = () => { let u = 0; for (let i = 0; i < 6; i++) u += rnd(); return (u - 3) / Math.sqrt(0.5); };
const inAny = (R, t) => (R || []).some(([a, b]) => t >= a && t <= b);
const rows = [];
for (const T of truth) {
  if (SPLIT && T.split !== SPLIT) continue;
  if (only.length && !only.some(o => T.name.startsWith(o) || (T.fam || T.style || "").startsWith(o))) continue;
  const rp = path.join(ROOT, T.raw || `raw_v4_${T.split}/${T.name}.json`); if (!fs.existsSync(rp)) continue;
  const raw = JSON.parse(fs.readFileSync(rp)), dur = raw.duration;
  let g = null; try { g = LM.bandGrid(raw, 0, dur); } catch (e) { console.log(T.name, "ERR grid", e.message); }
  const TF = T.free || [], TB = T.beats.filter(t => t <= dur - 0.2), TBs = TB.filter(t => !inAny(TF, t));
  const meterT = T.meter || "4", compT = meterT === "6/8" || meterT === "12/8" || !!T.compound, duple = meterT === "4" || meterT === "2";
  const tibi = TBs.slice(1).map((t, i) => t - TBs[i]).filter(x => x < 2.5), tbpm = 60 / med(tibi);
  const r = { name: T.name, set: T.set || "synth", fam: T.set === "guitarset" ? (T.style || "").replace(/\d+$/, "") : (T.fam || T.style), meterT, compT, tbpm: +tbpm.toFixed(1), harm: T.harm, atk: T.atk_ms, clear: !!T.clear };
  const BF = g?.free || [];
  // is a beat list right? level, phase (median error, share of band beats on the "and"), feel
  const judge = (gb, comp) => {
    const o = {}; if (!gb || gb.length < 4) return { ok: false };
    const sb = gb.filter(t => !inAny(TF, t) && !inAny(BF, t)), ib = sb.slice(1).map((t, i) => t - sb[i]).filter(x => x < 3);
    if (ib.length < 3) return { ok: false };
    const ratio = 60 / med(ib) / tbpm; o.ratio = +ratio.toFixed(3);
    o.lvl = Math.abs(ratio - 1) < 0.04 ? 1 : Math.abs(ratio - 2) < 0.08 ? 2 : Math.abs(ratio - 0.5) < 0.02 ? 0.5 : Math.abs(ratio - 3) < 0.12 ? 3 : Math.abs(ratio - 1 / 3) < 0.015 ? 1 / 3 : Math.abs(ratio - 1.5) < 0.06 ? 1.5 : Math.abs(ratio - 2 / 3) < 0.03 ? 2 / 3 : 0;
    let ref = null; if (o.lvl === 1) ref = TB; else if (o.lvl === 2) ref = TB.flatMap((t, i) => i + 1 < TB.length ? [t, (t + TB[i + 1]) / 2] : [t]); else if (o.lvl === 3) ref = TB.flatMap((t, i) => i + 1 < TB.length ? [t, t + (TB[i + 1] - t) / 3, t + 2 * (TB[i + 1] - t) / 3] : [t]);
    const lo = Math.max(1, T.played_from || 0), hi = dur - 0.3; let err = null;
    if (ref) { const q = ref.filter(t => t >= lo && t <= hi && !inAny(TF, t) && !inAny(BF, t)); err = q.map(t => nearest(gb, t) - t); }
    else if (o.lvl === 0.5 || o.lvl === 1 / 3) { const q = gb.filter(t => t >= lo && t <= hi && !inAny(TF, t) && !inAny(BF, t)); err = q.map(t => t - nearest(TB, t)); }
    if (err && err.length > 4) { const a = err.map(Math.abs), P = 60 / tbpm / (o.lvl || 1); o.med = +(med(a) * 1000).toFixed(1); o.p95 = +(pct(a, 95) * 1000).toFixed(1); o.sgn = +(med(err) * 1000).toFixed(1); o.onAnd = +(a.filter(x => Math.abs(x - P / 2) < 0.07 * P + 0.02).length / a.length).toFixed(2); }
    const lvlOK = o.lvl === 1 || (duple && !compT && (o.lvl === 2 || o.lvl === 0.5));
    o.ok = !!(lvlOK && o.med != null && o.med < 40 && o.onAnd < 0.3 && (compT ? !!comp && o.lvl === 1 : !comp));
    return o;
  };
  r.pulse = !!g?.pulse;
  if (g?.pulse) {
    const J = judge(g.beats, g.compound); Object.assign(r, { lvl: J.lvl, ratio: J.ratio, med: J.med, p95: J.p95, sgn: J.sgn, onAnd: J.onAnd, ok: J.ok });
    r.pe = LM.phaseEvidence(raw, g.beats.filter(t => !inAny(BF, t))); r.tl = (LM._tlg() || []).map(c => [+c.L.toFixed(2), +c.sc.toFixed(2)]); r.ev = g.ev || null;
    r.gate = !!g.gate; r.phM = g.phM; r.mDec = g.mDec || null; r.amb = !!g.meterAmb; r.anchor = g.anchor || null; r.bpf = LM.bassPhase(raw, g.beats.filter(t => !inAny(BF, t))); r.lvM = g.lvM; r.meter = g.meter; r.compound = !!g.compound; r.bpm = +g.bpm.toFixed(1); r.free = BF;
    r.status = J.ok ? (r.gate ? "right-gated" : "right") : (r.gate ? "wrong-gated" : "WRONG");
    // the 4-tap fix: 4 taps on the true beats ~30% into the steady part (20 ms jitter, 15 ms late)
    if (TBs.length > 12) { const i0 = Math.floor(TBs.length * 0.3), taps = TBs.slice(i0, i0 + 4).map(t => t + 0.015 + 0.02 * gauss());
      const ts = LM.tapSnap(g.beats, taps, 0, dur); r.tapM = ts?.mult ?? null;
      if (ts) { const comp = ts.mult === 1 / 3 || ts.mult === 2 / 3 ? true : ts.mult === 3 || ts.mult === 1.5 ? false : g.compound; r.tapOK = judge(ts.beats, comp).ok; if (r.gate) { r._tb = ts.beats; r._tc = comp; } } else r.tapOK = false; }
  } else r.status = "nopulse";
  // free time: band over truth-free playing, band silent over steady playing (seconds)
  if (g?.pulse && g.beats.length > 1) { let leak = 0, miss = 0; for (let i = 0; i + 1 < g.beats.length; i++) { const t = g.beats[i], d = g.beats[i + 1] - t; if (t < (T.played_from || 0) - 0.3) continue; if (!TF.length && (t < TB[0] + 0.5 || t > TB[TB.length - 1])) continue; const tf = inAny(TF, t + d / 2), bf = inAny(BF, t + d / 2); if (tf && !bf) leak += d; if (!tf && bf) miss += d; } r.freeLeak = +leak.toFixed(1); r.freeMiss = +miss.toFixed(1); }   // (before the first / after the last annotated beat: an unannotated intro or outro)
  // downbeats (bars from the app's analyze on the band's beats)
  // the grid the band plays: the auto grid, or (gate) the 4-tap fix
  const PB = r._tb || g?.beats, PC = r._tb ? r._tc : g?.compound, PL = r._tb ? (r.tapOK ? 1 : 0) : r.lvl; delete r._tb; delete r._tc;
  let An = null; try { if (g?.pulse && !(r.gate && !r.tapOK)) An = LM.analyze(raw, 0, dur, { beats: PB, meter: PC ? 4 : g.meter, compound: PC }); } catch (e) { console.log(T.name, "ERR an", e.message); }
  if (An?.pulse && PL === 1 && T.down?.length) { const TD = T.down.map(k => T.beats[k]).filter(t => t != null && t < dur - 0.5 && !inAny(TF, t) && t > (T.played_from || 0) + 0.5), BS = An.bars.map(b => b.t0);
    const hit = t => BS.length && Math.abs(nearest(BS, t) - t) < 0.07; r.downRec = +(TD.filter(hit).length / (TD.length || 1)).toFixed(2);
    const okBS = BS.filter(t => t > (T.played_from || 0) + 0.5 && t < dur - 0.5 && !inAny(TF, t)); r.downPrec = +(okBS.filter(t => Math.abs(nearest(TD, t) - t) < 0.07).length / (okBS.length || 1)).toFixed(2);
    if (T.odd?.length) { const ta = T.beats[T.odd[0]]; const TA = TD.filter(t => t > ta + 0.1); r.downAfterOdd = +(TA.filter(hit).length / (TA.length || 1)).toFixed(2); } }
  // harmony: what the band would play (key sure: the key's chords; not sure: chord-follow, per bar; neither: drums only)
  let tk = null; try { tk = LM.takeKey(raw, g?.pulse ? g.beats : null); } catch { }
  const sure = !!tk && tk.key != null && tk.conf >= LM.KEY_SURE;
  let H = null, mode = "drums"; try { if (An?.pulse) { H = LM.chordFollow(raw, An, sure ? { key: tk.key, minor: tk.minor } : { scale: tk && tk.key != null ? { key: tk.key, minor: tk.minor } : null }); mode = H && H.some(h => !h.rest) ? (sure ? "key" : "follow") : "drums"; } } catch (e) { console.log(T.name, "ERR harm", e.message); }
  r.mode = mode; r.keyConf = tk?.conf ?? null;
  const chT = T.chords_t || (T.chords ? T.chords.map((c, i) => [T.beats[i], T.beats[i + 1] ?? T.beats[i] + 0.5, c[0], c[1]]) : null);
  const kT = T.key ? { k: NI[T.key.replace(/m$/, "")], m: T.key.endsWith("m") } : null, scale = kT ? new Set((kT.m ? [0, 2, 3, 5, 7, 8, 10, 11] : [0, 2, 4, 5, 7, 9, 11]).map(x => (x + kT.k) % 12)) : null;
  if (An?.pulse && g?.pulse) { const lo = Math.max(An.beats[0], T.played_from || 0), hi = Math.min(An.beats[An.beats.length - 1], dur - 0.3); let tot = 0, cov = 0, nN = 0, nOK = 0, nK = 0, nKOK = 0, ci = 0;
    for (let t = lo; t < hi; t += 0.05) { if (inAny(TF, t)) continue; tot++; if (!H || mode === "drums" || inAny(BF, t)) continue; const h = H.find(x => t >= x.t0 && t < x.t1); if (!h || h.rest) continue; cov++;
      const pcs = new Set([h.root, ...h.pcs]);
      if (chT) { while (ci + 1 < chT.length && chT[ci][1] <= t) ci++; const c = chT[ci]; if (c && t >= c[0] - 0.05 && t < c[1] + 0.05) { const tp = new Set(c[3]); for (const p of pcs) { nN++; if (tp.has(p)) nOK++; } } }
      if (scale) for (const p of pcs) { nK++; if (scale.has(p)) nKOK++; } }
    r.cover = tot ? +(cov / tot).toFixed(2) : 0; r.notes = nN; r.chordAcc = nN ? +(nOK / nN).toFixed(3) : null; r.nK = nK; r.keyAcc = nK ? +(nKOK / nK).toFixed(3) : null; r.nOK = nOK; r.nKOK = nKOK; }
  rows.push(r);
  if (!QUIET) console.log(`${r.name.padEnd(26)} ${String(r.meterT).padEnd(4)} ${String(r.tbpm).padEnd(6)} -> ${String(r.bpm).padEnd(6)} x${r.lvl ?? "-"}${r.compound ? "c" : ""} m${r.meter} ${String(r.status).padEnd(11)} phM ${r.phM} lvM ${r.lvM} | med ${r.med} and ${r.onAnd} sgn ${r.sgn} | tap ${r.tapM ?? "-"} ${r.tapOK ?? ""} | free leak ${r.freeLeak} miss ${r.freeMiss} | down ${r.downRec ?? "-"}/${r.downPrec ?? "-"}${r.downAfterOdd != null ? " odd " + r.downAfterOdd : ""} | ${r.mode} cov ${r.cover} acc ${r.chordAcc} key ${r.keyAcc}`);
}
fs.writeFileSync(process.env.OUT || "eval4_last.json", JSON.stringify(rows));
// summary per style
const groups = {}; for (const r of rows) (groups[`${r.set}/${r.fam}`] ||= []).push(r);
const P = (a, b) => b ? `${(100 * a / b).toFixed(0)}%` : "-";
const line = (k, R) => { const pl = R.filter(r => r.pulse), ok = R.filter(r => r.status === "right").length, gt = R.filter(r => r.gate).length, wr = R.filter(r => r.status === "WRONG").length, gw = R.filter(r => r.gate);
  const tapOK = gw.filter(r => r.tapOK).length, hv = R.filter(r => r.cover != null), cov = hv.length ? med(hv.map(r => r.cover)) : NaN, nN = R.reduce((a, r) => a + (r.notes || 0), 0), nOK = R.reduce((a, r) => a + (r.nOK || 0), 0), nK = R.reduce((a, r) => a + (r.nK || 0), 0), nKOK = R.reduce((a, r) => a + (r.nKOK || 0), 0);
  const lat = R.filter(r => r.ok && r.lvl === 1 && r.sgn != null).map(r => r.sgn), harmOn = hv.filter(r => r.mode !== "drums").length;
  return `${k.padEnd(24)} n${String(R.length).padStart(3)} | auto-right ${String(ok).padStart(3)} ${P(ok, R.length).padStart(4)} | gate ${String(gt).padStart(3)} ${P(gt, R.length).padStart(4)} | WRONG ${String(wr).padStart(2)} | nopulse ${R.length - pl.length} | tap-fix ${tapOK}/${gw.length} | harmony on ${P(harmOn, hv.length).padStart(4)} cover ${isNaN(cov) ? "-" : cov.toFixed(2)} chord-tone ${nN ? (100 * nOK / nN).toFixed(1) + "%" : "-"} in-key ${nK ? (100 * nKOK / nK).toFixed(1) + "%" : "-"} | lat med ${lat.length ? med(lat).toFixed(1) : "-"} ms`; };
console.log("\nPER STYLE (auto-right = band plays the right beat on its own; gate = asks for 4 taps; WRONG = plays a wrong beat without asking)");
for (const [k, R] of Object.entries(groups)) console.log(line(k, R));
console.log(line("ALL", rows));
const cl = rows.filter(r => r.clear); if (cl.length) console.log(line("clear rock/pop", cl));
const nc = rows.filter(r => !r.clear && r.set === "synth"); if (nc.length) console.log(line("offbeat/other synth", nc));
const fr = rows.filter(r => r.freeLeak != null && (r.fam === "rubato")); if (fr.length) console.log(`FREE (rubato) band over free playing: median ${med(fr.map(r => r.freeLeak))} s, max ${Math.max(...fr.map(r => r.freeLeak))} s; band silent over steady: median ${med(fr.map(r => r.freeMiss))} s`);
const fr2 = rows.filter(r => r.freeMiss != null && r.fam !== "rubato"); if (fr2.length) console.log(`FREE false alarms on steady takes: ${fr2.filter(r => r.freeMiss > 2).length}/${fr2.length} takes with >2 s silenced, median ${med(fr2.map(r => r.freeMiss))} s`);
const mt = rows.filter(r => r.pulse); const mm = {}; for (const r of mt) { const k = `${r.meterT}->${r.compound ? "c" : ""}${r.meter}x${r.lvl}`; mm[k] = (mm[k] || 0) + 1; } console.log("METER", JSON.stringify(mm));
const dn = rows.filter(r => r.downRec != null); if (dn.length) console.log(`DOWNBEATS (x1 grids) recall ${med(dn.map(r => r.downRec))} precision ${med(dn.map(r => r.downPrec))}; after an odd bar: ${rows.filter(r => r.downAfterOdd != null).map(r => r.downAfterOdd).join(" ")}`);
const lt = {}; for (const r of rows.filter(r => r.ok && r.lvl === 1 && r.sgn != null && r.harm)) (lt[`${r.harm}${r.atk > 10 ? "-slow" : ""}`] ||= []).push(r.sgn); if (Object.keys(lt).length) console.log("LATENCY by timbre (median signed ms, band late > 0): " + Object.entries(lt).map(([k, v]) => `${k} ${med(v).toFixed(1)} (n${v.length})`).join(", "));
