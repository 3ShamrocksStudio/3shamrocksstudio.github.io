// Hostile UX flows on the LIVE app. usage: node flows.mjs WIDTH
import { boot, M, L, vis, HOOK, URL as APPURL } from "./h.mjs";
import fs from "fs"; import { execSync } from "child_process";
const W = +(process.argv[2] || 390), tag = `w${W}`, D = `${L}/flows/${tag}`; fs.mkdirSync(D, { recursive: true });
const { b, ctx, pg, log } = await boot({ width: W, guest: false, init: HOOK });
const R = { width: W, checks: [], taps: {}, ctas: {}, small: {}, hs: {}, overlaps: {}, videos: {}, axe: {} };
const ok = (name, pass, info = "") => { R.checks.push({ name, pass: !!pass, info: typeof info === "string" ? info.slice(0, 400) : JSON.stringify(info).slice(0, 400) }); console.log(pass ? "PASS" : "FAIL", name, typeof info === "string" ? info.slice(0, 160) : JSON.stringify(info).slice(0, 160)); };
const shot = n => pg.screenshot({ path: `${D}/${n}.png` }).catch(() => { });
const step = async (n, f) => { try { await f(); } catch (e) { ok(`step ${n} ran`, false, e.message.split("\n")[0]); await shot(`ERR-${n}`); } };
let taps = 0; const tap = async (sel, o = {}) => { const el = pg.locator(sel).filter({ visible: true }).first(); await el.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => { }); try { await el.click({ timeout: 3000, ...o }); } catch (e) { if (!/not stable/.test(e.message)) throw e; await el.click({ timeout: 3000, force: true, ...o }); } taps++; await pg.waitForTimeout(o.wait ?? 500); };
const q = (f, a) => pg.evaluate(f, a);
// per-screen audits
const axeSrc = fs.readFileSync(new URL("./axe.min.js", import.meta.url), "utf8");
async function audit(name) {
  await shot(name);
  R.hs[name] = await q(() => [document.documentElement.scrollWidth, innerWidth, Math.max(...[...document.querySelectorAll("body *")].filter(e => e.offsetParent).map(e => e.getBoundingClientRect().right))].map(Math.round));
  R.videos[name] = await q(() => ({ total: document.querySelectorAll("video").length, visible: [...document.querySelectorAll("video")].filter(v => v.offsetParent && v.getBoundingClientRect().width > 0).length, controls: document.querySelectorAll("video[controls]").length }));
  // visible interactive elements, their sizes, labels, and pairwise overlaps
  const I = await q(() => { const top = [...document.querySelectorAll("button, a[href], [role=button], [role=slider], input:not([type=hidden]), select, summary")].filter(e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return e.offsetParent !== null && r.width > 0 && r.height > 0 && s.visibility !== "hidden" && r.bottom > 0 && r.top < innerHeight && !e.closest("[hidden]"); });
    const lab = e => (e.getAttribute("aria-label") || e.textContent || e.dataset.act || e.className || "").trim().replace(/\s+/g, " ").slice(0, 40);
    const hit = e => { const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2; const h = document.elementFromPoint(Math.min(innerWidth - 1, Math.max(0, x)), Math.min(innerHeight - 1, Math.max(0, y))); return !h || e.contains(h) || h.contains(e) || !!h.closest("label")?.contains(e); };
    const els = top.map(e => ({ l: lab(e), r: (e.matches("input") && e.closest("label") ? e.closest("label") : e).getBoundingClientRect().toJSON(), covered: !hit(e), e }));   // a labelled input is tapped through its label
    const ov = []; for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) { const a = els[i], b2 = els[j]; if (a.e.contains(b2.e) || b2.e.contains(a.e)) continue; const ix = Math.min(a.r.right, b2.r.right) - Math.max(a.r.left, b2.r.left), iy = Math.min(a.r.bottom, b2.r.bottom) - Math.max(a.r.top, b2.r.top); if (ix > 2 && iy > 2) ov.push(`${a.l} ✕ ${b2.l} (${Math.round(ix)}x${Math.round(iy)})`); }
    return { small: els.filter(x => x.r.width < 44 || x.r.height < 44).map(x => `${x.l} ${Math.round(x.r.width)}x${Math.round(x.r.height)}`), covered: els.filter(x => x.covered).map(x => x.l), ov, labels: els.map(x => x.l), offscreenX: els.filter(x => x.r.right > innerWidth + 1 || x.r.left < -1).map(x => x.l) }; });
  R.unreach = R.unreach || {}; R.unreach[name] = await q(() => { const out = []; const sy = scrollY; const els = [...document.querySelectorAll("button, a[href], [role=button], [role=slider], input:not([type=hidden]), summary")].filter(e => e.offsetParent && e.getBoundingClientRect().width > 0 && getComputedStyle(e).visibility !== "hidden");
    const sc = new Map(); for (const e of els) { let p = e.parentElement; while (p) { if (p.scrollHeight > p.clientHeight + 2 || p.scrollWidth > p.clientWidth + 2) sc.set(p, [p.scrollLeft, p.scrollTop]); p = p.parentElement; } }
    for (const e of els) { e.scrollIntoView({ block: "center", inline: "center" }); const r = e.getBoundingClientRect(); if (r.top < 0 || r.bottom > innerHeight) continue; const x = r.left + r.width / 2, y = r.top + r.height / 2; const h = document.elementFromPoint(x, y); if (h && !e.contains(h) && !h.contains(e) && !h.closest("label")?.contains(e)) out.push(`${(e.getAttribute("aria-label") || e.textContent || "").trim().replace(/\s+/g, " ").slice(0, 30)} ← ${(h.closest("button,a,[id]")?.id || h.className?.baseVal || h.className || h.tagName).toString().slice(0, 30)}`); }
    for (const [p, [l, t]] of sc) { p.scrollLeft = l; p.scrollTop = t; } scrollTo(0, sy); return out; });
  R.small[name] = I.small; R.overlaps[name] = { ov: I.ov, covered: I.covered, offX: I.offscreenX }; R.ctas[name] = I.labels;
  // axe (wcag2 a/aa)
  try { await pg.addScriptTag({ content: axeSrc }).catch(() => { }); R.axe[name] = await q(async () => { const r = await axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa"], resultTypes: ["violations"] }); return r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, ex: v.nodes.slice(0, 3).map(n => (n.target.join(" ") + " :: " + (n.any[0]?.message || n.failureSummary || "")).slice(0, 200)) })); }); } catch (e) { R.axe[name] = "axe failed " + e.message.slice(0, 80); }
}
const hsOk = n => { const h = R.hs[n]; return h && h[0] <= h[1]; };

// ---------- 0. first run
await pg.waitForTimeout(500); await audit("00-signgate");
ok("sign gate: no horizontal scroll", hsOk("00-signgate"), R.hs["00-signgate"]);
R.firstRunScreens = [await q(() => [...document.querySelectorAll(".layer:not([hidden]), .scrim:not([hidden]), #signgate:not([hidden])")].map(e => e.id))];
await tap('[data-act="acct-skip"]', { wait: 1200 }); await audit("00b-welcome");
R.firstRunScreens.push(await q(() => [...document.querySelectorAll(".layer:not([hidden]), .scrim:not([hidden]), #signgate:not([hidden])")].map(e => e.id)));
ok("welcome: no horizontal scroll", hsOk("00b-welcome"), R.hs["00b-welcome"]);

// ---------- 1. import a mixed bag via the real "Add jams" button
const bag = [`${M}/t3_rock128.webm`, `${M}/t1_ballad70.webm`, `${M}/edge/portrait_shuffle.webm`, `${M}/edge/zero_byte.webm`, `${M}/edge/truncated.webm`, `${M}/edge/garbage.mp4`, `${M}/edge/no_audio.webm`, `${M}/edge/audio_only.webm`, `${M}/edge/rock128_h264.mp4`];
if (W >= 1280) bag.push(`${M}/edge/huge.webm`);
await step("import", async () => {
  taps = 1; const fc = pg.waitForEvent("filechooser", { timeout: 8000 }); fc.catch(() => { });
  if (await vis(pg, '[data-act="ob-gallery"]:visible')) await tap('[data-act="ob-gallery"]', { wait: 0 }); else await tap('[data-act="gallery"]', { wait: 0 }); const ch = await fc; await ch.setFiles(bag); R.taps.import = taps + 1 /* choose files in OS picker */;
  await pg.waitForTimeout(1500); await audit("01-scanning");
  R.pillsScanning = await q(() => [...document.querySelectorAll("#list .card")].map(c => c.innerText.replace(/\s+/g, " ").slice(0, 90)));
});
// reload mid-scan (desktop only does it later; here: just observe the queue)
const t0 = Date.now();
await step("scan settles", async () => {
  await pg.waitForFunction(n => window.__ck && __ck.clips.length >= 1 && __ck.clips.every(c => !["queued", "listening"].includes(c.status)), bag.length, { timeout: 600000, polling: 1000 });
});
R.scanAllMs = Date.now() - t0;
await pg.waitForTimeout(1500); await audit("02-list");
R.clips = await q(() => __ck.clips.map(c => ({ name: c.name, status: c.status, size: c.size, err: c.err || c.why || null, tempo: c.raw?.info?.tempo, key: c.raw?.info?.key, pick: !!(c.status === "done" && __lp.t.pickOf(c)) })));
R.cards = await q(() => [...document.querySelectorAll("#list .card")].map(c => c.innerText.replace(/\s+/g, " ").slice(0, 120)));
ok("every imported file shows up (as a take or a clear 'can't read')", R.cards.length + (R.toasts?.length || 0) >= bag.length - 1, `${R.cards.length} cards for ${bag.length} files`);
ok("list: no horizontal scroll", hsOk("02-list"), R.hs["02-list"]);

// ---------- 2. studio on the rock take
const idx = await q(() => [...document.querySelectorAll("#list .card")].findIndex(c => /t3 rock128/.test(c.innerText)));
await step("open studio", async () => { taps = 0; await pg.locator("#list .card").nth(Math.max(0, idx)).click(); taps++; await pg.waitForTimeout(2000); R.taps.open = taps; });
await pg.waitForFunction(() => __lp.t.cur() && __lp.t.pickOf(__lp.t.cur()), null, { timeout: 30000 }).catch(() => { });
await audit("03-studio-cut");
ok("studio: exactly one video element", R.videos["03-studio-cut"].total === 1 && R.videos["03-studio-cut"].visible === 1, R.videos["03-studio-cut"]);
ok("studio cut: no horizontal scroll", hsOk("03-studio-cut"), R.hs["03-studio-cut"]);
const pv = () => q(() => { const { video, player, bandPlaying } = __lp.q(); return { paused: video.paused, t: +video.currentTime.toFixed(2), rate: video.playbackRate, muted: video.muted, band: bandPlaying, virt: +(player.virt?.() || 0).toFixed(2), loop: player.loop, fs: !!document.fullscreenElement }; });
await step("play/pause", async () => {
  const big = await vis(pg, "#sStage .bigplay");
  await tap("#sStage .pb-play", { wait: 1500 }); const a = await pv(); await tap("#sStage .pb-play", { wait: 400 }); const b2 = await pv();
  ok("bar play starts the take", !a.paused && a.t > 0, a); ok("bar pause stops it", b2.paused, b2); R.bigPlayBeforeFirstPlay = big;
});
await step("scrub", async () => {
  const box = await pg.locator("#sStage .ptrack").boundingBox(); const t1 = await pv();
  await pg.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2); await pg.mouse.down(); await pg.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2, { steps: 6 }); await pg.mouse.up(); await pg.waitForTimeout(500);
  const t2 = await pv(); const tot = await q(() => __lp.q().player.total());
  ok("scrub (drag) moves the playhead to ~70%", Math.abs(t2.virt / tot - 0.7) < 0.06, { before: t1.virt, after: t2.virt, tot });
});
await step("speed", async () => {
  const lab = []; for (let i = 0; i < 3; i++) { await tap("#sStage .pb-speed", { wait: 200 }); lab.push(await pg.locator("#sStage .pb-speed").innerText()); }
  await tap("#sStage .pb-speed", { wait: 200 }); await tap("#sStage .pb-play", { wait: 1200 }); const s = await pv(); await tap("#sStage .pb-play", { wait: 300 });
  ok("speed cycles 1× → ¾× → ½× and applies to the video", lab.join(",") === "¾×,½×,1×" && Math.abs(s.rate - 0.75) < 0.01, { lab, rate: s.rate });
  await tap("#sStage .pb-speed", { wait: 200 }); await tap("#sStage .pb-speed", { wait: 200 });   // back to 1×
  R.speedAfterReset = await pg.locator("#sStage .pb-speed").innerText();
});
await step("loop", async () => {
  await tap("#sStage .pb-loop", { wait: 800 }); const s = await pv(); ok("loop: one tap from paused loops + plays", s.loop && !s.paused, s);
  const pk = await q(() => { const p = __lp.t.pickOf(__lp.t.cur()); return [p.s, p.e]; }); await q(e => { __lp.q().video.currentTime = e - 0.4; }, pk[1]); await pg.waitForTimeout(1500);
  const s2 = await pv(); ok("loop: wraps to the Pick start at the end", s2.t >= pk[0] && s2.t < pk[0] + 2, { pk, t: s2.t });
  await tap("#sStage .pb-loop", { wait: 200 }); await tap("#sStage .pb-play", { wait: 300 });
});
await step("fullscreen", async () => {
  await tap("#sStage .pb-full", { wait: 800 }); const f = await pv(); await shot("04-fullscreen");
  ok("fullscreen button enters fullscreen", f.fs, f);
  if (f.fs) { await tap("#sStage .pb-full", { wait: 600 }); }
  R.studioOpenAfterFsEsc = await q(() => !document.getElementById("studio").hidden && !document.fullscreenElement);
  ok("fullscreen button toggles back out, studio stays", R.studioOpenAfterFsEsc);
});
// ---------- 3. band from the player
await step("band on", async () => {
  if (!R.studioOpenAfterFsEsc) { await pg.locator("#list .card").nth(Math.max(0, idx)).click(); await pg.waitForTimeout(1500); }
  taps = 0; await tap("#sStage .pb-band", { wait: 0 });
  const tB = Date.now(); await pg.waitForFunction(() => __lp.q().bandPlaying && __lp.q().player.ext && !__lp.q().video.paused, null, { timeout: 60000 }); R.bandStartMs = Date.now() - tB;
  R.taps.bandOn = 1 + 1; await pg.waitForTimeout(1500); await audit("05-band-playing");
  ok("band: one tap on the player = band plays", true, `${R.bandStartMs} ms to sound`);
});
await step("speed during band", async () => {
  const before = await pv(); await tap("#sStage .pb-speed", { wait: 600 }); const after = await pv(); const toast = await q(() => document.querySelector(".toast, #toast")?.innerText || "");
  ok("speed during band: band keeps 1× and tells you why", after.band && Math.abs(after.rate - 1) < 0.05 && /Speed/.test(toast), { before: before.rate, after: after.rate, toast });
});
await step("scrub during band", async () => {
  const box = await pg.locator("#sStage .ptrack").boundingBox(); const n0 = await q(() => __srcLog.length);
  await pg.mouse.move(box.x + box.width * 0.1, box.y + box.height / 2); await pg.mouse.down(); await pg.mouse.move(box.x + box.width * 0.55, box.y + box.height / 2, { steps: 5 }); await pg.mouse.up();
  await pg.waitForTimeout(2500); const s = await pv(), x = await q(() => __lp.q().player.ext ? __lp.q().player.ext() / __lp.q().player.extTotal : -1);
  const restarted = await q(n0 => __srcLog.slice(n0).map(e => [+e.off.toFixed(2), +(e.len || 0).toFixed(1), e.buf?.numberOfChannels]), n0);
  ok("scrub during band: band + take restart together at ~55%", s.band && x > 0.5 && x < 0.75, { x, restarted });
  // keyboard scrub
  await pg.locator("#sStage .ptrack").focus(); const x1 = await q(() => __lp.q().player.ext?.()); await pg.keyboard.press("ArrowRight"); await pg.waitForTimeout(2000); const x2 = await q(() => __lp.q().player.ext?.());
  ok("keyboard → on the scrubber skips ~5 s with the band", x2 - x1 > 4 && x2 - x1 < 9, { x1, x2 });
});
await step("A/V drift during band (30s)", async () => {
  await pg.locator("#sStage .ptrack").focus(); for (let i = 0; i < 6; i++) await pg.keyboard.press("ArrowLeft"); await pg.waitForTimeout(1500);
  if (!(await q(() => __lp.q().bandPlaying))) { await tap("#sStage .pb-play", { wait: 1500 }); }
  const d = await q(async () => { const { player, video } = __lp.q(), c = __lp.t.cur(), w = __lp.t.bandWindow(c), out = []; for (let i = 0; i < 60; i++) { await new Promise(r => setTimeout(r, 500)); if (!player.ext) { out.push(null); continue; } out.push(+((video.currentTime - (w.s + player.ext())) * 1000).toFixed(0)); } return out; });
  R.avDrift = d; const a = d.filter(x => x != null).map(Math.abs).sort((x, y) => x - y);
  ok("picture vs heard band: median <45 ms, max <150 ms over 30 s", a[a.length >> 1] < 45 && a[a.length - 1] < 150, { med: a[a.length >> 1], max: a[a.length - 1], n: a.length });
});
await step("loop during band", async () => {
  await tap("#sStage .pb-loop", { wait: 300 });
  const tot = await q(() => __lp.q().player.extTotal); const box = await pg.locator("#sStage .ptrack").boundingBox();
  await pg.mouse.click(box.x + box.width * 0.97, box.y + box.height / 2); await pg.waitForTimeout(Math.max(3000, tot * 0.03 * 1000 + 2500));
  const s = await pv(), x = await q(() => __lp.q().player.ext?.());
  ok("loop with the band: wraps to the top and keeps the band", s.band && x < 3, { band: s.band, x, tot });
  await tap("#sStage .pb-loop", { wait: 200 });
});
await step("band panel", async () => {
  taps = 0; await tap('.stepbar [data-sc="band"]', { wait: 1200 }); await audit("06-band-panel");
  ok("band panel: no horizontal scroll", hsOk("06-band-panel"), R.hs["06-band-panel"]);
  // nudge while playing: band restarts from the same spot, grid moves 10 ms
  const g0 = await q(() => __lp.t.bandKey(__lp.t.cur()).A.beats[2]); const p0 = await q(() => __lp.q().player.ext?.());
  await tap('[data-bnudge="10"]', { wait: 1500 }); const g1 = await q(() => __lp.t.bandKey(__lp.t.cur()).A.beats[2]); const s = await pv(); const p1 = await q(() => __lp.q().player.ext?.());
  ok("nudge +10 ms shifts the band grid by 10 ms and keeps playing from the same spot", Math.abs((g1 - g0) - 0.01) < 1e-4 && s.band && p1 >= p0 - 0.5, { d: g1 - g0, band: s.band, p0, p1 });
  await tap('[data-bnudge="0"]', { wait: 1200 });
  // ½ beat
  const h0 = await q(() => __lp.t.bandKey(__lp.t.cur()).A.beats.slice(0, 3)); const hb = await pg.locator('[data-bfix="shift"]').filter({ visible: true }).count();
  if (hb) { await tap('[data-bfix="shift"]', { wait: 1500 }); const h1 = await q(() => __lp.t.bandKey(__lp.t.cur()).A.beats.slice(0, 3)); const s2 = await pv();
    ok("½ beat moves the band half a beat and keeps playing", s2.band && Math.abs((h1[0] - h0[0]) - (h0[1] - h0[0]) / 2) < 0.03, { h0, h1, band: s2.band }); await tap('[data-bfix="shift"]', { wait: 1200 }); }
  else ok("½ beat button present", false, "not visible");
  // tap tempo while playing: 6 taps on a deliberately different tempo (100 BPM) → band should follow it audibly
  const n0 = await q(() => __srcLog.length); const bpm0 = await q(() => __lp.t.bandKey(__lp.t.cur()).A.bpm);
  for (let i = 0; i < 6; i++) { await pg.locator('[data-bpm="tap"]').filter({ visible: true }).first().click(); await pg.waitForTimeout(600); }
  await pg.waitForTimeout(1500); const bpm1 = await q(() => __lp.t.bandKey(__lp.t.cur()).A.bpm); const restarted = await q(n0 => __srcLog.slice(n0).length, n0); const toast = await q(() => document.querySelector(".toast, #toast")?.innerText || "");
  ok("tap tempo while playing: band changes AND the playing band is re-rendered", bpm1 !== bpm0 && restarted > 0, { bpm0, bpm1, newSources: restarted, toast });
  await q(() => { const c = __lp.t.cur(); delete c.band.grid; c._bandA = null; });
  // style change: one tap
  taps = 0; const st = await q(() => [...document.querySelectorAll("[data-bstyle]")].map(b => b.dataset.bstyle)); R.styles = st;
  const pick = st.find(s => s !== "auto" && s !== "rock") || st[1];
  await tap(`[data-bstyle="${pick}"]`, { wait: 0 }); await pg.waitForFunction(() => __lp.q().bandPlaying && __lp.q().player.ext, null, { timeout: 30000 }); R.taps.styleFromBandTab = taps;
  ok("style chip: one tap = new style plays", await q(s => __lp.t.cur().band.style === s && __lp.q().bandPlaying, pick), pick);
  // every style renders without error
  const errs = []; for (const s of st) { try { await q(s => { __lp.t.cur().band.style = s; }, s); const r = await q(async () => { const x = await __lp.t.bandRender(__lp.t.cur()); return { d: x.buffer?.duration, st: Object.keys(x.stems || {}) }; }); if (!r.d) errs.push(s + ":nobuf"); } catch (e) { errs.push(s + ":" + e.message.slice(0, 60)); } }
  ok("every style renders", !errs.length, errs);
  await q(() => { __lp.t.cur().band.style = "auto"; });
  // band level
  await q(() => { const r = document.getElementById("bandGain"); r.value = "0.4"; r.dispatchEvent(new Event("input", { bubbles: true })); });
  ok("band level slider sets gain", await q(() => Math.abs(__lp.t.cur().band.gain - 0.4) < 1e-6));
});
await step("tool rail", async () => {
  for (const k of ["look", "post", "choose"]) { const has = await pg.locator(`.stepbar [data-sc="${k}"]`).count(); if (!has) { ok(`tool ${k} exists`, false); continue; } await tap(`.stepbar [data-sc="${k}"]`, { wait: 900 }); await audit(`07-tool-${k}`); ok(`tool ${k}: no h-scroll`, hsOk(`07-tool-${k}`), R.hs[`07-tool-${k}`]); }
  R.railLabels = await q(() => [...document.querySelectorAll(".stepbar [data-sc]")].map(b => b.dataset.sc + ":" + b.innerText.trim()));
});
await step("trim", async () => {
  await q(() => __lp.t.pausePlay()); const p0 = await q(() => { const p = __lp.t.pickOf(__lp.t.cur()); return [p.s, p.e]; });
  taps = 0; await tap('[data-padj="e:-1"]', { wait: 600 }); const p1 = await q(() => { const p = __lp.t.pickOf(__lp.t.cur()); return [p.s, p.e]; }); R.taps.trimEndBar = 1 + taps;
  await tap('[data-padj="s:1"]', { wait: 600 }); const p2 = await q(() => { const p = __lp.t.pickOf(__lp.t.cur()); return [p.s, p.e]; });
  ok("trim: End −1 bar and Start +1 bar move by ~a bar", p0[1] - p1[1] > 0.8 && p2[0] - p1[0] > 0.8, { p0, p1, p2 });
  // spam −1 bar on the end 30x: should stop at a sane minimum, never invert
  for (let i = 0; i < 30; i++) await pg.locator('[data-padj="e:-1"]').filter({ visible: true }).first().click({ timeout: 2000 }).catch(() => { });
  const p3 = await q(() => { const p = __lp.t.pickOf(__lp.t.cur()); return [p.s, p.e]; }); ok("trim spam: Pick never shorter than ~3 s or inverted", p3[1] - p3[0] >= 2.9, p3);
  await audit("08-trim-spam");
  await pg.locator('[data-padj="reset"]').filter({ visible: true }).first().click().catch(() => { }); await pg.waitForTimeout(400);
});
// ---------- 4. save (no band) and save with band
const saveOnce = async (label) => {
  const dl = pg.waitForEvent("download", { timeout: 240000 }).catch(() => null);
  taps = 0; await tap('#sBar [data-act="export-open"]', { wait: 900 }); await audit(`09-save-sheet-${label}`);
  const goes = await q(() => [...document.querySelectorAll("#exportSheet button")].filter(b => b.offsetParent).map(b => (b.dataset.act || "") + ":" + b.innerText.trim().slice(0, 30)));
  R.ctas[`save-sheet-${label}-buttons`] = goes;
  await tap('[data-act="export-go"]', { wait: 0 });
  const d = await dl; R.taps[`save_${label}`] = taps + (R.taps.open || 1);
  if (!d) { ok(`save ${label}: a file downloads`, false, await q(() => document.querySelector("#exportSheet")?.innerText.slice(0, 300))); return null; }
  const p = `${D}/saved-${label}-${d.suggestedFilename()}`; await d.saveAs(p);
  let probe = ""; try { probe = execSync(`ffprobe -v error -show_entries stream=codec_name,width,height,duration -of csv=p=0 "${p}"`).toString().trim().replace(/\n/g, " | "); } catch (e) { probe = "ffprobe failed"; }
  ok(`save ${label}: a playable file downloads`, /vp9|h264|av1|hevc/.test(probe), `${d.suggestedFilename()} ${probe}`);
  await pg.waitForTimeout(4000); await audit(`10-after-save-${label}`);
  R.afterSaveLayers = R.afterSaveLayers || {}; R.afterSaveLayers[label] = await q(() => [...document.querySelectorAll(".scrim:not([hidden]), .layer:not([hidden])")].map(e => e.id + ":" + e.innerText.replace(/\s+/g, " ").slice(0, 80)));
  for (const s of ['#winSheet [data-act="win-close"]', '[data-act="export-close"]', '[data-act="made-close"]', '[data-act="win-close"]']) if (await vis(pg, s)) { await pg.locator(s).filter({ visible: true }).first().click().catch(() => { }); await pg.waitForTimeout(300); }
  return p;
};
await step("save plain", async () => { await q(() => { __lp.t.bandToggle && __lp.t.exOpts(__lp.t.cur()).band && __lp.t.bandToggle(__lp.t.cur(), false); }); await pg.waitForTimeout(500); R.savedPlain = await saveOnce("plain"); });
await step("save with band", async () => {
  if (!(await q(() => !document.getElementById("studio").hidden))) { await pg.locator("#list .card").nth(Math.max(0, idx)).click(); await pg.waitForTimeout(1500); }
  await q(() => { const c = __lp.t.cur(); c.band && (c.band.style = "rock", c.band.gain = 0.8); });
  if (!(await q(() => __lp.t.exOpts(__lp.t.cur()).band))) { await tap("#sStage .pb-band", { wait: 2500 }); }
  R.savedBand = await saveOnce("band");
});
// ---------- 5. My licks
await step("my licks", async () => {
  for (let i = 0; i < 3 && await q(() => !document.getElementById("studio").hidden); i++) { await pg.goBack(); await pg.waitForTimeout(600); }
  ok("Back closes the studio (stays in the app)", pg.url().includes("/lickpick/app") && await q(() => document.getElementById("studio").hidden), pg.url());
  taps = 0; await tap('.nav [data-view="made"]', { wait: 1000 }); await audit("11-mylicks");
  const items = await pg.locator("[data-made-play]").count(); R.mylicksItems = items;
  if (items) { await pg.locator("[data-made-play]").first().click(); taps++; await pg.waitForTimeout(1200); const pb = await vis(pg, "#madeStage .pb-play"); if (pb) { const p = await q(() => !document.querySelector("#madeStage video").paused); if (!p) { await tap("#madeStage .pb-play", { wait: 800 }); } }
    R.taps.watchSaved = taps; await audit("12-mylicks-player");
    ok("My licks: branded player, no native controls, one visible video", R.videos["12-mylicks-player"].controls === 0 && R.videos["12-mylicks-player"].visible === 1, R.videos["12-mylicks-player"]);
    ok("My licks player plays", await q(() => { const v = document.querySelector("#madeStage video"); return v && !v.paused && v.currentTime > 0; }));
    await pg.goBack(); await pg.waitForTimeout(600); ok("Back closes the My licks player", !(await vis(pg, "#madeSheet")));
  } else ok("My licks has the saved items", false, "0 items");
});
// ---------- 6. menu, privacy, delete, sign-in
await step("menu", async () => {
  await tap('.nav [data-view="clips"]', { wait: 400 }); await tap('.nav [data-act="menu-open"]', { wait: 700 }); await audit("13-menu");
  R.menuRows = await q(() => [...document.querySelectorAll("#rules .mrow")].filter(e => e.offsetParent).map(e => e.innerText.replace(/\s+/g, " ").slice(0, 60)));
  ok("menu has Privacy policy", R.menuRows.some(r => /Privacy/i.test(r)), R.menuRows);
  ok("menu has delete my data / account (guest too)", R.menuRows.some(r => /delete|erase|clear/i.test(r)), R.menuRows);
  const href = await q(() => document.querySelector('#rules a[href*="privacy"]')?.href); if (href) { const r = await pg.request.get(href); ok("privacy link resolves (200)", r.status() === 200, `${r.status()} ${href}`); }
  await pg.goBack(); await pg.waitForTimeout(500); ok("Back closes the menu", !(await vis(pg, "#rules")));
});
await step("sign-in", async () => {
  await tap('.nav [data-act="menu-open"]', { wait: 600 });
  const btn = pg.locator('[data-act="acct-in"]').filter({ visible: true }).first();
  if (!(await btn.count())) { ok("sign-in button reachable from the menu", false, "no visible acct-in in menu"); await pg.goBack(); return; }
  const pop = pg.context().waitForEvent("page", { timeout: 8000 }).catch(() => null); const nav = pg.waitForURL(u => !String(u).includes("/lickpick/app"), { timeout: 8000 }).catch(() => null);
  await btn.click(); const [pp] = await Promise.all([pop, nav]); await pg.waitForTimeout(1500);
  const where = pp ? pp.url() : pg.url(); R.signIn = { popup: !!pp, url: where.slice(0, 160), toast: await q(() => document.querySelector(".toast, #toast")?.innerText || "").catch(() => "") };
  ok("Sign in with Google opens Google sign-in", /accounts\.google\.com|firebaseapp\.com\/__\/auth/.test(where), R.signIn);
  if (pp) await pp.close(); if (!pg.url().includes("/lickpick/app")) await pg.goBack();
  await pg.waitForTimeout(600); await q(() => { document.getElementById("rules").hidden = true; });
});
// ---------- 7. Back from every layer
await step("back everywhere", async () => {
  const layers = [['[data-act="pro-open"]', "#proSheet, .scrim:not([hidden]) .sheet"], ['.nav #fab', "#addSheet"], ['[data-act="tour"]', "#intro"], ['.nav [data-view="clean"]', null]];
  for (const [open, sel] of layers) { if (!(await vis(pg, open))) { R.checks.push({ name: `back: ${open} visible`, pass: false }); continue; }
    await tap(open, { wait: 700 }); const before = await q(() => [...document.querySelectorAll(".scrim:not([hidden]), .layer:not([hidden]), #studio:not([hidden])")].map(e => e.id)); await shot(`14-layer-${open.replace(/\W+/g, "")}`);
    await pg.goBack(); await pg.waitForTimeout(700); const after = await q(() => [...document.querySelectorAll(".scrim:not([hidden]), .layer:not([hidden]), #studio:not([hidden])")].map(e => e.id));
    ok(`Back after ${open}: closes it, stays in app`, pg.url().includes("/lickpick/app") && after.length < Math.max(1, before.length), { before, after, url: pg.url().slice(-40) });
    if (open.includes("data-view")) ok("Back from a tab returns to Takes", await q(() => !document.getElementById("viewClips").hidden && document.getElementById("viewClean").hidden));
    if (!pg.url().includes("/lickpick/app")) { await pg.goto(APPURL); await pg.waitForTimeout(2500); } }
  await tap('.nav [data-view="clean"]', { wait: 700 }).catch(() => { }); await audit("15-cleanup");
});
R.log = log; fs.writeFileSync(`${D}/result.json`, JSON.stringify(R, null, 1));
const F = R.checks.filter(c => !c.pass); console.log(`== ${W}: ${R.checks.length - F.length}/${R.checks.length} pass; console ${log.console.length}, pageerr ${log.pageerr.length}, failed ${log.failed.length}`);
await b.close();
