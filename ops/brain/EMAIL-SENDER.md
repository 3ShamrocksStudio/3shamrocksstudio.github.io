# EMAIL-SENDER: how to send studio email as dave@3shamrocks.com (zero spend)
Checked 13 Nov 2026 via DNS-over-HTTPS (dns.google, cloudflare-dns.com). No DNS, account or repo file was changed.

## 1. Raw DNS findings (JSON answers, trimmed to Answer/Authority)
MX 3shamrocks.com
{"Status":0,"Answer":[{"type":15,"TTL":3600,"data":"10 aspmx.l.google.com."},{"data":"20 alt1.aspmx.l.google.com."},{"data":"30 alt2.aspmx.l.google.com."},{"data":"40 alt3.aspmx.l.google.com."},{"data":"50 alt4.aspmx.l.google.com."}]}

TXT 3shamrocks.com
{"Status":0,"Answer":[{"type":16,"TTL":3600,"data":"v=spf1 include:_spf.google.com ~all"},{"type":16,"TTL":3600,"data":"google-site-verification=7V_TnivZlhnp2frx_EjHibG7cUJ_dDW__me-HoBqLL8"}]}

TXT _dmarc.3shamrocks.com (Google DoH and Cloudflare DoH agree)
{"Status":3,"Authority":[{"name":"3shamrocks.com.","type":6,"data":"ns10.wixdns.net. support.wix.com. 2017092612 10800 3600 1209600 3600"}]}   -> NXDOMAIN = NO DMARC RECORD

NS 3shamrocks.com
{"Status":0,"Answer":[{"type":2,"TTL":21600,"data":"ns11.wixdns.net."},{"type":2,"TTL":21600,"data":"ns10.wixdns.net."}]}

SOA 3shamrocks.com
{"Status":0,"Answer":[{"type":6,"data":"ns10.wixdns.net. support.wix.com. 2017092612 10800 3600 1209600 3600"}]}

A 3shamrocks.com -> 185.199.108.153, .109.153, .110.153, .111.153 (GitHub Pages)
CNAME www.3shamrocks.com -> 3shamrocksstudio.github.io.
CAA 3shamrocks.com -> none (Status 0, no answer)

DKIM selectors probed under _domainkey.3shamrocks.com: google, default, zoho, selector1, selector2, k1, mail, s1, dkim, zmail
-> all Status 3 (NXDOMAIN). NO DKIM RECORD PUBLISHED on any common selector. (Google Workspace's default selector is "google"; it is absent, so DKIM signing is not switched on.)

## 2. What is already known (repo)
- ops/brain/ARMS-CONTRACT.md + BRAIN.md: studio email must come from dave@3shamrocks.com; sends are held while control/main.email_from_ok is false.
- ops/brain/brain.json: "Gmail connector is Dave's personal Gmail"; "Drive (dave@3shamrocks.com)" was reachable via the Google Drive connector. So dave@3shamrocks.com is a real Google account/mailbox, and one connector (Drive) is already authenticated as it.
- No repo note mentions Workspace plan, forwarding or Wix Mail. Registrar/DNS host is Wix (wixdns.net) with the GitHub Pages A records added there.

## 3. Provider
Mail is hosted by Google (all 5 MX = Google, SPF = _spf.google.com, google-site-verification TXT). Dave confirmed the address works, and the Drive connector shows a Google login as dave@3shamrocks.com, so it is a Google Workspace (or legacy free G Suite) mailbox, not Wix mail. DNS host = Wix (ns10/ns11.wixdns.net); registrar is probably Wix too (not provable from DNS; WHOIS/RDAP not queried).

## 4. Options evaluated
A. RECOMMENDED: authenticate the Gmail connector (or a second Gmail connector instance) as dave@3shamrocks.com itself.
   - It is a native Google mailbox, so no alias or relay trick is needed; mail sends From dave@3shamrocks.com, SPF passes via _spf.google.com, and Sent items land in the studio mailbox. Zero cost (the mailbox already exists).
   - Needs one Dave login: the OAuth consent in Claude's connector settings, choosing the dave@3shamrocks.com account (the personal one is probably the one currently linked).
   - Caveat: Workspace admins can block third-party OAuth apps. Dave is presumably his own admin (admin.google.com > Security > API controls) and may need to allow the Claude/Gmail connector app. I could not verify the admin setting.
B. Gmail "Send mail as" alias on Dave's personal Gmail (Settings > Accounts > Send mail as > add dave@3shamrocks.com, SMTP smtp.gmail.com:587 with an app password, or Google's "treat as alias" with no SMTP).
   - Fails our tooling: the connector's send_message (schema checked) has NO from / sender parameter; fields are to, cc, bcc, subject, body, htmlBody, attachments, draftId, replyThreadId, includeSignature. We cannot choose the alias per message. Whether the Gmail API would use the account's default send-as address when From is omitted is unverified; the default-alias setting is documented for the Gmail web UI. A one-message self-test would show it, but this path also ships Dave's personal address as the real sender envelope and mixes mailboxes. Fallback only.
   - Cost-free, but requires Dave's 2-step verification + app password in the SMTP variant.
C. Drive connector or Linear/GitHub as senders: not email senders. Rejected.
D. Wix forwarding / third-party forwarders: forwarding is inbound only, does not give outbound From. Rejected.
E. Paid transactional services (SendGrid/Mailgun/Resend free tiers): free tiers exist but need card or domain verification and add DKIM records; unnecessary because Google already hosts the mailbox. Rejected under the zero-spend/no-extra-account stance.

## 5. Recommended path
Path A. Connect the Gmail connector as dave@3shamrocks.com, then set DKIM + DMARC (below) before the first send. Keep the personal-Gmail connection out of studio outreach (ARMS rule).

## 6. Deliverability for a new-domain warm-up
- SPF: present and correct for Google sending (v=spf1 include:_spf.google.com ~all). Nothing to add. (Optional later: change ~all to -all once stable. Not needed now.)
- DKIM: MISSING. Must be generated in Google Admin and published at Wix DNS. Google/Yahoo bulk-sender rules and spam filters expect DKIM; without it mail is signed only by Google's generic key (d=gmail.com style) and DMARC alignment fails.
- DMARC: MISSING. Needed; Gmail/Yahoo require it for senders above 5,000/day, and it helps inbox placement for any new domain.
Records needed (only these two are missing):
  1) TXT  name: google._domainkey   value: the "v=DKIM1; k=rsa; p=..." string Google Admin generates (Dave cannot invent it; Admin console shows it, 2048-bit). Then click "Start authentication" in Admin.
  2) TXT  name: _dmarc   value: v=DMARC1; p=none; rua=mailto:dave@3shamrocks.com; adkim=r; aspf=r; pct=100
     (p=none for the warm-up month; move to p=quarantine after about 30 days of clean reports.)
Wix DNS UI note: Wix often wants the Host name entered as "google._domainkey" and "_dmarc" without the domain; long DKIM keys may need to be pasted as a single string.
Warm-up rules (no spend): 14 emails is tiny, send 5 to 10 per day from a real person-to-person text, plain text, no tracking pixels, one link at most, an opt-out line (already in LEADGEN rules), reply to responders to build reputation, no attachments at first.

## 7. Dave's steps (only what needs his login) · NEEDS YOUR EYES
Simplest path, decided 13 Nov brain shift: the Mac sender arm sends from Gmail web in Chrome while signed in as dave@3shamrocks.com, so the Gmail connector keeps reading Dave's own inbox (job alerts, replies).
1. On the Mac, in Chrome, make sure a Google profile is signed in as dave@3shamrocks.com (https://mail.google.com opens that inbox).
2. In J8NIX → Control, switch "studio email OK" (email_from_ok) on. The sender arm then sends the approved emails, max 10 a day, after re-checking each one.
Deliverability (recommended within the 2–4 week warm-up, 5 min, his Google Admin + Wix logins):
3. https://admin.google.com/ac/apps/gmail/authenticateemail → domain 3shamrocks.com → "Generate new record" (2048-bit, selector "google") → copy the TXT value.
4. https://manage.wix.com/account/domains → 3shamrocks.com → Manage DNS records → add TXT host `google._domainkey`, value = step 3. Add TXT host `_dmarc`, value `v=DMARC1; p=none; rua=mailto:dave@3shamrocks.com; adkim=r; aspf=r`.
5. ~15 min later, back on the step 3 page → "Start authentication". Claude then re-checks DNS and headers.
Alternative (if the Mac arm can't use Gmail web): sign the Gmail connector in as dave@3shamrocks.com; cost: the brain stops reading Dave's own inbox.

## 8. What Claude does after
- Verify DNS via DoH: google._domainkey TXT and _dmarc TXT resolve; SPF unchanged.
- Run a self-test send to a Gmail-test address owned by us and check headers (From dave@3shamrocks.com, SPF=pass, DKIM=pass d=3shamrocks.com, DMARC=pass). Only a Dave-confirmed address; no outreach recipient.
- Flip control/main.email_from_ok to true only after PASS evidence + independent verifier, then release the 14 approved emails in small daily batches (5 to 10/day), tracking bounces/replies.
- Post the result and evidence in the brain log with tag NEEDS YOUR EYES only if the self-test fails.

## 9. Sources
- https://dns.google/resolve?name=3shamrocks.com&type=MX (also TXT, NS, SOA, A, CAA, _dmarc, and the 10 DKIM selector names)
- https://cloudflare-dns.com/dns-query?name=_dmarc.3shamrocks.com&type=TXT
- Repo: ops/brain/ARMS-CONTRACT.md, ops/brain/BRAIN.md, ops/brain/brain.json
- Gmail connector send_message schema (no from field), read in-session
- https://support.google.com/a/answer/174124 (set up DKIM in Google Workspace)
- https://support.google.com/a/answer/2466580 (SPF for Google Workspace)
- https://support.google.com/a/answer/10032169 (Google/Yahoo sender requirements, DMARC)
- https://support.google.com/mail/answer/22370 (Gmail Send mail as)
- https://support.google.com/a/answer/7281227 (control third-party app access)
- https://support.wix.com/en/article/adding-or-updating-txt-records-in-your-wix-account (Wix TXT records)
Note: the support.* and Wix URLs are from memory and were not fetched this session.
