# Audio provenance

All music and sound effects under `assets/audio/` (plus `th-site/assets/audio/` and `lab/chore-wars/audio/`) are original works by 3Shamrocks Studio.
They are synthesised from scratch by the Python scripts in this folder, using oscillators, envelopes and noise in numpy. No samples, loops or third-party audio are loaded.

- `synth.py`: shared synthesis primitives
- `cr_music.py`: "Court of Crowns" (Chore Royale theme)
- `th_music.py`: "Verdant Trail" (Trashure Hunters theme)
- `rk_music.py`: "Opening Gambit" (R&K theme)
- `sfx.py`: all sound effects (Chore Royale, Trashure Hunters, R&K)
- `studio_music.py`: "Three Leaf Drive" (original 76.8 s studio theme; superseded on the site by the family below)
- `studio_family.py`: the "Three Leaf Drive" family: 5 homepage stems + one loop per product page
- `studio_sfx.py`: homepage cues (mosaic explode / reassemble, carousel swipe, CTA click)

Mastered to −16 LUFS, true peak under −1 dBTP, 72 s seamless loops. Generated 2026-11-05.

## Studio homepage (`assets/audio/studio/`), generated 2026-11-08
- "Three Leaf Drive": original synthwave / game-menu loop, 100 BPM, E minor, 32 bars = 76.8 s, seamless. Opens on the "three leaves" bell motif E-G-B. Mastered to -16.0 LUFS integrated, true peak -3.8 dBTP (ffmpeg ebur128).
- Files hold the loop plus its first second again; the player loops the window 0.5 s to 77.3 s, so codec padding never clicks.
- `studio-sfx.*`: one mono sprite of four cues, peaks -15 to -22 dBTP. Cue map is in `js/studio-sound.js`.
- Encode: `ffmpeg -i studio_theme.wav -c:a libopus -b:a 40k studio-theme.ogg`, `-c:a aac -b:a 56k studio-theme.m4a`; sprite: opus 40k / AAC 64k mono. Opus is the main file, AAC (m4a) the fallback for browsers without Opus.
- Run: `python3 studio_music.py && python3 studio_sfx.py` (needs numpy, scipy, pedalboard, pyloudnorm, soundfile; writes to /dev/shm/s3studio/out/).
- Note: `cr_music.py`, `th_music.py` and `rk_music.py` import a `score` helper that is not in this folder; the studio scripts need only `synth.py`.

## Adaptive score: the "Three Leaf Drive" family (`studio_family.py`), generated 2026-11-08
Shared DNA: the three-leaf bell motif (root, third, fifth), the same synth palette, minor-ninth / major-seventh harmony.
- Homepage (`assets/audio/studio/home-*.ogg|m4a`): 16 bars, 100 BPM, E minor, 38.4 s seamless. One bed (pad, sub, motif) plus four layers (arp, pulse = saw bass/kick/hats, keys, lead = melody/snare).
  Section mixes: hero = bed+arp; products = +pulse; brands = +keys; HealthTech = bed+keys, softer arp/pulse; mosaic = all, lead at half; contact = everything.
  Each section mix carries a loudness makeup so every section measures -16.0 LUFS, true peak -2.5 to -4.0 dBTP (ffmpeg amix + ebur128 on the encoded stems).
- Product pages (`assets/audio/studio/pages/<page>.ogg|m4a`), each -16 LUFS (+/-0.1), true peak -3.2 to -5.0 dBTP:
  shomer 84 BPM D major, calm; lickpick 116 BPM A minor, four-on-the-floor; trashure-hunters 104 BPM D minor, marimba + frame drums + flute;
  chore-royale 112 BPM C major, pizzicato + woodblock + fanfare; fairent 92 BPM F major, electric piano; j8nix 96 BPM F minor, dark pulse;
  healthtech 88 BPM G major, warm keys + heartbeat kick; ezra 80 BPM E minor, pads and bells; milo 76 BPM C major, music box + kalimba, no drums;
  rk 92 BPM A minor, keys + soft chess-clock tick.
- Encode: stems `libopus -b:a 32k -vbr off` + `aac -b:a 40k`; pages `libopus -b:a 34k -vbr off` + `aac -b:a 44k`. Files hold the loop plus its first second; the player loops 0.5 s to 0.5 s + loop.
- Player: `assets/audio/s3-score.js` (stems start in sync and crossfade with equal power over 2 s once scrolling settles for 0.8 s).
