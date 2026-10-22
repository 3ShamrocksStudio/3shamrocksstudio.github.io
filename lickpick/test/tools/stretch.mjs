import { boot, addAndScan, openTake, M, L, lockIfAsked } from "./h.mjs";
import fs from "fs";
const name = process.argv[2] || "t5_drift100to105";
const { b, pg } = await boot({ width: 412 });
await addAndScan(pg, [`${M}/${name}.webm`]); await pg.waitForTimeout(800); await openTake(pg);
await pg.evaluate(() => { const c = __lp.t.cur(), p = __lp.t.pickOf(c), k = `${c._picks?.key}|${c.pickSel || 0}`; c.pickAdj = c.pickAdj || {}; c.pickAdj[k] = { s: -p.s, e: c.raw.duration - p.e }; __lp.t.renderStudio(); });
await pg.locator("#sStage .pb-band").click(); await lockIfAsked(pg); await pg.waitForTimeout(4000); await pg.locator("#sStage .pb-band").click(); await lockIfAsked(pg); await pg.waitForTimeout(500);
await pg.locator("#sStage .pb-band").click(); await lockIfAsked(pg); await pg.waitForTimeout(500);
await pg.evaluate(() => { const c = __lp.t.cur(); c.band.style = "rock"; c.band.gain = 1; c.snd = { ...(c.snd || {}), takeOn: false }; });
// the stems mix exactly as bandMix builds it, at the stems' rate → 16-bit wav
const wav = await pg.evaluate(async () => { const c = __lp.t.cur(), r = await __lp.t.bandRender(c); const ks = Object.keys(r.stems); const n = r.stems.drums.length, sr = r.stems.drums.sampleRate, out = new Int16Array(n);
  const lv = c.band.lv || {}; for (const k of ks) { const d = r.stems[k].getChannelData(0); for (let i = 0; i < n; i++) out[i] = Math.max(-32767, Math.min(32767, out[i] + d[i] * 20000)); }
  const head = new ArrayBuffer(44), v = new DataView(head), w = (o, s) => [...s].forEach((ch, i) => v.setUint8(o + i, ch.charCodeAt(0)));
  w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVEfmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 2, true);
  const all = new Uint8Array(44 + n * 2); all.set(new Uint8Array(head), 0); all.set(new Uint8Array(out.buffer), 44); let s = ""; for (let i = 0; i < all.length; i += 32768) s += String.fromCharCode.apply(null, all.subarray(i, i + 32768)); return btoa(s); });
fs.mkdirSync(`${L}/export3`, { recursive: true }); fs.writeFileSync(`${L}/export3/${name}_stems.wav`, Buffer.from(wav, "base64"));
const dl = pg.waitForEvent("download", { timeout: 600000 });
await pg.locator('#sBar [data-act="export-open"]').click({ force: true }); await pg.waitForTimeout(1000); await pg.locator('[data-act="export-go"]').filter({ visible: true }).first().click();
const d = await dl; await d.saveAs(`${L}/export3/${name}_bandonly.mp4`); console.log("ok");
await b.close();
