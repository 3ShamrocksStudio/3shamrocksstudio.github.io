# J8NIX communication standard (14 Nov 2026) — binds every reply line, run summary, project "you" line and push

Dave reads J8NIX on an Android phone, in seconds, between other things. He is the CEO, not the engineer.
The phone alert shows only the last line, so that line must stand on its own.

## The five rules

1. **Outcome first, in one plain sentence.** What changed or what is true now. Not what the team did internally.
2. **Severity tag at the very start** (right after the `HH:MM — ` time on reply lines):
   - 🔴 **needs you now** — money, a live prospect or a deadline is lost if Dave waits hours. Use rarely. At night (23:00–07:00 Israel) only a 🔴 team reply line, or a failed run that reports a security problem or a live outage, pushes; a 🔴 run summary waits for the morning.
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
- **Alerts** (`j8private.push_on_change`): title = tag + short title with plain team names (e.g. "🟠 SH✡MER app · needs you today", "🟢 Done · Night shift", "🟢 Done · Sales team"). New drafts are always 🟠. Failed runs are 🟠, or 🔴 when the summary reports a security problem or a live outage (security, breach, leak, outage, site/app down). 23:00–07:00 Israel only a 🔴 team reply line or a 🔴 failed run pushes; everything else is logged in the outbox as "quiet hours" and shows in the app. Untagged replies are 🟢 (🟠 if they say NEEDS YOUR EYES / WHAT YOU DO); untagged finished runs are 🟢. `j8.no_push` still silences everything; Dave's own messages never push.
- **App** (5.1.1): a draft batch due today shows 🔴 in the app only (no night push). Held sends are grouped by the one action Dave must take ("Allow CV access on the Mac (6 applications)"), and a project "you" line that repeats a listed batch or held send is left out. Next and "Needs you" use one list and one order.

## Writing a step for Dave (J8NIX 11.3)

Binding for every arm, from 17 Nov 2026 (Dave: "users must have clear instructions, only when J8NIX can't do it itself, or when the system needs to be connected by users").

**Create a Dave step ONLY when J8NIX cannot do it itself:** an account, a password or a sign-in, a payment, a signature, something on his own phone or Mac, approving content in his name, or connecting a service. Everything else the team does, then reports with a 🟢 line.

A step is one j8_tasks row (owner 'dave'). Every field is required:

| Field | Rule | Good | Bad |
|---|---|---|---|
| title | A plain imperative sentence, complete, ≤70 characters. Says what and the outcome. Never "Decide on X" without the options and my recommendation in the action. | Open an Upwork account so the team can send 13 proposals | Decide on the Apple Developer account |
| action | 2–6 numbered steps, one per line ("1. …\n2. …"), with the exact button and menu names. A decision lists the options and the team's recommendation. | 1. Tap the button: it opens Upwork sign-up.\n2. Choose "I'm a freelancer".\n3. Sign up with dave@3shamrocks.com.\n4. Reply "done" in Chat. | Reply 'OK all', or 'OK' plus post numbers, or notes |
| link | Opens the exact page where the first step happens. | https://www.upwork.com/nx/signup/ | (none), or a home page |
| link_text | Names the destination. | Open Upwork sign-up | Open, Link, Do it |
| minutes | A real estimate. | 20 | (none) |
| why | One line: what it unlocks or earns. | Unlocks 13 proposals the team has queued. | (a paragraph) |

Never mention, in anything Dave reads: container or file paths, repo files, internal ids (t-…, ap-…, batch ids), table names, tool names, "arm", "QA", "staging".

The app shows only steps that have an action (and promotes to "Do this first" only steps that also have a link), so a step that breaks these rules is invisible. A project "you" line is shown as a step only when it starts with 🔴/🟠 and has you_link; otherwise write a task.

## Voice and Processes lines (J8NIX 11.4)
- Voice learned: `HH:MM — 🟢 Learned your voice from 14 samples and 29 edits. See it in Me → Your voice.` (real counts only; 0 samples = say "from your edits").
- Voice note acked, nothing learned yet: `HH:MM — 🟢 Got your 4 samples. Your voice rules show in Me → Your voice after tonight's run.`
- A sample held instructions: `HH:MM — 🟢 Skipped 1 sample that read like instructions. The rest are learned.` (never quote it).
- Process got: `HH:MM — 🟢 Process "<name>" started. Research comes next, in today's team run.`
- Plan ready: `HH:MM — 🟠 The plan for "<name>" is ready. Do: read it and tap OK to start — Drafts (3 min).` Nothing is sent from a plan.
- Running / results: `HH:MM — 🟢 "<name>" is running: 12 sent, 2 replies (LinkedIn inbox, 20 Nov).` · `HH:MM — 🟢 "<name>": too early. A 3 of 20 replied, B 5 of 20. Need 30 each.` · `HH:MM — 🟢 "<name>": B wins, 7 of 30 replied vs 2 of 30. The winning text waits for your OK as a template.`
- Turn on asked: `HH:MM — 🟢 Daily lead list is on.` or `HH:MM — 🟠 Daily lead list needs a connection. Do: <action> — <link> (<N> min).`
