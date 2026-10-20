// node dumpraw.mjs file.webm|wav ... -> $RAWDIR/<name>.json. Decodes like the app: native rate, mono, the app's one-pole
// 9 kHz low-pass, linear resample to 22050, then the app's own analyzePCM (the listening model pass is not run).
import { loadApp } from "./load.mjs"; import { execFileSync } from "child_process"; import fs from "fs"; import path from "path";
const A = loadApp(), out = process.env.RAWDIR || "raw", SR = 22050; fs.mkdirSync(out, { recursive: true });
for (const f of process.argv.slice(2)) {
  const sr = +execFileSync("ffprobe", ["-v", "error", "-select_streams", "a:0", "-show_entries", "stream=sample_rate", "-of", "csv=p=0", f]).toString().trim() || 48000;
  const pcm = execFileSync("ffmpeg", ["-v", "error", "-i", f, "-ac", "1", "-ar", String(sr), "-f", "f32le", "-"], { maxBuffer: 1 << 30 });
  const x = new Float32Array(pcm.buffer, pcm.byteOffset, pcm.length / 4), ratio = sr / SR, a = 1 - Math.exp(-2 * Math.PI * 9000 / Math.max(SR, sr));
  const m = new Float32Array(x.length); let lp = 0; for (let i = 0; i < x.length; i++) { lp += a * (x[i] - lp); m[i] = lp; }
  const n = Math.floor(x.length / ratio), y = new Float32Array(n); for (let j = 0; j < n; j++) { const p = j * ratio, i0 = Math.floor(p), fr = p - i0; y[j] = m[i0] * (1 - fr) + (m[Math.min(m.length - 1, i0 + 1)] || 0) * fr; }
  const t0 = Date.now(); const raw = await A.ClipEngine.analyzePCM(y, SR, () => { }, 1e9); delete raw._dbg;
  fs.writeFileSync(`${out}/${path.basename(f).replace(/\.\w+$/, "")}.json`, JSON.stringify(raw));
  console.log(path.basename(f), sr, raw.duration?.toFixed(1), Date.now() - t0, "ms");
}
