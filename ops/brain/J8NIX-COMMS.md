# J8NIX communication standard (14 Nov 2026) — binds every reply line, run summary, project "you" line and push

Dave reads J8NIX on an Android phone, in seconds, between other things. He is the CEO, not the engineer.
The phone alert shows only the last line, so that line must stand on its own.

## The five rules

1. **Outcome first, in one plain sentence.** What changed or what is true now. Not what the team did internally.
2. **Severity tag at the very start** (right after the `HH:MM — ` time on reply lines):
   - 🔴 **needs you now** — money, a live prospect or a deadline is lost if Dave waits hours. Pushes day and night. Use rarely.
   - 🟠 **needs you today** — Dave must do or decide something, but it can wait for a quiet moment. No push 23:00–07:00 Israel.
   - 🟢 **FYI, done** — nothing for Dave. No push 23:00–07:00 Israel.
   If in doubt between 🔴 and 🟠, pick 🟠. Never tag 🔴 for a team-side problem (failed run, bug, missing access the team can solve).
3. **Anything 🔴 or 🟠 says exactly: what to do, where (one direct link), how long it takes**, in this order:
   `Do: <verb + what> — <link> (<N> min[, phone|Mac])`. One action per line. If there are two, the most important one goes first and the second goes in the List item, not in the alert.
4. **No jargon, no internal names, no repeats.** Never write: staged/staging, deploy, commit, PASS/FAIL, QA, arm, pod, brain, contract, batch ids (li-1115), table names, "390", "e2e", file paths, tool names (Supabase, Playwright, MCP, Chrome extension). Say what it means for Dave ("ready for the next app update", "checked on a phone"). Don't repeat what an earlier line or the List already says.
5. **Numbers are real and carry their source.** `$0 booked (money summary)`, `3 replies (LinkedIn inbox, 14 Nov)`. No source, no number. Unknown = say "not counted yet".

## Shapes

- Reply line: `HH:MM — 🟢 Done: <outcome>. Nothing for you.`
- Reply line that needs Dave: `HH:MM — 🟠 <outcome / what is blocked>. Do: <action> — <link> (<N> min).`
- Run summary (≤200 characters): `🟢 <outcome>. Nothing for you.` or `🟠 <outcome>. Do: <action> — <link> (<N> min).` A run with status `nothing` stays as it is (no tag needed; it never pings).
- Project `you` line: starts with the tag too: `🟠 Read the prep page before Sun 10:00 (10 min)`. "Nothing now…" lines need no tag.
- Approval drafts: no tag in the body (it is the text that goes out). The app and the alert treat every new draft as 🟠.

## Before / after (real rows, 13–14 Nov)

| # | Source | Before | After |
|---|---|---|---|
| 1 | run `cro-pod-20261114-0730` | Sunday pipeline: 17 drafts ready for your OK in J8NIX → Approvals | 🟠 17 founder notes are written and wait for your OK; they go out Sunday. Do: open List → Approve → "Sunday pipeline" — https://3shamrocks.com/j8/#approve (10 min, phone). |
| 2 | run `product-pod-20261114-1007` | SH✡MER Hebrew beta join page staged (needs your Google Group link); LickPick tester page phone-checked; Sprint↔audit linked, flow PASS at 390; council demo links checked. | 🟠 The SH✡MER tester sign-up page is ready but can't open without a Google Group. Do: create a group called "SH✡MER testers" at https://groups.google.com and send its link here (5 min, phone). |
| 3 | run `night-shift-20261114-0308` | Brand Sprint page numbers now match their sources (live). SH✡MER My SHOMERs panel fixed for English/Arabic on a staging copy (next app update). 6 site pages healthy. 3 revision items closed. | 🟢 Overnight: every number on the Brand Sprint page now matches its source, and the SH✡MER English/Arabic fix is ready for the next app update. Nothing for you. |
| 4 | run `brain-shift-20261113-1813` | Digest: 0 sent · 2 jobs queued (Sun) · 3 need your OK (2 council emails, Brand Sprint post) · 16 emails held (studio email off). Sprint page rewritten, no price. | 🟠 3 drafts wait for your OK: 2 council emails and the Brand Sprint post; nothing went out yet (0 sent, J8NIX Approve). Do: read and Send or Kill them — https://3shamrocks.com/j8/#approve (5 min). |
| 5 | message `p-payments-1794548552411`, 14:28 line | I tried just now in Chrome on your Mac: Morning opened on its sign-in page, so it isn't logged in and I stopped (I never type passwords). Sign in once at app.greeninvoice.co.il with "remember me", reply "in" here, and I'll fill Grow up to the ID + bank upload and terms, which only you can do. | 14:28 — 🟠 Grow can't be connected yet: Morning is signed out on your Mac. Do: sign in at https://app.greeninvoice.co.il/ with "remember me" ticked, then reply "in" here (2 min, Mac). |
| 6 | message `p-general-1794639299758`, 09:32 line | Done: permanent rule — no message goes to anyone Fri 00:00–Sat 23:59 (Israel), and never on a recipient's own Sat/Sun abroad. Written into the brain + arms contract; the sender arm already runs Sun–Thu only. | 09:32 — 🟢 Done: nothing goes out to anyone from Friday 00:00 to Saturday 23:59 (Israel time), or on a recipient's own weekend abroad. Nothing for you. |

## What the app and the alerts do with the tag (J8NIX 5.1, 14 Nov)

- **Chat → "Needs you"** (pinned at the top): every open item that needs Dave — drafts to OK per batch, team questions waiting on him, each project's `you` line — 🔴 first, one line each, tap to act. Empty: "Nothing needs you right now."
- **Chat → "Since you last looked"**: runs finished, drafts added, team replies since his last visit (real timestamps, stored on his phone).
- **Reply bubbles and Next** show the tag as a chip; old lines without a tag show no chip (or 🟠 when they say NEEDS YOUR EYES).
- **Alerts** (`j8private.push_on_change`): title = tag + short title (e.g. "🟠 SH✡MER app · needs you today", "🟢 Done · Night shift"). 23:00–07:00 Israel only 🔴 pushes; the others are logged in the outbox as "quiet hours" and show in the app. Untagged: replies 🟢 (🟠 if they say NEEDS YOUR EYES / WHAT YOU DO), new drafts 🟠, finished runs 🟢, failed runs 🟠. `j8.no_push` still silences everything; Dave's own messages never push.
