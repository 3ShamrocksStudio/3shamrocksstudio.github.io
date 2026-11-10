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

## Score v2: "The Three Leaf Theme" game-world score (`score_v2.py`, `studio_sfx_v2.py`), generated 2026-11-08
Supersedes the stem score above on the site. One 8-bar theme (bar 1 climbs root-third-fifth, a note per shamrock leaf) recurs in every zone,
re-orchestrated; each zone is 16 bars: A = theme with countermelody, B = the motif sequenced over a new progression with a run back into A.
Harmony uses borrowed chords (iv, bVII, bVI) and a different key per zone. Instruments, all synthesised: FM celesta, glockenspiel, music box,
Karplus-Strong harp / pizzicato / guitar, a heroic two-saw synth lead, flute (filtered saw + breath + vibrato), detuned string pads, saw and
round basses, marimba, brass stabs, punchy kick / gated snare / toms / hats / tambourine / crash. Kick-keyed sidechain on pads, humanised
timing and velocity, convolution reverb and tempo-synced delays. Each part is balanced to a loudness role, then mastered.
- Homepage zones (`assets/audio/studio/v2/`): hero D major 124 BPM overworld; work G major 132 level select; identity Bb major 116 playful;
  experience Eb major 92 warm; about A minor 108 curious; forest Ab major 96 enchanted (celesta, harp triplets, epic toms); contact E major 128 level complete.
- Product themes (also the carousel themes): shomer D 92, lickpick A minor 124, trashure-hunters D minor 112, chore-royale C 128, fairent F 100,
  concepts B minor 108, j8nix F minor 104, healthtech G 92, ezra E minor 88, milo C 78 (no drums, soft), rk A minor 96.
- Every loop is -16 LUFS; encoded true peak at most -1.5 dBTP (loops whose Opus encode overshot were re-mastered with a lower ceiling).
- Files: last 0.5 s of the loop + loop + first 0.5 s; the player loops 0.5 s .. 0.5 s + loop and starts zones at 0.5 s (phrase start).
- Encode: `libopus -b:a 32k -vbr off` and `aac -b:a 40k`; sprite `sfx` Opus 48k / AAC 64k mono.
- SFX: product arrivals (radar ping, guitar stab, treasure jingle, arena horn, ka-ching, sci-fi shimmer, each <= 0.4 s), coin, level complete,
  sparkle, mosaic explode / assemble, CTA click.
- Run: `python3 score_v2.py home pages && python3 studio_sfx_v2.py && python3 score_v2.py demo`.

## Score v3: "Three Leaves" (`score_v3.py`), generated 2026-11-09
Supersedes Score v2 on the homepage (product pages still use the v2 files). Unlike everything above, v3 uses sampled instruments:
the GeneralUser GS SoundFont v2.0.3 by S. Christian Collins (licence: free use in music, private or commercial; https://schristiancollins.com),
rendered offline with tinysoundfont and mixed/mastered with pedalboard. The music itself (melody, harmony, arrangement) is original.
- One song for the whole page: 100 BPM, D dorian, 16 bars = 38.4 s. Signature: three rising "leaves" D-E-F, then the leap to A.
  Harmony Dm C G Dm | Dm C G A | F C G Dm | Bb C G A (the G major is the dorian, Celtic colour).
- Stems, all the same length and sample-aligned: drums, bass, keys, pulse, texture, lift (stereo) + melody stems (mono):
  mel-theme (flute + harp) and one per product: shomer (French horns, bar 4 resolves to D), lickpick (clean guitar, hammer-ons,
  ends on E), trashure-hunters (ocarina, trills, bar 12 climbs to A), chore-royale (pizzicato + glockenspiel, dotted leaves,
  ends on high C#), fairent (vibraphone, bar 8 lands on E), concepts (fiddle with cuts and rolls, bar 4 ends on F).
- Zones change only the mix (gains in `js/studio-sound.js`, written by the script to mix.json). Measured with ffmpeg ebur128 on the
  encoded stems: hero -16.0, work -16.3 to -16.5, identity -17.0, experience -17.6, about -17.0, forest -19.2, contact -15.3 LUFS;
  true peak -2.0 dBTP or lower everywhere.
- Files: last 0.5 s of the loop + loop + first 0.5 s; the player loops 0.5 .. 38.9 s on one shared clock.
- Encode: beds Opus 64k / AAC 112k stereo, melodies Opus 40k / AAC 64k mono.
- Run: `python3 score_v3.py` (render + master + encode), then `python3 score_v3.py demo` (70 s walk-through MP3).

## Score v6: "the long jam" (`score_v6.py`), generated 2026-11-10
Supersedes Score v5 (`score_v5.py`, 98 BPM E dorian funk jam, 16-bar stems) on the homepage and product pages. Same SoundFont,
same instruments and mix chains (it imports `score_v5.py`).
- Opening untouched: bars 1-16 of each v5 bed are the v5 notes (captured from `score_v5.py` with its seed), level-matched to
  the v5 files; the intro fill is the v5 file.
- Every bed continues with new variation bars and loops at its own length (drums 32, bass 40, guitar 24, keys 40, organ 24,
  horns 40 bars; all multiples of the 8-bar progression). The player reads `stems.loops` and keeps them on one clock.
- New portfolio lead: tenor sax call / muted jazz guitar answer, 32 bars, laid back, low-passed ~4.5 kHz and de-essed;
  products: same hook, own warm voice (French horn, wah guitar, baritone sax, organ, Rhodes, vibes, muted trumpet) + own endings.
- New deep-page stems: `bdrums` (ride groove), `bbass` (sub bass), `bkeys` (dark Rhodes + organ), `bhorn` (low trombone /
  baritone noir melody) on the bridge Em11 Fmaj7#11 Em11 Fmaj7#11 | Cmaj9 Am11 F#m7b5 B7#9; `shout` (horn shout chorus outro).
- Story: hero drums, +bass, +guitar, +keys/organ, +horns, portfolio + lead, identity = breakdown (drums + bass),
  experience = dark bridge, about = + horn melody, forest = no drums, contact = everything + horn shout.
- Encode: beds Opus 48k (drums 56k) / AAC 80k (drums 96k) stereo, melodies Opus 40k / AAC 56k mono.
- Run: `python3 score_v6.py all` (stems + mix.json in `assets/audio/studio/v6/`, demo MP3); `S3_REBUILD=mel,bkeys` re-renders only those.
