# J8NIX 2.0 usability pass (d-1125-06, 15.6.0, 25 Nov 2026)

How it was checked: scripts opened every space, opened every row, then clicked each control on a fresh page at 375 px and 1280 px, in English and Hebrew. Supabase was mocked with real rows, plus test rows for the kinds today's data lacks (batch, by-hand item, steps, replied item, long draft, checker block, run with proof link). Each click recorded page errors, database writes, the toast and the screen change. An independent verifier ran 153 checks per run (375 and 1280, EN and HE) and repeated them on the parent commit: no errors and no sideways scrolling. 151 of 153 checks passed in each run; the 2 others are the Undo after a Stop in Going out (works as described below) and a too-strict test pattern for the Old J8NIX link. The only differences from the parent commit are the intended ones. The Guide (guided start, tour, help, added in 15.4.0 by a parallel run) was clicked through separately.

Works = the click does what its label says. Dup = another control on the same screen does the same job.

## Every screen and control

| Screen | Control | Works | Dup | Purpose (one line) |
|---|---|---|---|---|
| All | Tabs Today, Queue, Engines, Score, Talk, Agents, Settings (keys 1 to 7) | yes | no | Move between spaces. |
| All | Live / Offline pill | yes (status only) | no | Shows if J8NIX is connected. |
| All | Couldn't load. Tap to retry (Today, Queue, Engines, Score, Agents) | yes | no | Load again after a failed load. |
| All | Toast Undo (6 s) | yes | no | Takes back the last decision. After a Stop in Going out, Undo puts the item back in Waiting for you, so it needs a new Go. |
| Today | Card: Go (G) | yes | no | Approve the top item. |
| Today | Card: Go on a checker block (2 taps: "Tap again: send anyway") | yes | no | Approve despite a hard checker flag. |
| Today | Card: Hold (H, or swipe) | yes | no | Put it aside for this session. |
| Today | Card: Stop (X, 2 taps) | yes | no | Make sure it is never sent. |
| Today | Card: Change (E), then Save and send (Ctrl+Enter) or Cancel (Esc) | yes | no | Edit the text before it goes. |
| Today | Card: Read all | yes | no | Show the full text. |
| Today | Batch: Go all (G), Read all | yes | no | Approve many drafts of the same kind after reading 3. |
| Today | Design: option tiles, See it full size, Go with name (G), None of these (X, 2 taps) | yes | no | Pick one design option and approve it. |
| Today | By hand: Copy & open (G), Mark sent (2 taps) | yes | no | Send a by-hand item, then record it. |
| Today | Step: Done (G, 2 taps), Open | yes | no | Finish a step, or open its link. |
| Today | Reply card: Call, Proposal, Won, Lost | yes | no | Record what happened after a reply. |
| Today | Bring back held | yes | no | Return all held items to the deck. |
| Today | Up next list | yes (read only) | no | The next items, in order. |
| Queue | Waiting rows (open/close), with the same card controls as Today except Hold and key hints | yes | by design | The full list; Today shows one at a time. |
| Queue | Going out: Stop (2 taps) | yes | no | Stop an approved item before it goes. |
| Queue | Did they answer?: Replied, Call, Proposal, Won, Lost (tap again clears) | yes | no | Record outcomes on sent items. |
| Engines | 7 days / 30 days | yes | shared with Score on purpose | Time window. |
| Engines | Engine rows (open/close), See what waits, Resting (fold) | yes | no | One number per engine; jump to its waiting items. |
| Score | 7 days / 30 days, more engines (fold) | yes | no | Drafted to paid, by engine, money booked. |
| Talk | Message box, Send (Ctrl+Enter) | yes | no | Ask J8 or the team. |
| Agents | Agent rows (open/close) | yes | no | What it does, when, last run. |
| Agents | Switch (Undo) | yes | no | Turn an agent on or off. |
| Agents | All / Problems only, run rows, Show more, Open proof | yes | no | What ran in the last 7 days. |
| Settings | Pause sending / Resume sending (2 taps each) | yes | no | Stop or restart everything going out. |
| Settings | Autopilot per saved message: Ask me / Auto after 6 h (2 taps) / Off | yes | no | How each saved message is sent. |
| Settings | Language English / עברית, Sound On / Off | yes | no | Language and direction; decision sounds. |
| Settings | Old J8NIX: Open | yes | no | The 14.1 app at /j8/classic/. |
| Settings | Refresh, Sign out | yes | no | Reload all data now; sign out. |
| Settings | Guide: Set up again, Show me around, Show hints again, Help lines on screens | yes | Show me around also ends the guided start, on purpose | Replay the guided start or the tour, and manage help lines. |
| Guided start (first open) | Role, goal and channel choices; Next / Finish; Back; Skip this; Skip setup | yes | no | Who you are, your goal, your channels, in 3 short steps. |
| Guided start, last screen | Show me around, Start working, Ask the team to set up a channel | yes | no | Take the tour, start, or ask for a channel to be connected. |
| Tour (4 stops) | Next, Back, End tour | yes | no | One line about each space, where it is. |
| Every space | How it works (folds to ?) and Hide | yes | no | What, how and when for that space; Hide stops it showing. |

## Fixed in 15.6.0

1. One action had three names. Stop, Kill and None of these all set the item to killed. Kill is now Stop everywhere. None of these stays on design choices only, and its toast says "None chosen."
2. In Hebrew, Kill and Undo were the same word (בטל). Stop is now עצור; Undo stays בטל.
3. In Hebrew, the Talk tab and the Call outcome were the same word (שיחה). The tab is now הודעות.
4. "Hold" meant two things. The send delay on Going-out rows now reads "Goes at 14:30" (יוצא ב־14:30). The Hold button keeps its name; in Hebrew it is now אחר כך, because דחה can read as "reject".
5. Toasts that did not say what happened: Refresh said "Saved" (now "Up to date."), Talk Send said "Saved" (now "Sent to J8."), and Copy & open with no text said "Open" (now "Opened.").
6. Sent rows with no name showed just "email". They now show the address they went to.
7. Colour: the second tap on a safe action (Done, Mark sent, Resume sending) turned red. It is now navy. Red is kept for Stop, None of these, Pause, Auto after 6 h and the checker-block send. The design and step chips are now amber (waits for you), and the Running agent glyph is blue (moving).
8. Status emoji (🟢 🟠) in Talk replies are removed, as on Agents. The two long-dash placeholders are replaced with "…".
9. A by-hand item with no text says Open, not Copy & open.
10. Help tips (from the 15.4.0 Guide) used the amber "waits for you" background. A tip waits for nothing, so it is now neutral grey.
11. The Guide's help and tour text (from 15.4.0) now uses the same words as the buttons: Stop (עצור) in the Queue help, אחר כך for Hold, הודעות for the Talk tab, בטל only for Undo. The tour counter reads "1 of 4", not "Stop 1 of 4", so Stop has one meaning. English says "help lines" everywhere (it said "hints" in some places).

## Colour meaning map (in j20w.css, noted at the top of the file)

| Colour | Meaning | Where |
|---|---|---|
| Navy fill on a button #0C1030 | Your decision | Go, Send, selected states, second tap on a safe action |
| Ink on text, bars and ticks | Plain data | Big count, tab badge, funnel bars, run ticks |
| Amber #8A5300 on #FFF0D2 | Waits for you | Card chips on Today (to approve, batch, step, by hand, design), Engines "N wait for you" |
| Blue #1D4ED8 | Moving, good news, links, focus | Replied chip, Engines "Moving", agent OK and Running, links, focus ring, Live dot |
| Red #A3162A on #FDE4E8 | Stop, risk, failed, blocked | Stop, None of these, second tap on Stop / Pause / Auto after 6 h / checker-block send, checker warnings, failed runs, sending-problem pill |
| Grey #565E80 | Quiet, off, no data, help | Help tips, Offline pill, Off agents, Quiet engines, Not counted yet, kind words in Queue rows |
| Tab tints | Name the space only | Tabs and folder |

Money has no colour: the number speaks. Every pair meets WCAG AA; the lowest is 5.61:1 (blue chip).

## NEEDS YOUR EYES (palette, not changed: rule 4)

- The tab tints sit in the same colour families as the meaning colours: Queue #FFDCD5 and Agents #F8DCEB are close to the red background, Engines #FFEDC2 is close to amber and Today #D6E6FF is close to blue. The eye may read the Queue as "risk". Changing the tab palette is a redesign, so it waits for Dave's OK.
- Each engine's stripe colour comes from j8_projects as any colour. A red or amber engine colour would read as risk or "waits". The fix is to limit stripes to neutral hues; this also waits for Dave's OK.

## Left as is, on purpose

- Queue repeats Today's cards: Today is one at a time; Queue is the full list for scanning.
- The 7 / 30 day switch appears on Engines and Score: it is one shared setting, shown where the numbers are.
- Talk Send with an empty box does nothing (there is nothing to send).
- Settings rows name the thing, and the button repeats it (Refresh, Sign out). Small, and it keeps every row the same shape.
