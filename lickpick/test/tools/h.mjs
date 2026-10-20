// shared helpers for the hostile QA run (live site only)
import { createRequire } from "module"; const require = createRequire("/opt/npm-tools/node_modules/");
export const { chromium } = require("playwright");
import fs from "fs";
export const URL = process.env.LPURL || "https://3shamrocksstudio.github.io/lickpick/app/";
import path from "path"; import { fileURLToPath } from "url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
// outputs (screenshots, raw results) and the test media: env LPOUT / LPMEDIA, defaults next to this suite
export const L = process.env.LPOUT || path.resolve(HERE, "../out");
export const M = process.env.LPMEDIA || path.resolve(HERE, "../media");
fs.mkdirSync(L, { recursive: true });
// logs every scheduled buffer source (what the app really plays, on which clock)
export const HOOK = () => { window.__srcLog = []; const P = AudioBufferSourceNode.prototype, o = P.start;
  P.start = function (when = 0, off = 0, dur) { window.__srcLog.push({ buf: this.buffer, when, off, dur, now: this.context.currentTime, len: this.buffer?.duration }); return o.apply(this, arguments); }; };
export async function boot({ width = 390, guest = true, extraArgs = [], ctxOpts = {}, reducedMotion, init } = {}) {
  const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required", "--js-flags=--expose-gc", "--enable-precise-memory-info", ...extraArgs] });
  const mobile = width < 600;
  const ctx = await b.newContext({ viewport: { width, height: mobile ? 800 : 900 }, hasTouch: mobile, isMobile: mobile, acceptDownloads: true, reducedMotion, ...ctxOpts });
  const pg = await ctx.newPage(); const log = { console: [], pageerr: [], failed: [] };
  if (init) await pg.addInitScript(init);
  pg.on("console", m => { if (["error", "warning"].includes(m.type())) log.console.push(`[${m.type()}] ${m.text().slice(0, 300)}`); });
  pg.on("pageerror", e => log.pageerr.push(e.message.slice(0, 300)));
  pg.on("requestfailed", r => log.failed.push(`${r.failure()?.errorText} ${r.url().slice(0, 160)}`));
  pg.on("response", r => { if (r.status() >= 400) log.failed.push(`HTTP ${r.status()} ${r.url().slice(0, 160)}`); });
  await pg.goto(URL, { waitUntil: "load" }); await pg.waitForTimeout(2500);
  if (guest) await skipGates(pg);
  return { b, ctx, pg, log };
}
export async function vis(pg, sel) { return pg.locator(sel).first().isVisible().catch(() => false); }
export async function skipGates(pg) {
  for (let i = 0; i < 3; i++) for (const sel of ['[data-act="acct-skip"]:visible', '[data-act="ob-skip"]:visible', '[data-act="intro-skip"]:visible']) if (await vis(pg, sel)) { await pg.locator(sel).first().click().catch(() => { }); await pg.waitForTimeout(400); }
}
export async function openTake(pg, i = 0) {
  await pg.locator("#list .card").nth(i).click(); await pg.waitForTimeout(1500);
}
export async function addAndScan(pg, files, timeout = 600000) {
  const t0 = Date.now();
  await pg.setInputFiles("#pick", files);
  await pg.waitForFunction(n => { const s = window.__ck; return s && s.clips.length >= n && s.clips.slice(-n).every(c => c.status === "done" || c.status === "error" || c.status === "bad" || c.err); }, files.length, { timeout, polling: 500 });
  return Date.now() - t0;
}
export const shot = (pg, n) => pg.screenshot({ path: `${L}/${n}.png` });
export function save(n, o) { fs.writeFileSync(`${L}/${n}`, JSON.stringify(o, null, 1)); }
