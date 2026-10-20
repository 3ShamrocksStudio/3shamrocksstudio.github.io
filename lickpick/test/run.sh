#!/bin/sh
# LickPick regression suite (band timing, tempo, key, UI flows). Not published: _config.yml excludes lickpick/test.
#   ./run.sh offline          tempo / grid / key on every take, in Node, with the app's own code (fast, ~1 min)
#   ./run.sh band [URL]       the QA band tool in a real browser against URL (default: a local server), then metrics
#   ./run.sh ui [URL]         UI flows at 360/390/412/1280 + the extra checks (Back, keys, Auto style, heard, a11y)
#   DATA=dir ./run.sh offline3   round-3 held-out report (tempo per style/meter, grid, sections, meter, key precision)
#   ./run.sh signin [URL]     H3: closing the Google popup returns to the gate, the button is back within 2 s (use http://localhost:8790/..., an authorised domain)
#   DATA=dir ./run.sh offline4   round-4 held-out report (beat gate, 4-tap fix, free time, meters, downbeats, chord-follow)
#   ./run.sh tap4 [URL]       round 4: the beat gate and the tap-4-beats flow end to end at 360/390/412/1280 (media: make_media.sh -> media/r4)
# Acceptance (2026-10-20 QA fix): tempo right (or a sensible half/double) on >= 95% of takes; grid median
# < 15 ms and p95 < 40 ms on steady takes, no lost lock; key right (or relative with right chords) or drums only.
set -e
cd "$(dirname "$0")"
[ -f media/truth.json ] || ./make_media.sh
URL=${2:-http://127.0.0.1:8790/lickpick/app/}
case "$1" in
  offline)
    cd offline
    [ -d raw ] || RAWDIR=raw node dumpraw.mjs ../media/*.webm
    KEYTHR=0.85 node eval.mjs && node chords.mjs ;;
  offline3)
    # round 3 (2026-10-20b): own generator (gen_v3.py, tune/dev for development, test/final only for reporting) + real
    # recordings with a fixed split (offline/real_truth.py: GuitarSet, Ballroom, GTZAN). DATA = dir with raw_* dumps + truths.
    cd offline
    for f in final test; do [ -f "$DATA/v3_$f/truth.json" ] && TRUTH=$DATA/v3_$f/truth.json RAWROOT=$DATA QUIET=1 node eval3.mjs; done
    for f in gs3 br gt; do [ -f "$DATA/truth_$f.json" ] && TRUTH=$DATA/truth_$f.json RAWROOT=$DATA SPLIT=test QUIET=1 node eval3.mjs; done ;;
  offline4)
    # round 4 (2026-10-20c): gen_v4.py tune4 (calibration) / test4 (report) + the real test splits; per style: beat right on
    # its own, gate (asks for 4 taps), WRONG (plays a wrong beat without asking), the 4-tap fix, free time, meter, downbeats
    # (odd bars), harmony coverage + chord-tone / in-key accuracy, latency. DATA = dir with raw_* dumps + truths.
    cd offline
    for f in test4; do [ -f "$DATA/v4_$f/truth.json" ] && TRUTH=$DATA/v4_$f/truth.json RAWROOT=$DATA QUIET=1 node eval4.mjs; done
    for f in gs4 br gt; do [ -f "$DATA/truth_$f.json" ] && TRUTH=$DATA/truth_$f.json RAWROOT=$DATA SPLIT=test QUIET=1 node eval4.mjs; done ;;
  tap4)
    for w in 360 390 412 1280; do LPURL=$URL node tools/tap4.mjs $w; done ;;
  band3)
    LPURL=$URL node tools/band3.mjs ;;
  signin)
    for w in 360 390 412 1280; do LPURL=$URL node tools/signin.mjs $w; done ;;
  band)
    LPURL=$URL node tools/band.mjs && python3 tools/metrics.py ;;
  ui)
    for w in 360 390 412 1280; do LPURL=$URL node tools/flows.mjs $w; done
    LPURL=$URL node tools/extra.mjs 390 ;;
  *) echo "usage: $0 offline|offline3|offline4|band|band3|ui|signin|tap4 [APP_URL]"; exit 1 ;;
esac
# serve the repo for a local URL:  python3 -m http.server 8790 --bind 127.0.0.1  (from the repo root)
