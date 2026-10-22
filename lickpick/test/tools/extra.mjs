// Checks for the fixes the QA flows don't cover directly. usage: node extra.mjs [WIDTH]
//  L3 first run asks to sign in once (gate), the welcome doesn't ask again; gate copy says it's optional
//  M1 one key everywhere: card, band panel and the take key agree (or no key shown when unsure)
//  M2 Auto never lands on a Pro style for a free player (a swung take used to get the Pro "Shuffle")
//  L5 a video with no sound says so;  L8 "Already in your take" hears drums in a take with drums, none in a guitar take
//  L1 the breathing Save button stops after a few cycles
import { boot, addAndScan, M, L, vis, lockIfAsked } from "./h.mjs";
import fs from "fs";
const W = +(process.argv[2] || 390), R = { checks: [] };
const ok = (name, pass, info = "") => { R.checks.push({ name, pass: !!pass, info }); console.log(pass ? "PASS" : "FAIL", name, typeof info === "string" ? info : JSON.stringify(info).slice(0, 300)); };
const DRUMS = process.env.DRUMS || `${M}/z_drums128.webm`;
const { b, pg, log } = await boot({ width: W, guest: false });
const q = (f, a) => pg.evaluate(f, a);
// L3
const gate = await q(() => ({ shown: !document.getElementById("signgate").hidden, sub: document.getElementById("sgSub")?.textContent || "" }));
ok("L3 gate shows on first run and says sign-in is optional", gate.shown && /optional/i.test(gate.sub), gate);
await pg.locator('[data-act="acct-skip"]').click(); await pg.waitForTimeout(800);
const again = await q(() => [...document.querySelectorAll('#onboard:not([hidden]) [data-act="acct-in"]')].filter(e => e.offsetParent).length);
ok("L3 welcome doesn't ask to sign in again after 'without an account'", again === 0, { signInButtonsOnWelcome: again });
for (const sel of ['[data-act="ob-skip"]:visible', '[data-act="intro-skip"]:visible']) if (await vis(pg, sel)) { await pg.locator(sel).first().click().catch(() => { }); await pg.waitForTimeout(400); }
// import: a swung take, a guitar-only take, a take with drums, a video with no sound
const files = [`${M}/t2_shuffle92.webm`, `${M}/t3_rock128.webm`, DRUMS, `${M}/edge/no_audio.webm`].filter(f => fs.existsSync(f));
await addAndScan(pg, files);
await pg.waitForTimeout(1500);
const cards = await q(() => __ck.clips.map(c => ({ name: c.name, status: c.status, text: document.querySelector(`[data-open="${c.id}"]`)?.innerText.replace(/\s+/g, " ") || "" })));
const na = cards.find(c => /no_audio/.test(c.name));
if (na) ok("L5 a video with no sound says so", /no sound/i.test(na.text), na.text);
// M1 + M2 on the swung take
const open = async name => { const i = await q(n => __ck.clips.findIndex(c => c.name === n), name); await pg.locator("#list .card").nth(await q(i => [...document.querySelectorAll("#list .card")].findIndex(e => +e.dataset.open === __ck.clips[i].id), i)).click(); await pg.waitForTimeout(1500); };
await open("t2_shuffle92.webm");
await pg.locator("#sStage .pb-band").click(); await lockIfAsked(pg); await pg.waitForFunction(() => __lp.q().bandPlaying, null, { timeout: 120000 }); await pg.waitForTimeout(800);
await pg.locator('.stepbar [data-sc="band"]').click().catch(() => { }); await pg.waitForTimeout(1200);
const k = await q(() => { const c = __lp.t.cur(), tk = __lp.t.takeKeyOf(c), K = __lp.t.bandKey(c), N = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  const card = document.querySelector(`[data-open="${c.id}"]`)?.innerText || "", panel = document.querySelector(".bandhead")?.innerText || "";
  return { tk: tk && { key: N[tk.key] + (tk.minor ? "m" : ""), conf: tk.conf }, info: c.raw.info.key, card: card.replace(/\s+/g, " "), panel: panel.replace(/\s+/g, " "), style: K.style, auto: c.band.style, pro: document.querySelector("#proSheet")?.hidden === false }; });
const label = k.info && k.info !== "no clear key" ? k.info : null;
ok("M1 one key: the take key, the card and the band panel agree", label ? k.card.includes(label) && (k.panel.includes(label) || /Drums only/.test(k.panel)) : !/ major| minor/.test(k.card), k);
ok("M2 Auto picks a free style for a free player (no Pro wall)", k.auto === "auto" && ["rock", "ballad"].includes(k.style) && !k.pro, { auto: k.auto, style: k.style, proSheet: k.pro });
await pg.locator("#sStage .pb-band").click(); await lockIfAsked(pg); await pg.waitForTimeout(300);
// L8: what's already in the take (quick model, then the listening model)
const heard = async name => { await pg.goBack(); await pg.waitForTimeout(600); await open(name); await pg.locator("#sStage .pb-band").click(); await lockIfAsked(pg); await pg.waitForFunction(() => __lp.q().bandPlaying, null, { timeout: 120000 });
  await pg.locator('.stepbar [data-sc="band"]').click().catch(() => { });
  await pg.waitForFunction(() => { const h = __lp.t.cur().band?.heard; return h && !h.busy && h.p; }, null, { timeout: 180000 }).catch(() => { });
  const r = await q(() => { const h = __lp.t.cur().band?.heard; return { p: h?.p && Object.fromEntries(Object.entries(h.p).filter(([x]) => x !== "feats")), deep: !!h?.deep, kick: h?.p?.feats?.lowPofLow, parts: { ...__lp.t.cur().band.parts }, chips: document.querySelector(".heardchips")?.innerText.replace(/\s+/g, " ") || "" }; });
  await pg.locator("#sStage .pb-band").click(); await lockIfAsked(pg); await pg.waitForTimeout(300); return r; };
const hG = await heard("t3_rock128.webm");
ok("L8 guitar-only take: the band keeps its drums (no drums heard)", hG.parts?.drums === true, hG);
if (fs.existsSync(DRUMS)) { const hD = await heard(DRUMS.split("/").pop()); ok("L8 take with drums: drums heard, the band leaves them out", hD.parts?.drums === false, hD); }
// L1
const anim = await q(() => { const s = [...document.styleSheets].flatMap(ss => { try { return [...ss.cssRules]; } catch { return []; } }).filter(r => /exportbtn|wkready|hero-act/.test(r.selectorText || "") && /lpBreath/.test(r.cssText)).map(r => r.style.animationIterationCount); return s; });
ok("L1 breathing animations stop (finite iteration count)", anim.length && anim.every(x => x !== "infinite"), anim);
R.log = log; fs.writeFileSync(`${L}/extra_${W}.json`, JSON.stringify(R, null, 1));
const F = R.checks.filter(c => !c.pass); console.log(`== extra ${W}: ${R.checks.length - F.length}/${R.checks.length} pass; console ${log.console.length}, pageerr ${log.pageerr.length}`);
await b.close();
