// H3: first run, tap "Sign in with Google", close the Google popup: LickPick stays on the gate (no redirect to Google
// later), the button works again. usage: LPURL=... node signin.mjs [WIDTH]
import { boot } from "./h.mjs";
const W = +(process.argv[2] || 390), { b, pg, log } = await boot({ width: W, guest: false }); const R = {};
R.gateShown = await pg.evaluate(() => !document.getElementById("signgate").hidden);
const popP = pg.context().waitForEvent("page", { timeout: 10000 }).catch(() => null);
await pg.locator('#signgate [data-act="acct-in"]').click();
const pp = await popP; R.popup = !!pp;
if (pp) { await pp.waitForURL(u => /google|firebaseapp/.test(String(u)), { timeout: 15000 }).catch(() => { }); R.popupUrl = pp.url().slice(0, 80); await pg.waitForTimeout(400); await pp.close(); }
// round 4: the button must come back within ~2 s of the popup closing (focus / visibility back + 1.5 s), not 5-12 s
const tc = Date.now(); await pg.waitForFunction(() => !document.querySelector('#signgate [data-act="acct-in"]').disabled, null, { timeout: 15000, polling: 100 }).catch(() => { }); R.reenableMs = Date.now() - tc;
const t0 = Date.now(); let left = null;
while (Date.now() - t0 < 12000) { await pg.waitForTimeout(500); if (!pg.url().includes("/lickpick/app")) { left = pg.url().slice(0, 80); break; } }
R.leftApp = left; R.after = await pg.evaluate(() => ({ gate: !document.getElementById("signgate").hidden, btnEnabled: !document.querySelector('#signgate [data-act="acct-in"]').disabled, status: document.getElementById("sgStatus").textContent }));
const pass = R.gateShown && R.popup && !left && R.after.gate && R.after.btnEnabled && R.reenableMs < 2500;
console.log(pass ? "PASS" : "FAIL", "sign-in cancel returns to the gate", JSON.stringify(R), "pageerr", log.pageerr.length, "console errors", log.console.filter(x => x.startsWith("[error]")).length);
await b.close();
