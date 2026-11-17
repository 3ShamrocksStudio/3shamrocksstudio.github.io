# Instagram pre-post audit gate (v1, 17 Nov 2026)
Why: on 16 Nov the @3shamrocks.studio carousel went out as website screenshots in phone mockups, with "Tap anywhere for sound" visible, labels cut at the top edge and an avatar pulling odd faces. All accounts also shared one look. This gate stops that.

**Rule.** No slide, story or reel posts on any account until BOTH halves PASS for that exact file:
1. **Machine:** `python3 ops/tools/ig_audit.py <post folder or reel.mp4> --account <handle>` → `_audit/report.md` says PASS.
2. **Blind reviewer:** a separate reviewer agent that did not make the post (fresh context, sonnet) opens `_audit/contact-sheet.jpg` (or `*-frames.jpg`, every 0.5 s), every full-size slide, the account's `BIBLE.md` and this checklist, and answers every line below PASS/FAIL with the slide or second. Any FAIL = fix, re-run both halves. Two failed fix rounds on the same issue = stop and ask Dave.
The verdicts are saved next to the post as `_audit/report.md` + `REVIEW.md`. Dave's own review of reels (BRAIN §−6.L, 14 Nov) still applies on top.

## Checklist (every slide, every reel frame)
| # | Check | Pass when |
|---|---|---|
| 1 | Faces and expressions | No odd, warped or uncanny faces; no extra fingers or melted hands; no real face of Dave unless he approved that file; LickPick shows hands and guitar only; no faces of minors (Trashure Hunters). |
| 2 | Safe zones | 9:16: all text inside x 60–1020, y 250–1500 (IG UI covers the rest). 4:5: inside x 60–1020, y 100–1240 (the slide counter and tags sit outside). Nothing clipped at any edge. |
| 3 | Leftover UI or debug | No status bars, "9:41", "Tap anywhere for sound", cursors, browser chrome, placeholder or debug text, empty states, cookie banners. |
| 4 | Duplicates | No two slides the same or nearly the same (machine: pHash ≤ 6); no reel shot repeated by accident. |
| 5 | Spelling and language | SH✡MER always with the ✡ in text; LickPick says **licks**, never "takes"; Hebrew is RTL, punctuation and numbers sit right, quotes wrap correctly; captions spell-checked. |
| 6 | Legibility at phone size | Read the contact sheet at 270 px wide: headline readable, body ≥ 28 px on 1080, contrast ≥ 4.5:1. |
| 7 | Brand compliance | Only that account's colours, type, icons, logo and motion from its BIBLE.md; nothing from another account's look; media accounts carry no 3Shamrocks link. |
| 8 | One message | The post makes one point; a stranger can say it in one sentence after 3 seconds. |
| 9 | CTA | Exactly one CTA, in the account's CTA style, true today (availability, price, links checked on the live site the same day). No prices in first-touch posts for the studio. |
| 10 | Truth and AI label | Every claim and number traces to a source file or is labelled "example"; realistic AI people or scenes carry the on-image AI chip and the IG "AI info" label; AI voices say so on screen. |

## Sound checks (every reel and story with audio)
| # | Check | Pass when |
|---|---|---|
| S1 | Loudness | Integrated −14 LUFS ±1 (machine: ffmpeg ebur128). |
| S2 | Peaks and clipping | True peak ≤ −1 dBTP; no clipped samples; no clicks at cuts. |
| S3 | Licence | Every sound is original, from the account's named sting, from GeneralUser GS v2.0.3 samples, or from a source whose licence is saved next to the post (Pixabay Music, YouTube Audio Library "no attribution"). No copyrighted songs, no "trending audio" we don't own. |
| S4 | Voice match | Voice-over matches the bible's speech line (language, gender/age range, accent, pace); AI voices labelled; Hebrew VO is native-sounding. |
| S5 | Fit | Music genre and tempo inside the bible's range; the sting or sonic logo is the account's own, not another account's. |

## Reviewer output (REVIEW.md)
`Verdict: PASS | FAIL` then 15 lines `#n PASS/FAIL – evidence (slide/second)`, then "Fixes needed". The reviewer never edits the post.
