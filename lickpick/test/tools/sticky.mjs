import { boot, addAndScan, openTake, M, L, lockIfAsked } from "./h.mjs";
import fs from "fs"; fs.mkdirSync(L + "/sticky", { recursive: true });
for (const [w, h] of [[360, 640], [390, 800], [412, 915]]) {
  const { b, pg } = await boot({ width: w, ctxOpts: { viewport: { width: w, height: h } } });
  await addAndScan(pg, [M + "/t3_rock128.webm"]); await pg.waitForTimeout(800); await openTake(pg); await pg.waitForTimeout(1200);
  for (const tab of ["choose", "band"]) {
    await pg.locator(`.stepbar [data-sc="${tab}"]`).click(); await pg.waitForTimeout(900);
    if (tab === "band") { await pg.locator("#sStage .pb-band").click(); await lockIfAsked(pg); await pg.waitForTimeout(2500); }
    const info = await pg.evaluate(() => { const st = document.getElementById("studio"); const sc = [st, ...st.querySelectorAll("*")].find(e => e.scrollHeight > e.clientHeight + 5 && /auto|scroll/.test(getComputedStyle(e).overflowY)); const fixed = [...st.querySelectorAll("*"), document.getElementById("sBar")].filter(e => e && /sticky|fixed/.test(getComputedStyle(e).position) && e.offsetParent !== undefined).map(e => ({ id: e.id || e.className.toString().slice(0, 20), pos: getComputedStyle(e).position, top: Math.round(e.getBoundingClientRect().top), h: Math.round(e.getBoundingClientRect().height) }));
      return { scroller: sc ? (sc.id || sc.className) : null, sh: sc?.scrollHeight, ch: sc?.clientHeight, fixed }; });
    console.log(w, h, tab, JSON.stringify(info));
    for (const f of [0, 0.5, 1]) { await pg.evaluate(f => { const st = document.getElementById("studio"); const sc = [st, ...st.querySelectorAll("*")].find(e => e.scrollHeight > e.clientHeight + 5 && /auto|scroll/.test(getComputedStyle(e).overflowY)) || document.scrollingElement; sc.scrollTop = f * (sc.scrollHeight - sc.clientHeight); }, f); await pg.waitForTimeout(400); await pg.screenshot({ path: `${L}/sticky/${w}x${h}-${tab}-${f}.png` }); }
    // bottom-most controls: are they above the Save bar when fully scrolled?
    console.log("  hidden under Save bar at max scroll:", await pg.evaluate(() => { const bar = document.getElementById("sBar").getBoundingClientRect(); return [...document.querySelectorAll("#studio button, #studio summary, #studio input")].filter(e => e.offsetParent && !e.closest("#sBar")).filter(e => { const r = e.getBoundingClientRect(); return r.bottom > bar.top + 4 && r.top < innerHeight; }).map(e => (e.getAttribute("aria-label") || e.textContent).trim().slice(0, 24)); }));
  }
  await b.close();
}
