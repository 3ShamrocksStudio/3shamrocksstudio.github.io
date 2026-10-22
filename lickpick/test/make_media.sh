#!/bin/sh
# LickPick regression media: regenerates every test take (seeded, so the same audio every time) into ./media,
# with one truth.json (true beats, tempo, key) for all of them, plus the edge-case files the UI flows import.
#   qa/  the 9 takes of the independent QA run (gen_qa.py, unchanged)
#   x/   meters, extreme tempi, swing 140, minor keys, power chords, finger-picking (gen_extra.py x)
#   y/   generalisation: 16th strumming, 2 chords a bar, minor shuffle, 3/4 arpeggio, fast 8ths (gen_extra.py y)
#   z/   training-only takes for the tempo ranker (gen_extra.py z, never part of acceptance)
# Needs python3 + numpy + scipy and ffmpeg (libvpx, libopus, libx264 for the h264 edge file).
set -e
cd "$(dirname "$0")"
mkdir -p media/edge
python3 gen_qa.py media/qa
python3 gen_extra.py gen_qa.py media/x x
python3 gen_extra.py gen_qa.py media/y y
[ "$1" = "--train" ] && python3 gen_extra.py gen_qa.py media/z z
enc() { ffmpeg -v error -y -f lavfi -i "color=c=0x334455:s=${3:-320x180}:r=12" -i "$1" -shortest -c:v libvpx -b:v 60k -c:a libopus -b:a 96k -ac 1 "$2"; }
for d in qa x y; do for f in media/$d/*.wav; do enc "$f" "media/$(basename "$f" .wav).webm"; done; done
python3 gen_drums.py media/qa/t3_rock128.wav media/qa/truth.json media/z_drums128.wav && enc media/z_drums128.wav media/z_drums128.webm
python3 -c "import json; a = sum((json.load(open(f'media/{d}/truth.json')) for d in ('qa', 'x', 'y')), []); json.dump(a, open('media/truth.json', 'w')); print(len(a), 'takes')"
# round 4: takes for the tap-4-beats flow (tools/tap4.mjs): a reggae one-drop and a cumbia (beat gate) and a rock take (no gate)
python3 gen_v4.py media/r4 tune4 1 reggae,cumbia,rock && for f in media/r4/*.wav; do enc "$f" "media/r4/$(basename "$f" .wav).webm"; done
# 2026-10-22: Set the beat (tools/metro.mjs, tools/metrosim.mjs): 2 held-out takes per style (test4 seeds, never tuned on)
python3 gen_v4.py media/r5 test4 2 reggae,cumbia,funk,bossa,ballad68,waltz,rock,rubato && for f in media/r5/*.wav; do enc "$f" "media/r5/$(basename "$f" .wav).webm"; done && cp media/r5/truth_part.json media/r5/truth.json
# edge cases: no sound, sound only, empty, cut short, not a video, portrait, h264/aac, a big 720p file
E=media/edge
ffmpeg -v error -y -f lavfi -i "color=c=0x334455:s=320x180:r=12" -t 30 -c:v libvpx -b:v 60k "$E/no_audio.webm"
ffmpeg -v error -y -i media/qa/t1_ballad70.wav -c:a libopus -b:a 64k -ac 1 "$E/audio_only.webm"
: > "$E/zero_byte.webm"
head -c 400000 media/t1_ballad70.webm > "$E/truncated.webm"
head -c 2000000 /dev/urandom > "$E/garbage.mp4"
enc media/qa/t2_shuffle92.wav "$E/portrait_shuffle.webm" 180x320
ffmpeg -v error -y -f lavfi -i "color=c=0x334455:s=320x180:r=12" -i media/qa/t3_rock128.wav -shortest -c:v libx264 -c:a aac "$E/rock128_h264.mp4"
ffmpeg -v error -y -f lavfi -i "testsrc2=s=1280x720:r=30" -i media/qa/t1_ballad70.wav -shortest -c:v libvpx -b:v 30M -c:a libopus "$E/huge.webm"
echo "media ready in $(pwd)/media"
