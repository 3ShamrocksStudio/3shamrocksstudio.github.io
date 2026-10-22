// reload mid-scan, offline, signed-out gate, guest delete row
import { boot, addAndScan, M, L, vis, skipGates, lockIfAsked } from "./h.mjs";
import fs from "fs"; const D = `${L}/misc`; fs.mkdirSync(D, { recursive: true });
const out = {};
const { b, ctx, pg, log } = await boot({ width: 390, guest: false });
// signed-out first run
out.signgate = await pg.evaluate(() => ({ shown: !document.getElementById("signgate")?.hidden, text: document.getElementById("signgate")?.innerText.replace(/\s+/g, " ").slice(0, 300) }));
await pg.screenshot({ path: `${D}/signgate.png` });
await skipGates(pg);
// reload in the middle of scanning a 6-minute take
await pg.setInputFiles("#pick", [`${M}/t9_long6min120.webm`, `${M}/t3_rock128.webm`]);
await pg.waitForFunction(() => __ck.clips.some(c => c.status === "listening" && (c.progress || 0) > 0.15), null, { timeout: 60000 }).catch(() => { });
out.beforeReload = await pg.evaluate(() => __ck.clips.map(c => [c.name, c.status, Math.round((c.progress || 0) * 100)]));
await pg.reload(); await pg.waitForTimeout(4000); await skipGates(pg);
out.afterReload = await pg.evaluate(() => (window.__ck?.clips || []).map(c => [c.name, c.status, Math.round((c.progress || 0) * 100), !!c.file]));
out.afterReloadCards = await pg.evaluate(() => [...document.querySelectorAll("#list .card")].map(c => c.innerText.replace(/\s+/g, " ").slice(0, 120)));
await pg.screenshot({ path: `${D}/after-reload-midscan.png` });
await pg.waitForTimeout(20000);
out.afterReload20s = await pg.evaluate(() => (window.__ck?.clips || []).map(c => [c.name, c.status, Math.round((c.progress || 0) * 100), !!c.file]));
out.afterReloadCards20s = await pg.evaluate(() => [...document.querySelectorAll("#list .card")].map(c => c.innerText.replace(/\s+/g, " ").slice(0, 120)));
await pg.screenshot({ path: `${D}/after-reload-midscan-20s.png` });
// try opening a restored card
try { await pg.locator("#list .card").first().click({ timeout: 4000 }); await pg.waitForTimeout(1500); await pg.screenshot({ path: `${D}/open-restored.png` }); out.openRestored = await pg.evaluate(() => ({ studio: !document.getElementById("studio").hidden, text: document.getElementById("studio").innerText.replace(/\s+/g, " ").slice(0, 300), toast: document.querySelector(".toast, #toast")?.innerText })); await pg.goBack(); await pg.waitForTimeout(600); } catch (e) { out.openRestored = "err " + e.message.slice(0, 80); }
// offline: SW should serve the app; scanning should work (no network needed)
out.sw = await pg.evaluate(async () => { const r = await navigator.serviceWorker?.getRegistration(); return { ctrl: !!navigator.serviceWorker?.controller, scope: r?.scope, caches: await caches.keys() }; });
await ctx.setOffline(true);
await pg.reload().catch(e => { out.offlineReloadErr = e.message.slice(0, 120); }); await pg.waitForTimeout(4000); await skipGates(pg);
out.offlineBoot = await pg.evaluate(() => ({ title: document.title, hasApp: !!window.__lp, clips: (window.__ck?.clips || []).length })).catch(e => "eval failed " + e.message.slice(0, 80));
await pg.screenshot({ path: `${D}/offline-boot.png` });
if (out.offlineBoot?.hasApp) {
  const t0 = Date.now(); try { await pg.setInputFiles("#pick", [`${M}/t6_break110.webm`]); await pg.waitForFunction(() => __ck.clips.some(c => /break110/.test(c.name) && ["done", "error"].includes(c.status)), null, { timeout: 120000 }); out.offlineScan = await pg.evaluate(() => { const c = __ck.clips.find(c => /break110/.test(c.name)); return [c.status, c.raw?.info?.tempo, !!__lp.t.pickOf(c)]; }); } catch (e) { out.offlineScan = "fail " + e.message.slice(0, 100); }
  out.offlineScanMs = Date.now() - t0;
  // band offline
  try { await pg.locator("#list .card").filter({ hasText: "break110" }).first().click(); await pg.waitForTimeout(1500); await pg.locator("#sStage .pb-band").click(); await lockIfAsked(pg); await pg.waitForFunction(() => __lp.q().bandPlaying && __lp.q().player.ext, null, { timeout: 60000 }); out.offlineBand = "plays"; } catch (e) { out.offlineBand = "fail " + e.message.slice(0, 100); }
  await pg.screenshot({ path: `${D}/offline-band.png` });
}
await ctx.setOffline(false);
out.log = log; fs.writeFileSync(`${D}/result.json`, JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1).slice(0, 6000));
await b.close();
