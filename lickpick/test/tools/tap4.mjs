// Round 4: the beat gate and the tap-4-beats flow, end to end, at WIDTH. A take whose beat is ambiguous (gen_v4 reggae
// one-drop: its loudest attacks are off the beat) -> tap the band on the player -> the band panel opens with the tap card,
// the band stays silent while your take plays -> 4 taps on the true beats through the real button (timed on the take's
// own clock) -> the band joins on the snapped grid (checked against the truth beats) -> the taps survive a reload -> the
// export carries the band. Also: a clear rock take autoplays (no card), Flip beat / x2 / /2 sit next to the nudge, zero app
// console errors, Back closes the studio, one player, axe on the panel with the card. Screenshot: out/tap4/wWIDTH-card.png
// usage: LPURL=... node tap4.mjs [WIDTH]     (media: make_media.sh -> media/r4)
import { boot, addAndScan, openTake, M, L, HOOK, skipGates } from "./h.mjs";
import fs from "fs"; import { execFileSync } from "child_process";
const W = +(process.argv[2] || 390), D = `${L}/tap4`; fs.mkdirSync(D, { recursive: true });
const truth = Object.fromEntries(JSON.parse(fs.readFileSync(`${M}/r4/truth_part.json`)).map(t => [t.name, t]));
const R = { width: W, checks: [] }, ok = (n, p, info = "") => { R.checks.push({ n, pass: !!p, info }); console.log(p ? "PASS" : "FAIL", `[${W}]`, n, typeof info === "string" ? info : JSON.stringify(info)); };
const axeSrc = fs.readFileSync(new URL("./axe.min.js", import.meta.url), "utf8");
const near = (arr, t) => arr.reduce((b, x) => Math.abs(x - t) < Math.abs(b - t) ? x : b, arr[0]);
const { b, ctx, pg, log } = await boot({ width: W, guest: true, init: HOOK });
const q = (f, a) => pg.evaluate(f, a);
try {
  await addAndScan(pg, [`${M}/r4/tune4_reggae_00.webm`, `${M}/r4/tune4_rock_00.webm`]);
  await pg.waitForFunction(() => __ck.clips.filter(c => c.status === "done" && __lp.t.pickOf(c)).length >= 2, null, { timeout: 180000 });
  const idx = await q(() => __ck.clips.findIndex(c => /reggae/.test(c.name)));
  // the list shows the newest first: open the reggae card by its index in the DOM
  const cards = await q(() => [...document.querySelectorAll("#list .card")].map(c => c.innerText));
  await openTake(pg, cards.findIndex(t => /reggae/i.test(t)) >= 0 ? cards.findIndex(t => /reggae/i.test(t)) : idx);
  const g0 = await q(() => { const c = __lp.t.cur(), g = __lp.t.gridOf(c); return { name: c.name, gate: g?.gate, why: g?.why, bpm: g?.bpm }; });
  ok("reggae one-drop: the beat gate is up", g0.gate && /reggae/.test(g0.name), g0);
  // 1. band on from the player: the band panel opens with the card, the take plays, the band is silent
  const n0 = await q(() => window.__srcLog.length);
  await pg.locator("#sStage .pb-band").click();
  await pg.waitForFunction(() => __lp.q().bandPlaying && !!document.querySelector("#tap4"), null, { timeout: 60000 });
  await pg.waitForTimeout(1500);
  const s1 = await q(n0 => { const c = __lp.t.cur(), K = __lp.t.bandKey(c), S = window.__srcLog.slice(n0); return { step: __ck.step, card: !!document.querySelector("#tap4"), pending: __lp.t.beatPending(c), parts: K.parts, bandBufs: S.filter(x => x.len && x.len < 1e4 && Math.abs(x.len - (K.rw.e - K.rw.s)) < 0.5 && x !== S[0]).length, toast: document.querySelector(".toast")?.innerText || "" }; }, n0);
  ok("band on: the band panel opens with the tap card", s1.step === "band" && s1.card, s1);
  ok("band on: the band stays silent while it waits (no drums on a guess)", s1.pending && !s1.parts.drums && !s1.parts.bass && !s1.parts.keys, s1.parts);
  ok("band on: no toast covers the tap card (the card says what to do)", !/Tap 4 beats/.test(s1.toast), s1.toast);
  const tc = await q(() => { const r = document.querySelector("#tap4 .tap4btn").getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), inView: r.top >= 0 && r.bottom <= innerHeight }; });
  ok("tap button: big (>= 44 px) and in view", tc.w >= 44 && tc.h >= 44, tc);
  await pg.waitForTimeout(600);
  await pg.screenshot({ path: `${D}/w${W}-card.png` });
  try { await pg.addScriptTag({ content: axeSrc }); R.axe = await q(async () => (await axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa"], resultTypes: ["violations"] })).violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, ex: v.nodes[0]?.target?.join(" ") }))); } catch (e) { R.axe = [{ id: "axe-failed", ex: e.message }]; }
  const axeBad = (R.axe || []).filter(v => v.impact === "serious" || v.impact === "critical");
  ok("axe: no serious/critical violations with the tap card open", !axeBad.length, R.axe);
  const chips = await q(() => [...document.querySelectorAll(".timing .tchip")].map(e => ({ t: e.textContent.trim(), h: Math.round(e.getBoundingClientRect().height) })));
  ok("Flip beat, x2 and /2 sit next to the nudge (44 px)", ["Flip beat", "×2", "÷2"].every(x => chips.some(c => c.t.includes(x) && c.h >= 44)), chips);
  // 2. four taps on the true beats, through the real button, on the take's own clock
  const T = truth[g0.name.replace(/\.\w+$/, "")] || truth["tune4_reggae_00"];
  const tapRes = await q(async TB => { const c = __lp.t.cur(), w = __lp.t.bandWindow(c), clock = () => { const { player } = __lp.q(); return w.s + (player.ext ? player.ext() : player.virt()); };
    const btn = () => document.querySelector("#tap4 .tap4btn"); let t = clock(); const next = TB.filter(x => x > t + 0.6).slice(0, 4), at = [];
    for (const x of next) { while (clock() < x - 0.004) await new Promise(r => setTimeout(r, 2)); at.push(+clock().toFixed(3)); btn()?.click(); await new Promise(r => setTimeout(r, 30)); }
    return { want: next, at }; }, T.beats);
  await pg.waitForFunction(() => !document.querySelector("#tap4"), null, { timeout: 20000 }).catch(() => { });
  await pg.waitForFunction(() => __lp.q().bandPlaying, null, { timeout: 60000 }).catch(() => { });
  await pg.waitForTimeout(8000);
  const s2 = await q(() => { const c = __lp.t.cur(), K = __lp.t.bandKey(c), A = __lp.t.bandA(c); return { taps: c.band?.grid?.taps, pending: __lp.t.beatPending(c), parts: K.parts, tapped: !!A?.tapped, snapped: A?.snapped, beats: A?.beats || [], playing: __lp.q().bandPlaying, card: !!document.querySelector("#tap4"), toast: document.querySelector(".toast")?.innerText || "" }; });
  ok("4 taps: the card goes, the band joins", s2.taps?.length === 4 && !s2.pending && !s2.card && s2.parts.drums && s2.playing, { taps: s2.taps, tapped: s2.tapped, snapped: s2.snapped, toast: s2.toast });
  const TB = T.beats.filter(t => t > 1 && t < T.dur - 0.5), e = TB.map(t => Math.abs(near(s2.beats, t) - t)).sort((x, y) => x - y), medE = e[e.length >> 1] * 1000;
  ok("after the taps the band's beats sit on the true beats (median < 25 ms)", medE < 25, { medMs: +medE.toFixed(1), tapsAt: tapRes.at, want: tapRes.want.map(x => +x.toFixed(3)) });
  // 3. persisted with the take
  await pg.reload({ waitUntil: "load" }); await pg.waitForTimeout(3000); await skipGates(pg);
  await pg.waitForFunction(() => __ck.clips.length >= 2 && __ck.clips.every(c => c.status === "done"), null, { timeout: 60000 });
  const cards2 = await q(() => [...document.querySelectorAll("#list .card")].map(c => c.innerText));
  await openTake(pg, Math.max(0, cards2.findIndex(t => /reggae/i.test(t))));
  const s3 = await q(() => { const c = __lp.t.cur(); return { name: c.name, taps: c.band?.grid?.taps, pending: __lp.t.beatPending(c) }; });
  ok("the taps are kept with the take (reload)", s3.taps?.length === 4 && !s3.pending, s3);
  // 4. export with the band
  await q(() => { const c = __lp.t.cur(), o = __lp.t.exOpts(c); o.band = true; __lp.t.renderStudio(); window.__lpExport(); });
  await pg.waitForTimeout(800);
  const label = await q(() => document.querySelector('[data-act="export-go"]')?.textContent || "");
  const dl = pg.waitForEvent("download", { timeout: 240000 }).catch(() => null);
  await pg.locator('[data-act="export-go"]').click();
  const d = await dl; let dur = null, size = 0;
  if (d) { const pth = `${D}/w${W}-export${(d.suggestedFilename().match(/\.\w+$/) || [".mp4"])[0]}`; await d.saveAs(pth); size = fs.statSync(pth).size; try { dur = +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", pth]).toString().trim(); } catch { } }
  const s4 = await q(() => { const c = __lp.t.cur(), K = __lp.t.bandKey(c); return { parts: K.parts, pending: __lp.t.beatPending(c) }; });
  ok("export: saves with the band on your tapped beat", !!d && size > 20000 && /band/.test(label) && s4.parts.drums && !s4.pending, { label: label.trim(), size, dur });
  await q(() => { (document.querySelector('#exportSheet [data-act="export-close"]') || {}).click?.(); document.querySelector("#exportSheet").hidden = true; }); await pg.waitForTimeout(1200);   // the sheet's history entry goes
  // 5. one player, Back
  const vids = await q(() => [...document.querySelectorAll("video")].filter(v => v.offsetParent && v.getBoundingClientRect().width > 0).length);
  ok("one player on screen", vids === 1, { visibleVideos: vids });
  // Back closes the top layer each time (after a save that may be the "saved" sheet): at most 3 Backs to the list
  const layers0 = await q(() => ["studio", "exportSheet", "winSheet", "proSheet", "recSheet"].filter(id => document.getElementById(id) && !document.getElementById(id).hidden));
  let nBack = 0; for (; nBack < 3; nBack++) { if (await q(() => document.getElementById("studio").hidden)) break; await pg.goBack(); await pg.waitForTimeout(1200); }
  const back = await q(() => ({ studio: !document.getElementById("studio")?.hidden, list: !!document.querySelector("#list .card")?.offsetParent }));
  ok("Back closes the open layers, then the studio, to the list", !back.studio && back.list && nBack === layers0.length, { ...back, layers0, backs: nBack });
  // 6. a clear rock take: no card, the band plays at once
  const cards3 = await q(() => [...document.querySelectorAll("#list .card")].map(c => c.innerText));
  await openTake(pg, Math.max(0, cards3.findIndex(t => /rock/i.test(t))));
  const n1 = await q(() => window.__srcLog.length);
  const g1 = await q(() => { const c = __lp.t.cur(), g = __lp.t.gridOf(c); return { name: c.name, gate: g?.gate, why: g?.why }; });
  await pg.locator("#sStage .pb-band").click();
  await pg.waitForFunction(n1 => __lp.q().bandPlaying && window.__srcLog.length > n1 + 1, n1, { timeout: 120000 }).catch(() => { });
  await pg.waitForTimeout(2500);
  const s5 = await q(() => { const c = __lp.t.cur(), K = __lp.t.bandKey(c); return { card: !!document.querySelector("#tap4"), parts: K.parts, playing: __lp.q().bandPlaying }; });
  ok("clear rock take: no gate, the band plays at once", !g1.gate && !s5.card && s5.parts.drums && s5.playing, { ...g1, ...s5 });
} catch (err) { ok("flow ran", false, String(err.message || err).slice(0, 300)); await pg.screenshot({ path: `${D}/w${W}-ERR.png` }).catch(() => { }); }
const errs = log.console.filter(x => x.startsWith("[error]") && !/favicon|ERR_|net::|Failed to load resource/.test(x));
ok("zero app console errors", !errs.length && !log.pageerr.length, { console: errs.slice(0, 5), pageerr: log.pageerr.slice(0, 5) });
fs.writeFileSync(`${D}/w${W}.json`, JSON.stringify(R, null, 1));
await b.close();
process.exit(R.checks.every(c => c.pass) ? 0 : 1);
