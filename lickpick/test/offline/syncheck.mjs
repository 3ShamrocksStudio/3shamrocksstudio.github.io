import fs from "fs"; import vm from "vm";
const html = fs.readFileSync(process.argv[2] || "/home/claude/repos/3shamrocksstudio.github.io/lickpick/app/index.html", "utf8");
const scripts = [...html.matchAll(/<script(?: type="module")?>([\s\S]*?)<\/script>/g)].map(m => m[1]); let bad = 0;
scripts.forEach((s, i) => { try { new vm.Script(s, { filename: "s" + i }); } catch (e) { if (/import|export/.test(e.message)) return; bad++; console.log("script", i, e.message); } });
console.log("scripts", scripts.length, "syntax errors", bad);
