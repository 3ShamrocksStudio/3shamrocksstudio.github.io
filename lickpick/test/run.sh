#!/bin/sh
# LickPick regression suite (band timing, tempo, key, UI flows). Not published: _config.yml excludes lickpick/test.
#   ./run.sh offline          tempo / grid / key on every take, in Node, with the app's own code (fast, ~1 min)
#   ./run.sh band [URL]       the QA band tool in a real browser against URL (default: a local server), then metrics
#   ./run.sh ui [URL]         UI flows at 360/390/412/1280 + the extra checks (Back, keys, Auto style, heard, a11y)
#   DATA=dir ./run.sh offline3   round-3 held-out report (tempo per style/meter, grid, sections, meter, key precision)
#   ./run.sh signin [URL]     H3: closing the Google popup returns to the gate, the button is back within 2 s (use http://localhost:8790/..., an authorised domain)
#   DATA=dir ./run.sh offline4   round-4 held-out report (beat gate, 4-tap fix, free time, meters, downbeats, chord-follow)
#   ./run.sh metro [URL]      Set the beat (2026-10-22, replaces tap4): the metronome lock end to end at 360/390/412/1280 (media/r5)
#   ./run.sh metrosim [URL]   Set the beat with simulated players on 16 styles + tempo drift + a 6-min take: taps to a correct lock, and
#                             the band vs the true beats after the lock (grid, preview, export). Target: median < 10 ms, p95 < 25 ms, no drift
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
  tap4|metro)
    for w in 360 390 412 1280; do LPURL=$URL node tools/metro.mjs $w; done ;;
  metrosim)
    LPURL=$URL node tools/metrosim.mjs media/r5 test4_reggae_00 test4_reggae_01 test4_cumbia_00 test4_cumbia_01 test4_funk_00 test4_funk_01 \
      test4_bossa_00 test4_bossa_01 test4_ballad68_00:full test4_ballad68_01:full test4_waltz_00 test4_waltz_01 test4_rock_00 test4_rock_01 test4_rubato_00 test4_rubato_01
    LPURL=$URL OUT=out/metrosim_qa.json node tools/metrosim.mjs media t5_drift100to105:full t9_long6min120:full ;;
  band3)
    LPURL=$URL node tools/band3.mjs ;;
  signin)
    for w in 360 390 412 1280; do LPURL=$URL node tools/signin.mjs $w; done ;;
  band)
    LPURL=$URL node tools/band.mjs && python3 tools/metrics.py ;;
  ui)
    for w in 360 390 412 1280; do LPURL=$URL node tools/flows.mjs $w; done
    LPURL=$URL node tools/extra.mjs 390 ;;
  *) echo "usage: $0 offline|offline3|offline4|band|band3|ui|signin|metro|metrosim [APP_URL]"; exit 1 ;;
esac
# serve the repo for a local URL:  python3 -m http.server 8790 --bind 127.0.0.1  (from the repo root)
