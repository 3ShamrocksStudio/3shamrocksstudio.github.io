import { boot, addAndScan, openTake, M } from "./h.mjs";
const { b, pg } = await boot({ width: 412 });
await addAndScan(pg, [M + "/t3_rock128.webm"]); await pg.waitForTimeout(800); await openTake(pg);
await pg.locator("#sStage .pb-band").click(); await pg.waitForTimeout(3000);
console.log(await pg.evaluate(async () => { const c = __lp.t.cur(), r = await __lp.t.bandRender(c), K = __lp.t.bandKey(c), MB = await __lp.t.mb();
  const input = new MB.Input({ source: new MB.BlobSource(c.file), formats: MB.ALL_FORMATS }), at = await input.getPrimaryAudioTrack();
  const st = r.stems.drums; let n = 0, first = null, last = null, rates = new Set(); for await (const s of new MB.AudioSampleSink(at).samples(K.rw.s, K.rw.s + 5)) { n += s.numberOfFrames; rates.add(s.sampleRate); first ??= s.timestamp; last = s.timestamp + s.duration; s.close(); }
  return { atRate: at.sampleRate, sinkRates: [...rates], frames5s: n, span: [first, last], stemRate: st.sampleRate, stemLen: st.length, stemDur: st.duration, win: K.rw.e - K.rw.s, rawSr: c.raw.sr || c.raw.sampleRate, ctxRate: new AudioContext().sampleRate, bufDur: r.buffer?.duration, bufRate: r.buffer?.sampleRate };
}));
await b.close();
