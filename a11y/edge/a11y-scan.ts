// a11y-scan: public website accessibility checker (3Shamrocks Studio).
// verify_jwt=false; this function validates its own input, rate-limits per hashed IP,
// and unlocks the full report only with a Gumroad license key verified server-side.
// Monitor keys (monthly membership, config 'gumroad_monitor_product_id') also get a per-site history,
// and POST /a11y-scan/cron (pg_cron, token in Vault) re-checks each active monitor site weekly.
// deno-lint-ignore-file no-explicit-any
import { DOMParser } from "jsr:@b-fuze/deno-dom@0.1.56";
import { ADVISORY, CHECK_BY_ID, ENGINE_VERSION, LEGAL, runChecks, statementTemplates, WEIGHTS } from "https://raw.githubusercontent.com/3ShamrocksStudio/3shamrocksstudio.github.io/bda88d75475a9fe68af5afd60ac2dab49a6e19b5/a11y/engine/engine.ts";
declare const EdgeRuntime: { waitUntil(p: Promise<unknown>): void } | undefined;

const SB_URL = Deno.env.get("SUPABASE_URL") || "";
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const FREE_PER_HOUR = 10;
const PAID_PER_HOUR_IP = 40;
const PAID_PER_KEY_DAY = 10;
const FREE_TOP = 5;
const MON_HISTORY = 30; // rows returned to the buyer
const MON_BATCH = 5; // monitor sites re-checked per hourly cron run
const DAY_MS = 86_400_000;
const MAX_BYTES = 3 * 1024 * 1024;
const TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 3;
const UA = "Mozilla/5.0 (compatible; 3ShamrocksA11yCheck/1.0; +https://3shamrocks.com/a11y/) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
  "Access-Control-Max-Age": "86400",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const err = (code: string, status: number, extra: Record<string, unknown> = {}) => json({ ok: false, error: code, ...extra }, status);

// ---------- supabase REST (service role) ----------
async function rest(path: string, init: RequestInit = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "content-type": "application/json", ...(init.headers || {}) },
  });
  if (!r.ok) throw new Error(`db ${r.status} ${(await r.text()).slice(0, 200)}`);
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}
let cfgCache: { at: number; v: Record<string, string> } | null = null;
async function config(): Promise<Record<string, string>> {
  if (cfgCache && Date.now() - cfgCache.at < 60_000) return cfgCache.v;
  const rows = await rest("a11y_config?select=key,value");
  const v: Record<string, string> = {};
  for (const r of rows || []) v[r.key] = r.value;
  cfgCache = { at: Date.now(), v };
  return v;
}
async function hitCounter(bucket: string, windowStart: string): Promise<number> {
  const n = await rest("rpc/a11y_hit", { method: "POST", body: JSON.stringify({ p_bucket: bucket, p_window: windowStart }) });
  return typeof n === "number" ? n : 0;
}
async function sha256(s: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------- SSRF guard ----------
function v4Private(ip: string): boolean {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((x) => isNaN(x) || x < 0 || x > 255)) return true;
  const [a, b, c] = p;
  return a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) || (a === 192 && b === 0 && (c === 0 || c === 2)) || (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) || (a === 203 && b === 0 && c === 113) || (a === 192 && b === 88 && c === 99);
}
function v6Private(ip: string): boolean {
  const s = ip.toLowerCase().replace(/^\[|\]$/g, "");
  if (s === "::" || s === "::1") return true;
  const m4 = s.match(/^(?:::ffff:|::|64:ff9b::)(\d+\.\d+\.\d+\.\d+)$/);
  if (m4) return v4Private(m4[1]);
  const mh = s.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (mh) {
    const a = parseInt(mh[1], 16), b = parseInt(mh[2], 16);
    return v4Private(`${a >> 8}.${a & 255}.${b >> 8}.${b & 255}`);
  }
  const first = parseInt(s.split(":")[0] || "0", 16);
  if ((first & 0xfe00) === 0xfc00) return true; // fc00::/7
  if ((first & 0xffc0) === 0xfe80) return true; // fe80::/10
  if ((first & 0xff00) === 0xff00) return true; // multicast
  if (s.startsWith("2001:db8") || s.startsWith("64:ff9b") || s.startsWith("2002:") || s.startsWith("100::")) return true;
  if (s.startsWith("::")) return true; // other IPv4-compatible / unspecified forms
  return false;
}
const isV4 = (h: string) => /^\d{1,3}(\.\d{1,3}){3}$/.test(h);
const isV6 = (h: string) => h.includes(":");
async function resolveAll(host: string): Promise<string[]> {
  const out: string[] = [];
  try {
    out.push(...await Deno.resolveDns(host, "A"));
  } catch { /* none */ }
  try {
    out.push(...await Deno.resolveDns(host, "AAAA"));
  } catch { /* none */ }
  if (out.length) return out;
  // fallback: DNS-over-HTTPS
  for (const type of ["A", "AAAA"]) {
    try {
      const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=${type}`, { headers: { accept: "application/dns-json" }, signal: AbortSignal.timeout(4000) });
      const j = await r.json();
      for (const a of j.Answer || []) if (a.type === 1 || a.type === 28) out.push(a.data);
    } catch { /* ignore */ }
  }
  return out;
}
async function checkTarget(u: URL): Promise<string | null> {
  if (u.protocol !== "http:" && u.protocol !== "https:") return "bad_scheme";
  if (u.username || u.password) return "bad_url";
  if (u.port && u.port !== "80" && u.port !== "443") return "bad_port";
  const h = u.hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (!h || h === "localhost" || /\.(localhost|local|internal|lan|home|intranet|corp|arpa)$/.test(h) || h === "metadata.google.internal" || !h.includes(".") && !isV6(h)) return "blocked_host";
  if (/^\d+$/.test(h) || /^0x/i.test(h)) return "blocked_host"; // decimal/hex IP forms
  if (isV4(h)) return v4Private(h) ? "blocked_ip" : null;
  if (isV6(h)) return v6Private(h) ? "blocked_ip" : null;
  const ips = await resolveAll(h);
  if (!ips.length) return "dns_failed";
  for (const ip of ips) if (isV6(ip) ? v6Private(ip) : v4Private(ip)) return "blocked_ip";
  return null;
}

async function fetchPage(start: URL, lang: string): Promise<{ html: string; finalUrl: string; status: number } | { error: string; status?: number }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    let url = start;
    for (let i = 0; i <= MAX_REDIRECTS; i++) {
      const bad = await checkTarget(url);
      if (bad) return { error: bad };
      const r = await fetch(url.href, {
        redirect: "manual",
        signal: ctrl.signal,
        headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5", "accept-language": lang === "he" ? "he-IL,he;q=0.9,en;q=0.6" : "en;q=0.9,he;q=0.5" },
      });
      if (r.status >= 300 && r.status < 400 && r.headers.get("location")) {
        await r.body?.cancel();
        if (i === MAX_REDIRECTS) return { error: "too_many_redirects" };
        url = new URL(r.headers.get("location")!, url);
        continue;
      }
      if (!r.ok) {
        await r.body?.cancel();
        if ([401, 403, 429, 503].includes(r.status)) return { error: "blocked_by_site", status: r.status };
        return { error: "http_error", status: r.status };
      }
      const ct = (r.headers.get("content-type") || "").toLowerCase();
      if (ct && !ct.includes("html")) {
        await r.body?.cancel();
        return { error: "not_html" };
      }
      const len = parseInt(r.headers.get("content-length") || "0", 10);
      if (len > MAX_BYTES) {
        await r.body?.cancel();
        return { error: "too_large" };
      }
      const reader = r.body!.getReader();
      const chunks: Uint8Array[] = [];
      let total = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.length;
        if (total > MAX_BYTES) {
          await reader.cancel();
          return { error: "too_large" };
        }
        chunks.push(value);
      }
      const buf = new Uint8Array(total);
      let o = 0;
      for (const c of chunks) {
        buf.set(c, o);
        o += c.length;
      }
      let cs = (ct.match(/charset=([\w-]+)/) || [])[1];
      if (!cs) {
        const head = new TextDecoder("latin1").decode(buf.slice(0, 4096));
        cs = (head.match(/<meta[^>]+charset=["']?([\w-]+)/i) || [])[1];
      }
      let html: string;
      try {
        html = new TextDecoder(cs || "utf-8").decode(buf);
      } catch {
        html = new TextDecoder("utf-8").decode(buf);
      }
      return { html, finalUrl: url.href, status: r.status };
    }
    return { error: "too_many_redirects" };
  } catch (e) {
    return { error: (e as Error).name === "AbortError" ? "timeout" : "fetch_failed" };
  } finally {
    clearTimeout(timer);
  }
}

// ---------- license ----------
const baseHost = (h: string) => h.toLowerCase().replace(/^www\./, "").replace(/\.$/, "");
async function verifyLicense(key: string, productId: string): Promise<{ ok: boolean; reason?: string }> {
  try {
    const r = await fetch("https://api.gumroad.com/v2/licenses/verify", {
      method: "POST",
      signal: AbortSignal.timeout(8000),
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ product_id: productId, license_key: key, increment_uses_count: "false" }),
    });
    const j = await r.json().catch(() => null);
    if (r.status === 404 || (j && j.success === false)) return { ok: false, reason: "license_invalid" };
    if (!r.ok || !j || j.success !== true) return { ok: false, reason: "license_check_failed" };
    const p = j.purchase || {};
    if (p.refunded || p.chargebacked || (p.disputed && !p.dispute_won)) return { ok: false, reason: "license_revoked" };
    // Gumroad sets these to the membership END date, so a cancelled membership stays valid until then.
    for (const f of ["subscription_ended_at", "subscription_cancelled_at", "subscription_failed_at"]) {
      if (!p[f]) continue;
      const end = Date.parse(p[f]);
      if (isNaN(end) || end <= Date.now()) return { ok: false, reason: "license_revoked" };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "license_check_failed" };
  }
}
// One key field for both products: the one-time report, then (if configured) the monitor membership.
async function verifyAny(key: string, cfg: Record<string, string>): Promise<{ ok: boolean; reason?: string; tier?: "report" | "monitor" }> {
  const a = await verifyLicense(key, cfg.gumroad_product_id);
  if (a.ok) return { ...a, tier: "report" };
  const mon = cfg.gumroad_monitor_product_id;
  if (a.reason === "license_revoked" || !mon) return a;
  const b = await verifyLicense(key, mon);
  if (b.ok) return { ...b, tier: "monitor" };
  if (b.reason === "license_revoked") return b;
  return a.reason === "license_check_failed" || b.reason === "license_check_failed" ? { ok: false, reason: "license_check_failed" } : { ok: false, reason: "license_invalid" };
}
async function boundDomain(keyHash: string): Promise<string | null> {
  const rows = await rest(`a11y_licenses?key_hash=eq.${keyHash}&select=domain`);
  return rows?.[0]?.domain ?? null;
}
async function bindDomain(keyHash: string, host: string): Promise<{ ok: boolean; bound?: string }> {
  const cur = await boundDomain(keyHash);
  if (cur) return cur === host ? { ok: true, bound: host } : { ok: false, bound: cur };
  try {
    await rest("a11y_licenses", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ key_hash: keyHash, domain: host }) });
    return { ok: true, bound: host };
  } catch {
    const again = await rest(`a11y_licenses?key_hash=eq.${keyHash}&select=domain`);
    return again?.[0]?.domain === host ? { ok: true, bound: host } : { ok: false, bound: again?.[0]?.domain };
  }
}

// ---------- page gate (shared by the request path and the weekly job) ----------
function gatePage(html: string): { doc: any } | { error: string } {
  let doc: any;
  try {
    doc = new DOMParser().parseFromString(html, "text/html");
  } catch {
    return { error: "parse_failed" };
  }
  if (!doc) return { error: "parse_failed" };
  const pageTitle = (doc.querySelector("title")?.textContent || "").trim();
  if (
    /^(just a moment|attention required|access denied|forbidden|403|captcha|are you a robot|security check|one moment)/i.test(pageTitle) ||
    /cf-challenge|challenge-platform\/h\/|_incapsula_resource|px-captcha/i.test(html.slice(0, 20000))
  ) return { error: "blocked_by_site" };
  // visible body text (no script/style); tiny pages like example.com are fine, empty shells are not
  const bodyEl = doc.body || doc.querySelector("body");
  let bodyText = "";
  const walkText = (n: any) => {
    if (n.nodeType === 3) bodyText += n.nodeValue;
    else if (n.nodeType === 1 && !/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/i.test(n.nodeName)) for (const c of n.childNodes) walkText(c);
  };
  if (bodyEl) walkText(bodyEl);
  const textLen = bodyText.replace(/\s+/g, " ").trim().length;
  const nScripts = doc.querySelectorAll("script").length;
  const challenge = /enable javascript|javascript is (required|disabled)|checking your browser|cdn-cgi\/challenge|captcha-delivery|awswaf|perimeterx|bm-verify|sec-cpt|incapsula|pardon our interruption/i.test(html.slice(0, 20000));
  if (textLen < 50) {
    if (!nScripts && !challenge && !(bodyEl?.children?.length)) return { error: "empty_page" };
    return { error: "js_or_blocked" }; // bot-challenge stub, error stub or JS-only shell
  }
  if (textLen < 300 && challenge) return { error: "js_or_blocked" };
  return { doc };
}

// ---------- monitor (subscription): history + weekly re-check ----------
// Stored per (key_hash, domain): date, score, counts, per-check counts, engine version. Nothing else.
const isoIn = (ms: number) => new Date(Date.now() + ms).toISOString();
const pageKey = (u: URL) => `${u.protocol}//${u.host}${u.pathname}`; // no query string, no fragment
const samePage = (a: string, b: string) => {
  try {
    const x = new URL(a), y = new URL(b);
    return baseHost(x.hostname) === baseHost(y.hostname) && x.pathname.replace(/\/+$/, "") === y.pathname.replace(/\/+$/, "");
  } catch {
    return false;
  }
};
function tally(r: any) {
  const counts: Record<string, number> = { critical: 0, serious: 0, moderate: 0, minor: 0, advisory: 0, legal: 0 };
  const byCheck: Record<string, number> = {};
  for (const f of r.findings) {
    counts[f.kind === "wcag" ? f.severity : f.kind]++;
    byCheck[f.id] = f.count;
  }
  return { counts, byCheck };
}
async function recordHistory(keyHash: string, domain: string, r: any, auto: boolean) {
  const { counts, byCheck } = tally(r);
  await rest("a11y_history", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ key_hash: keyHash, domain, score: r.score ?? null, counts, check_counts: byCheck, engine: ENGINE_VERSION, auto }),
  });
}
const patchMonitor = (keyHash: string, v: Record<string, unknown>) =>
  rest(`a11y_monitors?key_hash=eq.${keyHash}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify(v) });
async function monitorView(keyHash: string, domain: string, lang: "he" | "en", m: any, saved: boolean) {
  const rows: any[] = (await rest(`a11y_history?key_hash=eq.${keyHash}&domain=eq.${encodeURIComponent(domain)}&select=checked_at,score,counts,check_counts,engine,auto&order=checked_at.desc&limit=${MON_HISTORY + 1}`)) || [];
  const chrono = rows.reverse();
  const titles: Record<string, { title: string; kind: string }> = {};
  const name = (id: string) => {
    if (!titles[id]) titles[id] = { title: CHECK_BY_ID[id]?.title?.[lang] || id, kind: LEGAL.has(id) ? "legal" : ADVISORY.has(id) ? "advisory" : "wcag" };
    return id;
  };
  const history = chrono.map((h, i) => {
    const prev = i > 0 ? chrono[i - 1] : null;
    const cur = Object.keys(h.check_counts || {});
    const before = prev ? Object.keys(prev.check_counts || {}) : [];
    return {
      at: h.checked_at,
      score: h.score,
      auto: h.auto,
      counts: h.counts,
      issues: cur.length,
      compared: !!prev,
      engine_changed: !!prev && prev.engine !== h.engine,
      fixed: prev ? before.filter((id) => !(id in (h.check_counts || {}))).map(name) : [],
      new: prev ? cur.filter((id) => !(id in (prev.check_counts || {}))).map(name) : [],
    };
  }).slice(-MON_HISTORY).reverse(); // newest first
  return { watched_url: m.page_url, next_check_at: m.next_check_at, last_auto_at: m.last_auto_at || null, last_auto_status: m.last_auto_status || null, this_check_saved: saved, history, titles };
}
// Called after a successful paid scan with a monitor key: (re)activate the monitor, save the key in Vault
// for the weekly subscription re-check, add this check to the history if it is the watched page.
async function monitorOnScan(keyHash: string, key: string, domain: string, finalUrl: string, r: any, lang: "he" | "en") {
  await rest("rpc/a11y_mon_key_put", { method: "POST", body: JSON.stringify({ p_key_hash: keyHash, p_key: key }) });
  let m = (await rest(`a11y_monitors?key_hash=eq.${keyHash}&select=*`))?.[0];
  if (!m) {
    m = { key_hash: keyHash, domain, page_url: pageKey(new URL(finalUrl)), lang, active: true, next_check_at: isoIn(7 * DAY_MS) };
    await rest("a11y_monitors", { method: "POST", headers: { Prefer: "return=minimal,resolution=ignore-duplicates" }, body: JSON.stringify(m) });
    m = (await rest(`a11y_monitors?key_hash=eq.${keyHash}&select=*`))?.[0] || m;
  } else if (!m.active) {
    m = { ...m, active: true, ended_at: null, last_auto_status: null, next_check_at: isoIn(7 * DAY_MS) };
    await patchMonitor(keyHash, { active: true, ended_at: null, last_auto_status: null, next_check_at: m.next_check_at });
  }
  const saved = m.domain === domain && samePage(m.page_url, finalUrl);
  if (saved) await recordHistory(keyHash, domain, r, false);
  return await monitorView(keyHash, domain, lang, m, saved);
}
// Weekly re-check of one monitor: re-verify the subscription, then scan through the same SSRF-guarded fetch.
async function recheckMonitor(m: any, productId: string): Promise<string> {
  const end = async (status: string) => {
    await patchMonitor(m.key_hash, { active: false, ended_at: new Date().toISOString(), last_auto_status: status });
    await rest("rpc/a11y_mon_key_clear", { method: "POST", body: JSON.stringify({ p_key_hash: m.key_hash }) }); // stored key no longer needed
    return status;
  };
  const retry = async (status: string, ms: number) => {
    await patchMonitor(m.key_hash, { next_check_at: isoIn(ms), last_auto_at: new Date().toISOString(), last_auto_status: status });
    return status;
  };
  const key = await rest("rpc/a11y_mon_key_get", { method: "POST", body: JSON.stringify({ p_key_hash: m.key_hash }) });
  if (typeof key !== "string" || !/^[A-Za-z0-9-]{1,100}$/.test(key) || (await sha256("lic|" + key)) !== m.key_hash) return await end("no_key");
  const v = await verifyLicense(key, productId);
  if (!v.ok) return v.reason === "license_check_failed" ? await retry("license_check_failed", 6 * 3600_000) : await end(v.reason || "license_invalid");
  const bound = await boundDomain(m.key_hash);
  if (bound && bound !== m.domain) return await end("license_other_domain");
  let target: URL;
  try {
    target = new URL(m.page_url);
  } catch {
    return await end("bad_url");
  }
  if (baseHost(target.hostname) !== m.domain) return await end("license_other_domain");
  const lang: "he" | "en" = m.lang === "en" ? "en" : "he"; // the language of the buyer's first check
  const page = await fetchPage(target, lang); // checkTarget() runs on every hop
  if ("error" in page) return await retry(page.error, DAY_MS);
  // redirected to another page, language version or host: don't record it as the watched page
  if (!samePage(m.page_url, page.finalUrl)) return await retry("moved", DAY_MS);
  const g = gatePage(page.html);
  if ("error" in g) return await retry(g.error, DAY_MS);
  const r = runChecks(g.doc, page.html, page.finalUrl, lang);
  await recordHistory(m.key_hash, m.domain, r, true);
  await patchMonitor(m.key_hash, { next_check_at: isoIn(7 * DAY_MS), last_auto_at: new Date().toISOString(), last_auto_status: "ok" });
  return "ok";
}
// Retention: history of an ended subscription is kept 90 days (a returning subscriber sees it), any row 400 days.
async function purgeMonitors() {
  const del = (q: string) => rest(q, { method: "DELETE", headers: { Prefer: "return=minimal" } });
  const cut90 = encodeURIComponent(new Date(Date.now() - 90 * DAY_MS).toISOString());
  const old: any[] = (await rest(`a11y_monitors?active=is.false&ended_at=lt.${cut90}&select=key_hash&limit=50`)) || [];
  for (const o of old) {
    await rest("rpc/a11y_mon_key_clear", { method: "POST", body: JSON.stringify({ p_key_hash: o.key_hash }) });
    await del(`a11y_history?key_hash=eq.${o.key_hash}`);
    await del(`a11y_monitors?key_hash=eq.${o.key_hash}`);
  }
  await del(`a11y_history?checked_at=lt.${encodeURIComponent(new Date(Date.now() - 400 * DAY_MS).toISOString())}`);
  await del(`a11y_monitor_runs?ran_at=lt.${cut90}`);
}
// Counts only (no keys, no URLs), so failures of the weekly job are visible in the table and the function log.
async function logRun(s: { due: number; scanned: number; failed: number; moved: number; ended: number }) {
  console.log("a11y-monitor run", JSON.stringify(s));
  if (s.due || s.ended) await rest("a11y_monitor_runs", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(s) }).catch(() => {});
}
async function runMonitorBatch(): Promise<{ ran: number; results: string[] }> {
  cfgCache = null; // pick up a just-set product id
  try {
    await purgeMonitors();
  } catch { /* retried next hour */ }
  const cfg = await config();
  const pid = cfg.gumroad_monitor_product_id;
  if (!pid) {
    // No monitor product: subscriptions can't be re-verified, so don't keep their keys. A buyer who checks
    // again with a valid key (once the product id is back) reactivates the monitor and the key is stored again.
    const live: any[] = (await rest("a11y_monitors?active=is.true&select=key_hash&limit=50")) || [];
    for (const m of live) {
      await patchMonitor(m.key_hash, { active: false, ended_at: new Date().toISOString(), last_auto_status: "no_product" });
      await rest("rpc/a11y_mon_key_clear", { method: "POST", body: JSON.stringify({ p_key_hash: m.key_hash }) });
    }
    await logRun({ due: 0, scanned: 0, failed: 0, moved: 0, ended: live.length });
    return { ran: 0, results: live.map(() => "no_product") };
  }
  const started = Date.now();
  const due: any[] = (await rest(`a11y_monitors?active=is.true&next_check_at=lte.${encodeURIComponent(new Date().toISOString())}&select=key_hash,domain,page_url,lang&order=next_check_at.asc&limit=${MON_BATCH}`)) || [];
  const results: string[] = [];
  for (const m of due) {
    if (Date.now() - started > 90_000) break;
    await patchMonitor(m.key_hash, { next_check_at: isoIn(3600_000) }); // claim: an overlapping run skips it
    try {
      results.push(await recheckMonitor(m, pid));
    } catch {
      results.push("error");
    }
  }
  const ENDS = new Set(["no_key", "license_invalid", "license_revoked", "license_other_domain", "bad_url"]);
  const n = (f: (s: string) => boolean) => results.filter(f).length;
  await logRun({
    due: due.length,
    scanned: n((s) => s === "ok"),
    moved: n((s) => s === "moved"),
    ended: n((s) => ENDS.has(s)),
    failed: n((s) => s !== "ok" && s !== "moved" && !ENDS.has(s)),
  });
  return { ran: results.length, results };
}

// ---------- handler ----------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  // internal: hourly pg_cron tick. Needs the Vault token; anything else looks like a missing path.
  if (new URL(req.url).pathname.replace(/\/+$/, "").endsWith("/cron")) {
    const tok = req.headers.get("x-a11y-cron") || "";
    let okTok = false;
    try {
      okTok = req.method === "POST" && /^[0-9a-f]{64}$/.test(tok) && (await rest("rpc/a11y_cron_ok", { method: "POST", body: JSON.stringify({ p_token: tok }) })) === true;
    } catch { /* treat as not found */ }
    if (!okTok) return err("not_found", 404);
    const job = runMonitorBatch().catch(() => ({ ran: 0, results: ["error"] }));
    if (typeof EdgeRuntime !== "undefined" && EdgeRuntime?.waitUntil) {
      EdgeRuntime.waitUntil(job);
      return json({ ok: true, accepted: true }, 202);
    }
    return json({ ok: true, ...(await job) });
  }
  if (req.method === "GET") {
    try {
      const c = await config();
      const on = c.paid_enabled === "true" && !!c.gumroad_product_id;
      const mon = on && !!c.gumroad_monitor_product_id && !!c.monitor_buy_url;
      return json({ ok: true, engine: ENGINE_VERSION, paid_enabled: on, buy_url: on ? c.buy_url || null : null, monitor_enabled: mon, monitor_buy_url: mon ? c.monitor_buy_url : null, weights: WEIGHTS, free_per_hour: FREE_PER_HOUR });
    } catch {
      return err("unavailable", 503);
    }
  }
  if (req.method !== "POST") return err("method_not_allowed", 405);
  const raw = await req.text();
  if (raw.length > 4000) return err("bad_request", 400);
  let body: any;
  try {
    body = JSON.parse(raw);
  } catch {
    return err("bad_request", 400);
  }
  const lang: "he" | "en" = body?.lang === "en" ? "en" : "he";
  let input = typeof body?.url === "string" ? body.url.trim() : "";
  if (!input || input.length > 2048) return err("bad_url", 400);
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(input)) input = "https://" + input;
  let target: URL;
  try {
    target = new URL(input);
  } catch {
    return err("bad_url", 400);
  }
  target.hash = "";
  const license = typeof body?.license === "string" ? body.license.trim() : "";
  if (license && (license.length > 100 || !/^[A-Za-z0-9-]+$/.test(license))) return err("license_invalid", 400);

  let cfg: Record<string, string>;
  try {
    cfg = await config();
  } catch {
    return err("unavailable", 503);
  }
  const ip = (req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "0").split(",")[0].trim();
  const ipHash = (await sha256((cfg.ip_salt || "s") + "|" + ip)).slice(0, 32);
  const hour = new Date();
  hour.setUTCMinutes(0, 0, 0);
  const day = new Date();
  day.setUTCHours(0, 0, 0, 0);

  // pre-flight SSRF check before spending a rate-limit slot on obviously bad targets
  const pre = await checkTarget(target);
  if (pre) return err(pre, 400);

  const paidOn = cfg.paid_enabled === "true" && !!cfg.gumroad_product_id;
  const monOn = paidOn && !!cfg.gumroad_monitor_product_id && !!cfg.monitor_buy_url;
  let paid = false;
  let keyHash = "";
  let tier: "report" | "monitor" | "" = "";
  if (license) {
    if (!paidOn) return err("paid_not_available", 400);
    const n = await hitCounter("ipl:" + ipHash, hour.toISOString());
    if (n > PAID_PER_HOUR_IP) return err("rate_limited", 429, { retry_after_s: 3600 - (Date.now() - hour.getTime()) / 1000 | 0 });
    const v = await verifyAny(license, cfg);
    if (!v.ok) return err(v.reason!, 402);
    tier = v.tier!;
    keyHash = await sha256("lic|" + license);
    // refuse early if bound elsewhere; bind only after the page was fetched and parsed
    const cur = await boundDomain(keyHash);
    if (cur && cur !== baseHost(target.hostname)) return err("license_other_domain", 403, { bound_domain: cur });
    const used = await hitCounter("lic:" + keyHash, day.toISOString());
    if (used > PAID_PER_KEY_DAY) return err("license_daily_cap", 429, { cap: PAID_PER_KEY_DAY });
    paid = true;
  } else {
    const n = await hitCounter("ip:" + ipHash, hour.toISOString());
    if (n > FREE_PER_HOUR) return err("rate_limited", 429, { limit: FREE_PER_HOUR, retry_after_s: 3600 - (Date.now() - hour.getTime()) / 1000 | 0 });
  }

  const page = await fetchPage(target, lang);
  if ("error" in page) return err(page.error, 422, page.status ? { http_status: page.status } : {});
  const finalUrl = new URL(page.finalUrl);
  if (paid && baseHost(finalUrl.hostname) !== baseHost(target.hostname)) return err("license_other_domain", 403, { bound_domain: baseHost(target.hostname) });

  const gate = gatePage(page.html);
  if ("error" in gate) return err(gate.error, 422);
  const doc = gate.doc;
  if (paid) {
    const b = await bindDomain(keyHash, baseHost(finalUrl.hostname));
    if (!b.ok) return err("license_other_domain", 403, { bound_domain: b.bound });
  }
  const t0 = Date.now();
  const r = runChecks(doc, page.html, page.finalUrl, lang);
  const ms = Date.now() - t0;

  const findings = paid ? r.findings : r.findings.slice(0, FREE_TOP).map(({ fix: _f, code: _c, ...rest }) => rest);
  const counts = { critical: 0, serious: 0, moderate: 0, minor: 0 } as Record<string, number>;
  let advisory = 0, legal = 0;
  for (const f of r.findings) {
    if (f.kind === "wcag") counts[f.severity]++;
    else if (f.kind === "advisory") advisory++;
    else legal++;
  }
  const checksRun = r.passed.length + r.findings.length;
  const scannedAt = new Date().toISOString();
  let monitor: any = null;
  if (paid && tier === "monitor") {
    try {
      monitor = await monitorOnScan(keyHash, license, baseHost(finalUrl.hostname), page.finalUrl, r, lang);
    } catch {
      monitor = { error: "history_unavailable" };
    }
  }

  // log: host only, no personal data
  rest("a11y_scans", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ host: baseHost(finalUrl.hostname).slice(0, 253), score: r.score, lang, paid, n_findings: r.findings.length, engine: ENGINE_VERSION, js_rendered: r.stats.jsRendered }),
  }).catch(() => {});

  return json({
    ok: true,
    engine: ENGINE_VERSION,
    paid,
    tier: paid ? tier : null,
    ...(monitor ? { monitor } : {}),
    lang,
    url: page.finalUrl,
    host: finalUrl.hostname,
    scanned_at: scannedAt,
    ms,
    score: r.score,
    counts,
    advisory_count: advisory,
    legal_count: legal,
    total_findings: r.findings.length,
    hidden_findings: paid ? 0 : Math.max(0, r.findings.length - FREE_TOP),
    findings,
    passed_count: r.passed.length,
    failed_count: r.findings.length,
    na_count: r.notApplicable.length,
    checks_run: checksRun,
    ...(paid ? { passed: r.passed, not_applicable: r.notApplicable, statement_draft: statementTemplates(r, page.finalUrl, scannedAt.slice(0, 10), checksRun) } : {}),
    deductions: paid ? r.deductions : (() => {
      const shown = new Set(findings.map((f) => f.id));
      const vis = r.deductions.filter((d) => shown.has(d.id));
      const rest = r.deductions.filter((d) => !shown.has(d.id)).reduce((s, d) => s + d.points, 0);
      return rest ? [...vis, { id: "other", points: rest }] : vis;
    })(),
    weights: WEIGHTS,
    overlays: r.overlays,
    statement: r.statement,
    stats: r.stats,
    paid_enabled: paidOn,
    buy_url: paidOn ? cfg.buy_url || null : null,
    monitor_enabled: monOn,
    monitor_buy_url: monOn ? cfg.monitor_buy_url : null,
  });
});
