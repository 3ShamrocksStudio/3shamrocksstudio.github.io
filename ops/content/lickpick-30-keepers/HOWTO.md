# How to render a 30 Keepers episode

Sources only live here (no videos, covers or frames). The newest pipeline is `ep08/source/pipeline/`.
It renders episodes 1–8; episodes 1–3 come out pixel- and sample-identical to the approved files, and 4–6 match the ep06 pipeline pixel- and sample-identically.

## 1. Tools

- Python 3 with `numpy scipy soundfile pyloudnorm tinysoundfont pedalboard Pillow`
- Node with `playwright` (Chromium installed: `npx playwright install chromium`)
- `ffmpeg`
- The soundfont **GeneralUser GS v2.0.3** (free for commercial use, by S. Christian Collins). It is 32 MB, so it is not in the repo. Save it as `gu.sf2` anywhere and pass its path below.

## 2. Set up a work folder

```bash
R=ops/content/lickpick-30-keepers
W=/tmp/lp-reels; mkdir -p $W/shared
cp $R/ep08/source/pipeline/* $W/shared/
cp $R/ep08/source/{fonts.css,lp-logo.png,3shamrocks.png} $W/shared/
mv $W/shared/build.sh $W/
```

## 3. Add the episode

1. Add a `dict(...)` to `EPS` in `shared/theory.py` (copy the closest episode). Everything the picture and the audio use comes from here: dots, box, lick (string, fret, beat, length), phases (in beats), chords, caption, payoff, teaser.
2. Add the episode id to the `for e in ...` loop in `build.sh`.
3. Run `./build.sh`. It checks every fret and note in standard tuning (EADGBE). One wrong note stops the build.

Optional layers (all checked by `theory.py`): `ghost` + `bends` (pitch bends, ep04), `hits` (notes that ring and play in the lesson), `links` (unison/octave lines), `marks` (recolour dots), `status` (cue line above the board), lick option `{'ph': 0/1}` (question/answer, ep05), `shapes` (octave shapes, ep06), `boxes` (two box outlines on one board, ep07–08), `run_notes` with a 4th group number (each group rises on its own), lick option `{'slide': 2, 'up': .35}` and `bends` kind `'slide'` (fret-by-fret slides, ep08), `stamp_xy`, `card_sub`, `gprog` (guitar sound: 27 clean, 29 overdrive).

## 4. Render

```bash
cd $W; E=ep07; SF=/path/to/gu.sf2
D=$(python3 -c "import json;print(json.load(open('$E/data.json'))['dur'])")
GTRSTEM=$E-gtr.wav python3 shared/mix.py $E/data.json $E.wav $SF   # -14 LUFS, peak-limited
python3 shared/sync_check.py $E/data.json $SF                        # audio onsets vs dots, must be < 33 ms
python3 shared/bend_check.py $E/data.json $E-gtr.wav                 # only if the episode has bends or slides
node shared/render.js $E/src/index.html $D $E-video.mp4              # frames are piped to ffmpeg, none hit the disk
ffmpeg -i $E-video.mp4 -i $E.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart out.mp4
node shared/cover.js $E/src/index.html <seconds just after the KEEP stamp> cover-1080x1920.png
```

## 5. Check before anyone sees it

- `ffprobe`: 1080x1920, 30 fps, H.264 + AAC 48 kHz, video and audio streams the same length.
- `ffmpeg -i out.mp4 -af ebur128=peak=true -f null -`: −14 LUFS integrated, true peak below −1.5 dBTP.
- Stills at 1 s / 25 / 50 / 75 % / last frame: `node shared/render.js $E/src/index.html 1 x stills 1,5.2,10.4,...` then `python3 shared/sheet.py sheet.jpg 5 $E stills/*.jpg`. Look at them: badges clear of dots and stamp, no clipped text, the end-card replay finishes before the end.
- Wording: say "lick", never "take"; first person "I"; never "launched" or "live"; claims only from `lickpick/index.html` and `lickpick/beta.html`.
- Nothing is posted or sent without Dave's OK.
