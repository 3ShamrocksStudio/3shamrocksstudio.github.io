#!/bin/bash
# assemble each episode's self-contained source folder
S=$(dirname "$0"); cd "$S"
python3 shared/theory.py . > theory-log.txt || { tail -5 theory-log.txt; exit 1; }
for e in ep01 ep02 ep03; do mkdir -p $e/src; cp shared/reel.html $e/src/index.html; cp shared/fonts.css shared/lp-logo.png shared/3shamrocks.png $e/src/; cp $e/data.js $e/src/; done
tail -1 theory-log.txt
