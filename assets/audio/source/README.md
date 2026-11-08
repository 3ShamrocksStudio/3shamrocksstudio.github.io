# Audio provenance

All music and sound effects under `assets/audio/` (plus `th-site/assets/audio/` and `lab/chore-wars/audio/`) are original works by 3Shamrocks Studio.
They are synthesised from scratch by the Python scripts in this folder, using oscillators, envelopes and noise in numpy. No samples, loops or third-party audio are loaded.

- `synth.py`: shared synthesis primitives
- `cr_music.py`: "Court of Crowns" (Chore Royale theme)
- `th_music.py`: "Verdant Trail" (Trashure Hunters theme)
- `rk_music.py`: "Opening Gambit" (R&K theme)
- `sfx.py`: all sound effects (Chore Royale, Trashure Hunters, R&K)
- `studio_music.py`: "Three Leaf Drive" (3Shamrocks Studio homepage theme)
- `studio_sfx.py`: homepage cues (mosaic explode / reassemble, carousel swipe, CTA click)

Mastered to −16 LUFS, true peak under −1 dBTP, 72 s seamless loops. Generated 2026-11-05.

## Studio homepage (`assets/audio/studio/`), generated 2026-11-08
- "Three Leaf Drive": original synthwave / game-menu loop, 100 BPM, E minor, 32 bars = 76.8 s, seamless. Opens on the "three leaves" bell motif E-G-B. Mastered to -16.0 LUFS integrated, true peak -3.8 dBTP (ffmpeg ebur128).
- Files hold the loop plus its first second again; the player loops the window 0.5 s to 77.3 s, so codec padding never clicks.
- `studio-sfx.*`: one mono sprite of four cues, peaks -15 to -22 dBTP. Cue map is in `js/studio-sound.js`.
- Encode: `ffmpeg -i studio_theme.wav -c:a libopus -b:a 40k studio-theme.ogg`, `-c:a aac -b:a 56k studio-theme.m4a`; sprite: opus 40k / AAC 64k mono. Opus is the main file, AAC (m4a) the fallback for browsers without Opus.
- Run: `python3 studio_music.py && python3 studio_sfx.py` (needs numpy, scipy, pedalboard, pyloudnorm, soundfile; writes to /dev/shm/s3studio/out/).
- Note: `cr_music.py`, `th_music.py` and `rk_music.py` import a `score` helper that is not in this folder; the studio scripts need only `synth.py`.
