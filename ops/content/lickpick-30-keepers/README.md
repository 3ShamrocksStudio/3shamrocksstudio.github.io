# LickPick · 30 Keepers · reels 1–3 (12 Nov 2026)

**Status:** drafts only. Nothing has been posted, sent, committed or published, and nothing was spent.
LickPick is in staging and closed beta, and no reel says "launched" or "live".

## The three reels

All three are 1080×1920 at 30 fps. Video is H.264 High at CRF 16; audio is AAC 192k at 48 kHz, with faststart.

| Reel | File | Length | The one message |
|---|---|---|---|
| 01 · HOME | `ep01/lickpick-keeper-01-home-9x16.mp4` | 21.0 s | Every lick lives in the A minor pentatonic box, frets 5–8. A is on strings 6, 4 and 1. The 7-note lick runs high e f8 → D string f7 and lands on A: "it sounds finished." |
| 02 · BLUE | `ep02/lickpick-keeper-02-blue-9x16.mp4` | 22.6 s | Add Eb (A string f6, G string f8) and the box becomes the blues scale. The 11-note shuffle lick uses D-Eb-E, squeezes Eb on the G string, and lands on A. |
| 03 · FLIP | `ep03/lickpick-keeper-03-flip-9x16.mp4` | 21.0 s | Slide the same box 3 frets down (frets 2–5) and it becomes A major pentatonic (A B C# E F#). A moves to strings 6, 3 and 1. The 6-note lick lands on A at G string f2. |

**What every reel does:**
- Opens with the topic word slamming in at frame 0, with a guitar stab.
- The fretboard draws in and each note pops on screen as you hear it.
- Note chips, a caption line, then the lick plays with numbered dots and a path drawn through them.
- A KEEP stamp lands with the payoff line.
- An amp-strip wipe leads to the LickPick end card. It replays the lick on a waveform card, then shows "Comment LICK · Be a founding tester. Pro free for life." and tomorrow's teaser.

**Each episode folder also has:**
- `cover-1080x1920.png`: a lesson frame with the KEEP stamp. It also crops cleanly to a 3:4 grid tile.
- `caption.txt`
- `source/`: the page, `data.json` and the full pipeline.

## Music theory verification

- **`theory.py` is the single source of truth.** It maps string+fret → MIDI → note in EADGBE and asserts every diagram. It runs **220 checks: 220 PASS, 0 FAIL** (`verification/theory-log.txt`). It checks:
  - 17 landmark frets against a standard fret chart
  - every dot is in its scale
  - every scale tone inside the box is shown, with no gaps and no strays
  - the chips equal the scale, with the root first
  - the root strings and fret span in each caption
  - the scale runs ascend
  - every lick note is on the diagram and each lick ends on A
  - the blue notes are Eb
  - the major box is exactly the minor shape 3 frets lower
  - the minor intro in reel 3 is all A minor pentatonic, and the backing under it is Am; it switches to A major exactly at the slide
  - each lick, and its end-card replay, ends on A over an A chord
  - each end-card replay finishes before the file fades out
- **A second, independent check** (`verification/independent-check.txt`) uses a different method: it walks the chromatic scale up from each open string. It re-derived all **112 on-screen note labels: 0 problems.**
- **Picture and sound use the same `data.json`.** I also rendered the lick audio separately, detected its note onsets, and compared them with the dot times (`verification/sync-log.txt`). The worst offset is **20 ms**, under one frame (33 ms), in all three reels.

## Loudness

ffmpeg ebur128 on the final MP4s (`verification/loud-log.txt`):

| Reel | Integrated | True peak | LRA |
|---|---|---|---|
| 01 | −14.0 LUFS | −2.4 dBTP | 3.6 LU |
| 02 | −14.0 LUFS | −2.9 dBTP | 2.9 LU |
| 03 | −14.0 LUFS | −2.5 dBTP | 3.0 LU |

The target was a true peak below −1.5 dBTP. All three pass. Video and audio streams are the same length in every file: 21.000 / 22.600 / 21.000 s (630 / 678 / 630 frames).

**Audio content:**
- 100% original.
- The guitar is GeneralUser GS v2.0.3 (free for commercial use) via tinysoundfont. Reels 1 and 3 use clean guitar; reel 2 uses light overdrive.
- The groove underneath is soft drums, finger bass, electric piano and pad. It ducks slightly while the lick plays.

## QA

- `qa-frames-ep01.jpg`, `-ep02.jpg` and `-ep03.jpg` show frames at 0/25/50/75/100%. I looked at each one.
- **Fixed during QA:**
  - The KEEP stamp covered the payoff text; I moved it to the empty side of the board.
  - In reel 3, the box label overlapped the slide arrow, and the fret highlight was wrong during the slide.
  - Frame 0 showed the word half off-screen.
  - Reel 3's teaser was a placeholder.
  - Reel 3's true peak was −1.5 dBTP; I lowered the limiter ceiling.
- Key text sits between y 262 and 1500. The studio credit is at 1540.
- I used no app screenshots. There was no way to confirm `assets/m_*.jpg` show the current build, so the end card uses the product's own card design (stamp + waveform) instead.

## NEEDS YOUR EYES

1. **IG account:** the only LickPick handle in the repo is **@lickpick.app**, from the drafts in `ops/ig-drafts/2026-11-12`. Please confirm it exists and is logged in, and that it is a Business or Creator account.
2. **"Comment LICK" needs comment-to-DM set up first** (the Meta Business Suite setup noted in `marketing-status-1112.md`). Without it, every comment needs a manual reply with the personal link.
3. **New public claims:** "Pro free for life" and "20 founding testers" are copied from `lickpick/beta.html`. That page is staging and has not been made public, so these need your OK before posting.
4. **Posting slot:** 13:30 New York / 20:30 Israel daily is a best-practice suggestion, not measured data. Re-check it against the account's Insights after 2 weeks.

## Rebuild

```
cd ep01/source/pipeline
./build.sh                       # theory checks, then writes data.js / data.json
python3 mix.py <ep>/data.json audio.wav GeneralUser.sf2
node render.js <ep>/src/index.html 21 video.mp4
```

Then mux with ffmpeg (`-c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart`).

`build.sh` expects the folder layout used in the scratchpad: a `shared/` folder holding these scripts, the page template `reel.html`, the fonts and the logos, with `<ep>/` folders next to it.

---

# Reels 4–6 (14 Nov 2026)

**Status:** drafts only. Nothing posted or sent, nothing spent. Same pipeline, brand and specs as reels 1–3.

| Reel | File | Length | The one message |
|---|---|---|---|
| 04 · BEND | `ep04/lickpick-keeper-04-bend-9x16.mp4` | 22.4 s | Bend G string fret 7 (D) a whole step to E. Check it against B string fret 5 (the same E). You hear a flat bend (red, 50 cents short), then an in-tune one (cyan, hits the ghost dot at fret 9). The lick bends D to E and lands on A. |
| 05 · ASK | `ep05/lickpick-keeper-05-ask-9x16.mp4` | 22.9 s | Call and response in the HOME box. A one-bar question ends on E (cyan); the next bar answers and ends on A (yellow). The badges renumber for each phrase. |
| 06 · TWIN | `ep06/lickpick-keeper-06-twin-9x16.mp4` | 19.2 s | The octave shape: string 6 fret 5 to string 4 fret 7, and string 5 fret 12 to string 3 fret 14. The caption adds the B string exception (3 frets). |

**Checks:**
- `theory.py` runs 415 checks, all PASS (`verification/theory-log-ep01-06.txt`). New checks cover bend targets, the flat bend being off pitch, unison and octave links, octave shapes, question/answer bars and wording.
- Bends are measured in the rendered audio (`verification/bend-log-ep04.txt`). Flat bend: −49 cents. In-tune bends: within 2 cents of the fretted E.
- Audio vs dots (`verification/sync-log-ep04-06.txt`): worst offset 20 ms, under one frame.
- Loudness (`verification/loud-log-ep04-06.txt`): −14.0 LUFS on all three. True peak −2.9 / −2.7 / −2.8 dBTP. Video and audio streams are the same length: 22.4 / 22.9 / 19.2 s.
- The upgraded template renders reels 1–3 pixel-identical, and their audio is sample-identical.

**Wording:**
- Ep 4's tie-in uses the landing page's own words: "scores every phrase for clean, confident playing and cuts the flubs". The plan's "a flat bend gets cut" is not stated on the pages, so I did not claim it.
- Ep 5's lick card says "a complete phrase, bar to bar", from landing step 2.

**NEEDS YOUR EYES:** the same 4 items as above (account, comment-to-DM, the "Pro free for life" claim, posting slot) still apply before anything goes out.

---

# Reels 7–8 (14 Nov 2026)

**Status:** drafts only. Nothing posted or sent, nothing spent. Same pipeline, brand and specs as reels 1–6. Finished files: `ops/content/2026-11-14/lickpick-ep07/` and `lickpick-ep08/` (mp4, cover, caption).

| Reel | File | Length | The one message |
|---|---|---|---|
| 07 · NEXT | `lickpick-keeper-07-next-9x16.mp4` | 22.0 s | Box 2 of A minor pentatonic, frets 7–10, next to the HOME box. The two boxes share 6 notes on frets 7–8 (cyan). A is on the D string f7 and the B string f10. The 8-note lick runs high e f10 down to D string f7 and lands on A. |
| 08 · SLIDE | `lickpick-keeper-08-slide-9x16.mp4` | 22.0 s | Slide the G string from f7 (D) to f9 (E) to cross from box 1 into box 2 mid-lick. The 7-note lick starts on A (D string f7) and lands on A an octave up (B string f10). |

**Checks:** `theory.py` runs 654 checks, all PASS. Sync: worst offset 20 ms (ep07) and 18 ms (ep08). Slides measured in the rendered audio (`bend_check.py`): −1 cent from the fretted E. Loudness −14.0 LUFS on both; true peak −2.1 / −2.7 dBTP. The ep08 lick card uses the landing page's "two runners-up".

**NEEDS YOUR EYES:** the same 4 items as above still apply before anything goes out.
