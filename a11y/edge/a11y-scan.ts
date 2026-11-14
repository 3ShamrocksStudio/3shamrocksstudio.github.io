// a11y-scan: public website accessibility checker (3Shamrocks Studio).
// verify_jwt=false; this function validates its own input, rate-limits per hashed IP,
// and unlocks the full report only with a Gumroad license key verified server-side.
// deno-lint-ignore-file no-explicit-any
import { DOMParser } from "jsr:@b-fuze/deno-dom@0.1.56";
import { ENGINE_VERSION, runChecks, statementTemplates, WEIGHTS } from "https://raw.githubusercontent.com/3ShamrocksStudio/3shamrocksstudio.github.io/bda88d75475a9fe68af5afd60ac2dab49a6e19b5/a11y/engine/engine.ts";

const SB_URL = Deno.env.get("SUPABASE_URL") || "";
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const FREE_PER_HOUR = 10;
const PAID_PER_HOUR_IP = 40;
const PAID_PER_KEY_DAY = 10;
const FREE_TOP = 5;
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
    if (p.subscription_ended_at || p.subscription_cancelled_at || p.subscription_failed_at) return { ok: false, reason: "license_revoked" };
    return { ok: true };
  } catch {
    return { ok: false, reason: "license_check_failed" };
  }
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

// ---------- handler ----------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method === "GET") {
    try {
      const c = await config();
      const on = c.paid_enabled === "true" && !!c.gumroad_product_id;
      return json({ ok: true, engine: ENGINE_VERSION, paid_enabled: on, buy_url: on ? c.buy_url || null : null, weights: WEIGHTS, free_per_hour: FREE_PER_HOUR });
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
  let paid = false;
  let keyHash = "";
  if (license) {
    if (!paidOn) return err("paid_not_available", 400);
    const n = await hitCounter("ipl:" + ipHash, hour.toISOString());
    if (n > PAID_PER_HOUR_IP) return err("rate_limited", 429, { retry_after_s: 3600 - (Date.now() - hour.getTime()) / 1000 | 0 });
    const v = await verifyLicense(license, cfg.gumroad_product_id);
    if (!v.ok) return err(v.reason!, 402);
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

  let doc: any;
  try {
    doc = new DOMParser().parseFromString(page.html, "text/html");
  } catch {
    return err("parse_failed", 422);
  }
  if (!doc) return err("parse_failed", 422);
  const pageTitle = (doc.querySelector("title")?.textContent || "").trim();
  if (
    /^(just a moment|attention required|access denied|forbidden|403|captcha|are you a robot|security check|one moment)/i.test(pageTitle) ||
    /cf-challenge|challenge-platform\/h\/|_incapsula_resource|px-captcha/i.test(page.html.slice(0, 20000))
  ) return err("blocked_by_site", 422);
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
  const challenge = /enable javascript|javascript is (required|disabled)|checking your browser|cdn-cgi\/challenge|captcha-delivery|awswaf|perimeterx|bm-verify|sec-cpt|incapsula|pardon our interruption/i.test(page.html.slice(0, 20000));
  if (textLen < 50) {
    if (!nScripts && !challenge && !(bodyEl?.children?.length)) return err("empty_page", 422);
    return err("js_or_blocked", 422); // bot-challenge stub, error stub or JS-only shell
  }
  if (textLen < 300 && challenge) return err("js_or_blocked", 422);
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
  });
});
