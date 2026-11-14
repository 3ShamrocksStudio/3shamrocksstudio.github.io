// node render.js <html> <seconds> <out.mp4> [stillsDir t1,t2,...]
// Frame-by-frame: window.seek(t) sets every style for time t, then a JPEG screenshot is piped to ffmpeg.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
(async () => {
  const [html, secs, out, stillsDir, stillsList] = process.argv.slice(2);
  const fps = 30, N = Math.round(parseFloat(secs) * fps);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push(String(e)));
  p.on('requestfailed', r => errs.push('FAILED ' + r.url()));
  await p.goto('file://' + path.resolve(html));
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => window.ready && window.ready());
  await p.waitForTimeout(300);
  if (stillsDir) {
    fs.mkdirSync(stillsDir, { recursive: true });
    for (const t of stillsList.split(',')) {
      await p.evaluate(t => window.seek(t), parseFloat(t));
      await p.screenshot({ path: path.join(stillsDir, 't' + t + '.jpg'), type: 'jpeg', quality: 90 });
    }
    console.log('stills done; errors:', errs.length ? errs.slice(0, 5) : 'none');
    await b.close(); return;
  }
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < N; i++) {
    await p.evaluate(t => window.seek(t), i / fps);
    const buf = await p.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 90 === 0) process.stdout.write(i + '/' + N + ' ');
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log('\nvideo done', out, 'errors:', errs.length ? errs.slice(0, 5) : 'none');
  await b.close();
})();
