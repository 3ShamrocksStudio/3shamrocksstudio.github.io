# 30 Keepers reels: brand notes

What the reels use, and where each piece comes from. All paths are in the `3shamrocksstudio.github.io` repo (last LickPick commit `c9ede62`, 11 Nov 2026) unless marked otherwise.

## Where "3SDS" lives

- The repo has `DS-COMPLIANCE-SNAPSHOT.md` (the 3SDS v3.0 checklist). Its rule §3 says a product's brand is "the product's own palette mapped onto the semantic roles, plus its own logo and its type, corner and motion settings. It is not the house look." Its rule §5 says to use the real logo only and to keep the studio credit quiet.
- The written LickPick design system is in `/mnt/user-data/outputs/ds/lickpick.md` (v1.0, 2 Nov). The studio index is `/mnt/user-data/outputs/ds/index.md`. The repo has no `brand/` folder. `assets/brand/lickpick/` holds only old screen JPGs.
- I re-checked every token against the live code, which is newer than the 2 Nov doc. They all still match.

So the reels follow 3SDS by doing what it asks for: they use LickPick's own tokens, logo and voice, not the purple-and-green studio look.

## Tokens used (copied 1:1)

| Token | Value | Source | Used for in the reels |
|---|---|---|---|
| `--stage` | `#0B0912` | `lickpick/app/index.html` l.21, `lickpick/index.html` l.11 | flat background. No gradient and no glow. |
| `--panel` / `--raise` / `--line` | `#15111F` / `#1E1830` / `#332A4A` | same lines | fretboard, note chips (ghost-button style), end-card lick card, outline episode number |
| `--text` / `--dim` / `--mute` | `#FFF7F0` / `#C9BEDB` / `#8F83B3` | app l.22 | note discs, strings, captions, fret and string labels |
| `--ink` | `#07060B` | app l.22 | all outlines, text on volt, hard shadows |
| `--volt` | `#FFE600` | app l.23 | display word, root picks, KEEP stamp, CTA button, box outline |
| `--hot` | `#FF2E88` | app l.23 | hard offset shadows, lick path, hit rings, slide arrow |
| `--cyan` | `#2BE7FF` | app l.23 | the blue note (ep02), waveform, Beta tag |
| `--blaze` | `#B47CFF` | app l.23 | only in the amp strip |
| `--amp` | hot / blaze / volt / cyan in hard bands | app l.25, landing `.amp` l.26 | the top strip and the scene-change wipe (the same four bands at full screen) |
| `--keep` | `var(--volt)` | app l.24 | KEEP stamp |
| Display font | **Dela Gothic One** | `@font-face` embedded in `lickpick/index.html` l.10 (base64, copied as-is into `src/fonts.css`) | HOME / BLUE / FLIP, chips, kicker and payoff lines, wordmark, CTA |
| Body font | **Archivo** 600–800 | same line | header, hook, labels, captions. No monospace anywhere. |

## Components and motifs from the product

- **Logo:** `lickpick/app/icon-512-v5.png`, the transparent PNG pick (volt pick, ink play triangle, hot offset). I used the PNG, not the SVG. It is shown rotated −8°, the same as `.brand svg{transform:rotate(-8deg)}` on landing l.32.
- **Wordmark:** "Lick**Pick**™" with "Pick" in volt, plus a cyan Beta tag. Sources: landing `.word` l.33, `.word .tm` l.212, `.betatag` l.216.
- **Root notes drawn as the LickPick pick:** the `#pk` path from landing l.221, styled like the logo symbol (`#logo` l.222: volt fill, 4px ink stroke, hot copy offset 7/5). The home note is literally the logo.
- **KEEP stamp:** a tilted volt pick with an ink check mark, plus the word, which follows the colour + icon + word rule. Sources: app `.stamp` l.115–117 (pick in `--keep`, rotated −8°), `#pickClip` landing l.220, `#i-check` path landing l.223.
- **Sticker look:** hard offset shadows with no blur, 3–4px ink borders, slight rotations. Sources: landing `.btn` l.36 (`box-shadow:5px 5px 0 var(--hot)`), `.btn.ghost` l.39, and the "whatsnew" icon tiles l.208.
- **End-card lick card:** copies the product's own lick card. Panel background, keep-tinted border `#4D460F` (app `.card.v-keep` l.112), a stamp, "Lick A · home · 3.4 s" (the lick's true length), "**Best** · your Lick A, the strongest phrase" (the app's top grade and its own wording: `TIERS` l.7005 and l.7014 in `app/index.html`), and a cyan waveform (DS §7 "Lick card: waveform in cyan"). The waveform is drawn from the lick's real note times and plays in sync with the audio replay.
- **Studio credit:** `lickpick/assets/3shamrocks.png` at 22px and 60% opacity, one centred line (the quiet credit from DS-COMPLIANCE §5).

## Voice

- I always say "licks", never "takes" (Dave's rule). The app and landing word "jams" appears in "your jams stay on your phone".
- Every claim is copied from `lickpick/beta.html` or `lickpick/index.html`:
  - "Comment LICK" (beta l.81)
  - "Pro free, for life" for founding testers (beta "What you get")
  - "Android + Chrome" (beta and FAQ)
  - "your jams never leave your phone" (landing hero)
  - "LickPick picks your best lick"
- I never say "launched" or "live". The end card says "Free beta".

## What I did not take from the reference (guitar_mentor_in)

I kept its format: a numbered series, one huge word, a fretboard that draws itself in, note chips, a technical caption line and big background type. I did not reuse its look:

| Reference | These reels |
|---|---|
| Purple and pink blur gradient | Flat stage with film grain |
| Monospace letter-spaced labels | Archivo 800 |
| Grey text with an italic serif accent | Volt Dela Gothic with a hard hot shadow |
| Blank dots | Every note named on its dot |
| Coloured outline boxes | One volt box |
| Roots shown as pink dots | Roots shown as LickPick picks |
| Filled faded background letters | An outlined episode number |

The reels also add things the reference does not have: a numbered lick path that is played back with sound, and a KEEP stamp at the payoff.

## NEEDS YOUR EYES

- Done 14 Nov: the written DS (`outputs/ds/lickpick.md`) now uses "licks" throughout ("finds your best lick", "Lick card"), matching your rule.
