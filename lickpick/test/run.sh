#!/bin/sh
# LickPick regression suite (band timing, tempo, key, UI flows). Not published: _config.yml excludes lickpick/test.
#   ./run.sh offline          tempo / grid / key on every take, in Node, with the app's own code (fast, ~1 min)
#   ./run.sh band [URL]       the QA band tool in a real browser against URL (default: a local server), then metrics
#   ./run.sh ui [URL]         UI flows at 360/390/412/1280 + the extra checks (Back, keys, Auto style, heard, a11y)
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
  band)
    LPURL=$URL node tools/band.mjs && python3 tools/metrics.py ;;
  ui)
    for w in 360 390 412 1280; do LPURL=$URL node tools/flows.mjs $w; done
    LPURL=$URL node tools/extra.mjs 390 ;;
  *) echo "usage: $0 offline|band|ui [APP_URL]"; exit 1 ;;
esac
# serve the repo for a local URL:  python3 -m http.server 8790 --bind 127.0.0.1  (from the repo root)
