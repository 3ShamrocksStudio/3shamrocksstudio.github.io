import { boot, addAndScan, openTake, M, L } from "./h.mjs";
for (const n of ["t2_shuffle92", "t4_punk160", "t8_melody84", "t1_ballad70", "t3_rock128"]) {
  const { b, pg } = await boot({ width: 390 });
  await addAndScan(pg, [`${M}/${n}.webm`]); await pg.waitForTimeout(800);
  const card = await pg.locator("#list .card").first().innerText();
  await openTake(pg); await pg.locator("#sStage .pb-band").click(); await pg.waitForTimeout(2500);
  await pg.locator('.stepbar [data-sc="band"]').click(); await pg.waitForTimeout(800);
  await pg.evaluate(() => document.querySelectorAll('#studio details.bsub').forEach(d => { if (/Chords|Beat/.test(d.innerText)) d.open = true; }));
  await pg.waitForTimeout(500);
  const txt = await pg.evaluate(() => { const h = document.querySelector(".bandhead")?.innerText.replace(/\s+/g, " "); const ch = [...document.querySelectorAll("#studio details.bsub")].map(d => d.querySelector("summary").innerText.replace(/\s+/g, " ")); return { h, ch }; });
  await pg.locator(".bandhead").scrollIntoViewIfNeeded(); await pg.screenshot({ path: `${L}/evid-${n}-band.png` });
  console.log(n, "| card:", card.replace(/\s+/g, " "), "| head:", txt.h, "| folds:", txt.ch.join(" / "));
  await b.close();
}
