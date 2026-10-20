// loads the app's pure-JS engines (ClipEngine + LickMusic) from index.html into this Node process
import fs from "fs"; import vm from "vm";
export function loadApp(file = process.env.LPHTML || new URL("../../app/index.html", import.meta.url)) {
  const html = fs.readFileSync(file, "utf8");
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const ctx = { console, setTimeout, performance, Math, Float32Array, Float64Array, Int32Array, Uint8Array, Array, Object, JSON, btoa, atob };
  ctx.globalThis = ctx; ctx.window = undefined; vm.createContext(ctx);
  const want = scripts.filter(s => s.includes("ClipKeeper on-device engine") || s.includes("LickMusic: what the take"));
  for (const s of want) vm.runInContext(s, ctx);
  return ctx;
}
