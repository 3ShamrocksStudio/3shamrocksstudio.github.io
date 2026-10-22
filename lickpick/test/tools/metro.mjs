// Set the beat (2026-10-22), end to end at WIDTH, replaces tap4.mjs. A reggae one-drop take (its loud attacks are off the
// beat): the drum on the player opens Set the beat on the Band step; the take plays with a click on LickPick's guess, the
// band stays silent; the card sits below the sticky player (heading visible), its controls are >= 44 px; − / + step and
// repeat while held; ×2 / ÷2, Flip ½, the meter chips and Tap on 1 change the click at once; Tap tempo through the real
// button on the true beats snaps the click onto them; Lock it -> the band layers up (drums, then bass, then keys, on bar
// lines) on the locked grid; the lock survives a reload; the beat chip reopens it; the save with the band uses the locked
// grid (same beats, and the saved file's hits sit on them). Plus: zero app console errors, no horizontal scroll, axe clean,
// one player, Back closes the layers then the studio. Screenshots: out/metro/wWIDTH-*.png
// usage: LPURL=... node metro.mjs [WIDTH]     (media: make_media.sh -> media/r5)
import { boot, addAndScan, openTake, M, L, HOOK, skipGates } from "./h.mjs";
import fs from "fs"; import { execFileSync } from "child_process";
const W = +(process.argv[2] || 390), D = `${L}/metro`; fs.mkdirSync(D, { recursive: true });
const truth = Object.fromEntries(JSON.parse(fs.readFileSync(`${M}/r5/truth.json`)).map(t => [t.name, t]));
const R = { width: W, checks: [] }, ok = (n, p, info = "") => { R.checks.push({ n, pass: !!p, info }); console.log(p ? "PASS" : "FAIL", `[${W}]`, n, typeof info === "string" ? info : JSON.stringify(info)); };
const axeSrc = fs.readFileSync(new URL("./axe.min.js", import.meta.url), "utf8");
const near = (arr, t) => arr.reduce((b, x) => Math.abs(x - t) < Math.abs(b - t) ? x : b, arr[0]);
const med = a => { const b = a.slice().sort((x, y) => x - y); return b[b.length >> 1]; };
const { b, ctx, pg, log } = await boot({ width: W, guest: true, init: HOOK });
const q = (f, a) => pg.evaluate(f, a);
const hscroll = () => q(() => document.documentElement.scrollWidth > innerWidth + 1 || [...document.querySelectorAll("#studio, #studio *")].some(e => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX === "visible" && e.getBoundingClientRect().right > innerWidth + 1));
const axeRun = async name => { try { await pg.addScriptTag({ content: axeSrc }); const v = await q(async () => (await axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa"], resultTypes: ["violations"] })).violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, ex: v.nodes[0]?.target?.join(" ") }))); const bad = v.filter(x => x.impact === "serious" || x.impact === "critical"); ok(`axe: no serious/critical violations (${name})`, !bad.length, bad.length ? bad : v.length); } catch (e) { ok(`axe ran (${name})`, false, e.message); } };
const st = () => q(() => { const c = __lp.t.cur(), Mx = __ck.metro, w = __lp.t.bandWindow(c); return Mx ? { d: Mx.d, bpm: __lp.t.lockBpm(c, Mx.d), B: __lp.t.lockBeats(c, Mx.d, w.s, w.e), w: [w.s, w.e], now: __lp.t.bandPreview.clock?.() ?? null } : null; });
try {
  await addAndScan(pg, [`${M}/r5/test4_reggae_00.webm`, `${M}/r5/test4_waltz_00.webm`]);
  await pg.waitForFunction(() => __ck.clips.filter(c => c.status === "done" && __lp.t.pickOf(c)).length >= 2, null, { timeout: 240000 });
  const cards = await q(() => [...document.querySelectorAll("#list .card")].map(c => c.innerText));
  await openTake(pg, Math.max(0, cards.findIndex(t => /reggae/i.test(t))));
  const T = truth.test4_reggae_00;
  ok("progress: Import and AI picks done, Set the beat next", await q(() => { const L = [...document.querySelectorAll("#sFlow li")]; return L.length === 5 && L[0].classList.contains("done") && L[1].classList.contains("done") && L[2].classList.contains("now"); }));
  // 1. the drum on the player opens Set the beat: the take plays with the click, the band is silent
  const n0 = await q(() => window.__srcLog.length);
  await pg.locator("#sStage .pb-band").click();
  await pg.waitForFunction(() => __lp.q().bandPlaying && __ck.metro && !!document.querySelector("#metro"), null, { timeout: 60000 });
  await pg.waitForTimeout(2500);
  const s1 = await q(n0 => { const c = __lp.t.cur(), K = __lp.t.bandKey(c), S = window.__srcLog.slice(n0); return { step: __ck.step, pending: __lp.t.beatPending(c), parts: K.parts, clicks: S.filter(x => x.len && x.len < 0.1).length, big: S.filter(x => x.len > 2).length, toast: document.querySelector(".toast")?.innerText || "", sections: [...document.querySelectorAll("#sPanel .sect, #sPanel .fold")].map(e => e.id) }; }, n0);
  ok("the drum opens Set the beat on the Band step, nothing else on it", s1.step === "band" && s1.sections.join() === "sec-band", s1.sections);
  ok("the click plays over your take (scheduled on the audio clock)", s1.clicks >= 3 && s1.big === 1, { clicks: s1.clicks, buffers: s1.big });
  ok("no band before the lock (no silent guessing)", s1.pending && !s1.parts.drums && !s1.parts.bass && !s1.parts.keys, s1.parts);
  ok("no toast over the card about the band or the beat", !/band|beat|tap/i.test(s1.toast), s1.toast);
  await pg.waitForTimeout(700);
  const geo = await q(() => { const h = document.querySelector("#metroH").getBoundingClientRect(), d = document.querySelector("#sDock").getBoundingClientRect(), small = [...document.querySelectorAll("#metro button")].filter(b => b.offsetParent && !b.classList.contains("linkbtn")).map(b => { const r = b.getBoundingClientRect(); return { t: b.innerText.trim().slice(0, 14), w: Math.round(r.width), h: Math.round(r.height) }; }).filter(x => x.w < 44 || x.h < 44); return { head: Math.round(h.top), dockBottom: Math.round(d.bottom), small, lockVisible: (() => { const r = document.querySelector('#metro [data-metro="lock"]').getBoundingClientRect(), bar = document.querySelector("#sBar").getBoundingClientRect(); return r.bottom <= Math.min(innerHeight, bar.top) + 1; })() }; });
  ok("the card's heading is below the sticky player, not under it", geo.head >= geo.dockBottom, geo);
  ok("every control >= 44 px", !geo.small.length, geo.small);
  await pg.screenshot({ path: `${D}/w${W}-set-the-beat.png` });
  ok("no horizontal scroll (Set the beat)", !(await hscroll()));
  await axeRun("Set the beat");
  ok("beat light on the player and in the card", await q(() => document.querySelectorAll("#sStage .mov .mdots i").length === 4 && document.querySelectorAll("#metro .mdots i").length === 4));
  const lit = await q(async () => { let n = 0; for (let i = 0; i < 40; i++) { await new Promise(r => setTimeout(r, 50)); if (document.querySelector("#metro .mdots i.on")) n++; } return n; });
  ok("the beat light pulses with the click", lit >= 3 && lit < 38, lit);
  // 2. the controls
  const a0 = await st();
  await pg.locator('#metro [data-metro="bpm+"]').click(); await pg.waitForTimeout(300); const a1 = await st();
  ok("+ = 1 BPM faster (your own tempo)", a1.d.mode === "free" && Math.abs(a1.bpm - (Math.round(a0.bpm) + 1)) < 0.01, { from: a0.bpm, to: a1.bpm });
  const bx = await pg.locator('#metro [data-metro="bpm+"]').boundingBox(); await pg.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await pg.mouse.down(); await pg.waitForTimeout(1300); await pg.mouse.up(); await pg.waitForTimeout(300);
  const a2 = await st(); ok("holding + keeps going", a2.bpm - a1.bpm >= 5, { from: a1.bpm, to: a2.bpm });
  await pg.locator('#metro [data-metro="x2"]').click(); await pg.waitForTimeout(250); const a3 = await st(); ok("×2 doubles", Math.abs(a3.bpm / a2.bpm - 2) < 0.01, [a2.bpm, a3.bpm]);
  await pg.locator('#metro [data-metro="half"]').click(); await pg.waitForTimeout(250); const a4 = await st(); ok("÷2 halves", Math.abs(a4.bpm / a3.bpm - 0.5) < 0.01, [a3.bpm, a4.bpm]);
  const b0 = a4.B[3]; await pg.locator('#metro [data-metro="flip"]').click(); await pg.waitForTimeout(250); const a5 = await st(), p5 = 60 / a5.bpm, sh = ((near(a5.B, b0 + p5 / 2) - b0) % p5 + p5) % p5;
  ok("Flip ½ moves the click half a beat", Math.abs(sh - p5 / 2) < 0.01, { sh, half: p5 / 2 });
  await pg.locator('#metro [data-metro="late"]').click(); await pg.waitForTimeout(250); const a6 = await st(); ok("Later moves the click 10 ms", Math.abs(near(a6.B, a5.B[3]) - a5.B[3] - 0.01) < 0.002 && /\+10ms/.test(await q(() => document.querySelector("#metroBpm").innerText.replace(/\s/g, ""))));
  await pg.locator('#metro [data-metro="early"]').click(); await pg.waitForTimeout(250);
  await pg.locator('#metro [data-metro="m:3/4"]').click(); await pg.waitForTimeout(300);
  ok("meter chip 3/4: three dots, the click accents every 3", await q(() => __ck.metro.d.meter === "3/4" && document.querySelectorAll("#metro .mdots i").length === 3 && document.querySelector('#metro [data-metro="m:3/4"]').getAttribute("aria-pressed") === "true"));
  await pg.locator('#metro [data-metro="m:4/4"]').click(); await pg.waitForTimeout(300);
  // the click changes at once: clicks laid after a change follow the new reading
  // 3. Tap tempo on the true beats, through the real button, on the clock you hear: the click snaps onto them
  let tapped = null; for (let k = 0; k < 2 && !tapped; k++) {
    tapped = await q(async TB => { const clk = () => __lp.t.bandPreview.clock?.() ?? -1, btn = () => document.querySelector('#metro [data-metro="tap"]'); const nx = TB.filter(x => x > clk() + 0.5).slice(0, 5); if (nx.length < 5 || !__lp.q().bandPlaying) return null;
      for (const x of nx) { while (clk() < x) await new Promise(r => setTimeout(r, 1)); btn().click(); await new Promise(r => setTimeout(r, 20)); } return nx; }, T.beats);
    if (!tapped) { await q(() => { const c = __lp.t.cur(); __lp.t.stopBand(); __lp.t.bandPreview(c, 0); }); await pg.waitForTimeout(1200); } }
  await pg.waitForTimeout(400); const a7 = await st();
  const TB = T.beats.filter(t => t > a7.w[0] + 0.5 && t < a7.w[1] - 0.5), e7 = TB.map(t => Math.abs(near(a7.B, t) - t) * 1000);
  ok("Tap tempo (5 taps on the beat): the click sits on the true beats (median < 10 ms)", med(e7) < 10, { med: +med(e7).toFixed(1), bpm: a7.bpm, mode: a7.d.mode, msg: await q(() => document.querySelector("#metroSt")?.innerText) });
  // Tap on 1 on a true downbeat
  const TD = T.down.map(i => T.beats[i]); await q(async TD => { const clk = () => __lp.t.bandPreview.clock?.() ?? -1; const x = TD.find(t => t > clk() + 0.4); if (x == null) return; while (clk() < x) await new Promise(r => setTimeout(r, 1)); document.querySelector('#metro [data-metro="one"]').click(); }, TD);
  await pg.waitForTimeout(300); const a8 = await st(), dn = await q(() => { const c = __lp.t.cur(), w = __lp.t.bandWindow(c); return __lp.t.lockDown(c, __ck.metro.d, w.s, w.e); });
  ok("Tap on 1: the bar starts on a true downbeat", Math.abs(near(TD, dn) - dn) < 0.03, { dn, near: near(TD, dn) });
  // 4. Lock it: the band layers up on bar lines (drums, then bass, then keys) on the locked grid
  const n1 = await q(() => window.__srcLog.length);
  await pg.locator('#metro [data-metro="lock"]').click();
  const build = await q(async () => { const seen = {}, t0 = performance.now(); while (performance.now() - t0 < 9000) { await new Promise(r => requestAnimationFrame(r)); document.querySelectorAll(".mov .mbuild b").forEach(b => { if (b.classList.contains("in") && seen[b.dataset.i] == null) seen[b.dataset.i] = __lp.t.bandPreview.clock?.() ?? null; }); if (Object.keys(seen).length >= 3) break; } return { seen, labels: [...document.querySelectorAll(".mov .mbuild b")].map(b => b.innerText) }; });
  const s4 = await q(n1 => { const c = __lp.t.cur(), K = __lp.t.bandKey(c), w = __lp.t.bandWindow(c), Lk = c.band.lock; return { lock: Lk, parts: K.parts, playing: __lp.q().bandPlaying, metro: !!__ck.metro, beats: K.A.beats, lockBeats: __lp.t.lockBeats(c, Lk, w.s, w.e), bars: K.A.bars.map(b => b.t0), stems: window.__srcLog.slice(n1).filter(x => x.len > 2).length, flowBeat: document.querySelector("#sFlow .fl-beat")?.classList.contains("done") }; }, n1);
  ok("Lock it: the card goes, the band plays on the lock", s4.lock && !s4.metro && s4.playing && s4.parts.drums && s4.stems >= 2, { stems: s4.stems, parts: s4.parts });
  ok("the band's grid IS the lock (same beats)", s4.beats.length === s4.lockBeats.length && s4.beats.every((t, i) => Math.abs(t - s4.lockBeats[i]) < 1e-3), { n: s4.beats.length, m: s4.lockBeats.length });
  const ins = Object.entries(build.seen).sort((x, y) => x[0] - y[0]).map(x => x[1]);
  ok("the band layers up: drums, then bass, then keys, each on a bar line", ins.length >= 2 && ins.every((t, i) => i === 0 || t > ins[i - 1] + 0.3) && ins.every(t => Math.abs(near(s4.bars.concat(s4.beats), t) - t) < 0.12), { labels: build.labels, at: ins, bars: s4.bars.slice(0, 6) });
  ok("progress: Set the beat and Band done", s4.flowBeat);
  const g = s4.beats.filter(t => t > TB[0] - 0.1 && t < TB[TB.length - 1] + 0.1), eg = TB.map(t => Math.abs(near(g, t) - t) * 1000);
  ok("after the lock the band's beats sit on the true beats (median < 10 ms)", med(eg) < 10, { med: +med(eg).toFixed(1) });
  await pg.waitForTimeout(1500); await pg.screenshot({ path: `${D}/w${W}-band-built.png` });
  ok("no horizontal scroll (band)", !(await hscroll()));
  await axeRun("band after lock");
  // 5. kept with the take
  await pg.reload({ waitUntil: "load" }); await pg.waitForTimeout(3000); await skipGates(pg);
  await pg.waitForFunction(() => __ck.clips.length >= 2 && __ck.clips.every(c => c.status === "done"), null, { timeout: 60000 });
  const cards2 = await q(() => [...document.querySelectorAll("#list .card")].map(c => c.innerText));
  await openTake(pg, Math.max(0, cards2.findIndex(t => /reggae/i.test(t))));
  const s5 = await q(() => { const c = __lp.t.cur(); return { lock: c.band?.lock, pending: __lp.t.beatPending(c) }; });
  ok("the lock is kept with the take (reload)", JSON.stringify(s5.lock) === JSON.stringify(s4.lock) && !s5.pending);
  // 6. the beat chip reopens Set the beat on the lock; "Keep the beat as it was" leaves it
  await q(() => { window.__lpStep("band"); }); await pg.waitForTimeout(800);
  await pg.locator('.bandhead [data-metro="open"]').click(); await pg.waitForFunction(() => !!document.querySelector("#metro"), null, { timeout: 30000 }); await pg.waitForTimeout(800);
  const s6 = await q(() => ({ d: __ck.metro?.d, cancel: !!document.querySelector('#metro [data-metro="cancel"]') }));
  ok("the beat chip reopens Set the beat on your lock", s6.cancel && s6.d?.mode === s4.lock.mode && Math.abs((s6.d?.bpm ?? s6.d?.u0) - (s4.lock.bpm ?? s4.lock.u0)) < 1e-6, s6);
  await pg.locator('#metro [data-metro="cancel"]').click(); await pg.waitForTimeout(800);
  ok("Keep the beat as it was: back to the band, lock unchanged", await q(L => !document.querySelector("#metro") && JSON.stringify(__lp.t.cur().band.lock) === L, JSON.stringify(s4.lock)));
  // 7. save with the band: the locked grid, and the file's hits on it
  await q(() => { const c = __lp.t.cur(); c.band.style = "rock"; c.band.gain = 0.8; c.band.parts = { drums: true, bass: false, keys: false, extra: false }; c.band.touched = { drums: true, bass: true, keys: true, extra: true }; c.snd = { ...(c.snd || {}), takeOn: false }; __lp.t.exOpts(c).band = true; __lp.t.stopBand(); window.__lpExport(); });
  await pg.waitForTimeout(800);
  const label = await q(() => document.querySelector('[data-act="export-go"]')?.textContent || "");
  const dl = pg.waitForEvent("download", { timeout: 240000 }).catch(() => null);
  await pg.locator('[data-act="export-go"]').click();
  const d = await dl; let hitMed = null;
  if (d) { const pth = `${D}/w${W}-export.mp4`; await d.saveAs(pth); const raw = execFileSync("ffmpeg", ["-v", "error", "-i", pth, "-f", "f32le", "-ac", "1", "-ar", "44100", "-"], { maxBuffer: 1 << 28 }); const x = new Float32Array(raw.buffer, raw.byteOffset, raw.length >> 2);
    const H = 88, E = []; for (let i = 0; i + H <= x.length; i += H) { let s = 0; for (let j = i; j < i + H; j++) s += x[j] * x[j]; E.push(s / H); } let mx = 0; for (const e of E) mx = Math.max(mx, e);
    const on = []; let last = -1e9; for (let i = 3; i < E.length - 8; i++) { const pr = (E[i - 1] + E[i - 2] + E[i - 3]) / 3; if (E[i] > 6 * pr && E[i] > 0.05 * mx && i - last > 25) { on.push(i * H / 44100); last = i; } }
    const s0 = await q(() => __lp.t.srcOf(__lp.t.cur()).ranges[0][0]); const e = s4.beats.map(b0 => { const o = near(on, b0 - s0) + s0; return Math.abs(o - b0) < 0.04 ? Math.abs(o - near(TB, o)) * 1000 : null; }).filter(v => v != null && v < 60); hitMed = e.length >= 8 ? +med(e).toFixed(1) : null; R.exportHits = e.length; }
  const s7 = await q(() => { const c = __lp.t.cur(), K = __lp.t.bandKey(c), w = __lp.t.bandWindow(c); return { same: JSON.stringify(K.A.beats) === JSON.stringify(__lp.t.lockBeats(c, c.band.lock, w.s, w.e)) }; });
  ok("save with the band (drums, take muted): the file is made on the locked grid, its hits on the true beats (median < 10 ms)", !!d && /band/.test(label) && s7.same && hitMed != null && hitMed < 10, { label: label.trim(), hitMed, hits: R.exportHits });
  await q(() => { document.querySelector("#exportSheet").hidden = true; }); await pg.waitForTimeout(1200);
  // 8. one player, Back
  const vids = await q(() => [...document.querySelectorAll("video")].filter(v => v.offsetParent && v.getBoundingClientRect().width > 0).length);
  ok("one player on screen", vids === 1, { visibleVideos: vids });
  await q(() => window.__lpExport()); await pg.waitForTimeout(800);
  const layers0 = await q(() => ["studio", "exportSheet", "winSheet", "proSheet", "recSheet"].filter(id => document.getElementById(id) && !document.getElementById(id).hidden));
  let nBack = 0; for (; nBack < 4; nBack++) { if (await q(() => document.getElementById("studio").hidden)) break; await pg.goBack(); await pg.waitForTimeout(1200); }
  const back = await q(() => ({ studio: !document.getElementById("studio")?.hidden, list: !!document.querySelector("#list .card")?.offsetParent, sheet: !document.getElementById("exportSheet").hidden }));
  ok("Back closes the open layers (save sheet), then the studio, to the list", !back.studio && !back.sheet && back.list && nBack === layers0.length, { ...back, layers0, backs: nBack });
  // 9. a waltz: the guess is 3/4 and the click accents every 3
  const cards3 = await q(() => [...document.querySelectorAll("#list .card")].map(c => c.innerText));
  await openTake(pg, Math.max(0, cards3.findIndex(t => /waltz/i.test(t))));
  await pg.locator("#sStage .pb-band").click(); await pg.waitForFunction(() => !!document.querySelector("#metro"), null, { timeout: 60000 }); await pg.waitForTimeout(1500);
  ok("waltz: Set the beat starts on 3/4", await q(() => __ck.metro?.d.meter === "3/4" && document.querySelectorAll("#metro .mdots i").length === 3));
  // 10. (390 only) a take that speeds up 100 -> 105 BPM: the click follows it, "Keep strict tempo" makes it one straight tempo
  if (W === 390) {
    for (let i = 0; i < 3 && await q(() => !document.getElementById("studio").hidden); i++) { await pg.goBack(); await pg.waitForTimeout(800); }
    await addAndScan(pg, [`${M}/t5_drift100to105.webm`]); await pg.waitForFunction(() => __ck.clips.some(c => /drift/.test(c.name) && c.status === "done" && __lp.t.pickOf(c)), null, { timeout: 240000 });
    const cards4 = await q(() => [...document.querySelectorAll("#list .card")].map(c => c.innerText)); await openTake(pg, Math.max(0, cards4.findIndex(t => /drift/i.test(t))));
    await q(() => { const c = __lp.t.cur(), p = __lp.t.pickOf(c), k = `${c._picks?.key}|${c.pickSel || 0}`; c.pickAdj = c.pickAdj || {}; c.pickAdj[k] = { s: -p.s, e: c.raw.duration - p.e }; __lp.t.renderStudio(); });
    await pg.locator("#sStage .pb-band").click(); await pg.waitForFunction(() => !!document.querySelector("#metro"), null, { timeout: 60000 }); await pg.waitForTimeout(1200);
    const ivs = B => { const d = B.slice(1).map((t, i) => t - B[i]); return [d.slice(0, 16).reduce((a, x) => a + x, 0) / 16, d.slice(-16).reduce((a, x) => a + x, 0) / 16]; };
    const f0 = await st(), sw = await pg.locator('#metro [data-metro="strict"]').count();
    ok("drifting take: the click follows it (first vs last beats differ), Keep strict tempo is offered", sw === 1 && ivs(f0.B)[0] / ivs(f0.B)[1] > 1.03, { iv: ivs(f0.B).map(x => +x.toFixed(4)) });
    if (sw) { await pg.locator('#metro [data-metro="strict"]').click(); await pg.waitForTimeout(300); const f1 = await st(); ok("Keep strict tempo: one straight tempo", Math.abs(ivs(f1.B)[0] / ivs(f1.B)[1] - 1) < 0.002 && f1.d.strict, { iv: ivs(f1.B).map(x => +x.toFixed(4)) }); }
  }
} catch (err) { ok("flow ran", false, String(err.message || err).slice(0, 300)); await pg.screenshot({ path: `${D}/w${W}-ERR.png` }).catch(() => { }); }
const errs = log.console.filter(x => x.startsWith("[error]") && !/favicon|ERR_|net::|Failed to load resource/.test(x));
ok("zero app console errors", !errs.length && !log.pageerr.length, { console: errs.slice(0, 5), pageerr: log.pageerr.slice(0, 5) });
fs.writeFileSync(`${D}/w${W}.json`, JSON.stringify(R, null, 1));
await b.close();
process.exit(R.checks.every(c => c.pass) ? 0 : 1);
