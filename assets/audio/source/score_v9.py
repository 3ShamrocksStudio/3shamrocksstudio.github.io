"""3Shamrocks Studio music, Score v9 "a song per page": every product page gets its OWN solo song, written from the
homepage main theme, in its own warm voice. The band (drums, bass, guitar, keys, organ, sax section), the 98 BPM swung-16th
groove, E dorian, the Em9 A13 Em9 Cmaj9-B7#9 changes, the loop lengths and the homepage scroll build-up are Score v8, untouched.

Dave, 12 Nov: "that repetitive 'solo song' in different instrument sounds is too much. each inner page must present a
DIFFERENT AND UNIQUE SOLO SONG based on the main theme song from home page" / "Each page must contain its own original, unique
and modified version of the main title song ... adjusted to the page content, style, brand vibe and target audience" / SH✡MER:
"no solo instrument, or maybe just 'cool tone funky beat' with bass strings solo" / LickPick: "rock-style keyboard solo" and an
"electric guitar riff" hover sound / R&K: "less fun, more funk, mysterious, business-oriented, focus music, same beat and tempo" /
"sounds and tones ... must be soothing and pleasing ... keep the 'funky style' vibe".

The main theme (homepage, mel-theme): pickup B3, up to D4-E4, falls back to D4 (bar 1), the same shape answered higher (bar 5),
a climb to B4 over Cmaj9 and the turn F#4-D#4 into B3 over B7#9. Every page song below starts from that hook and grows its own
tune with it (inverted, augmented, displaced, sequenced or re-harmonised), 16 written bars (A + B) laid out over the 32-bar
loop as A, B, A-then-B hybrid, B-then-A hybrid with thinned bars, so the 78 s loop never comes round as one phrase.

Reference: Dave's own SoundCloud (13 nylon-string guitar instrumentals, flamenco rumba / Spanish guitar, 2013, played by him).
What the site takes from it (analysed from the audio, see NOTES): steady eighth-note rumba pulse with repeated-note pickups,
mostly stepwise lines with neighbour-note turns, whole-step descents (the Andalusian walk-down) and the Phrygian half-step lean
C -> B over the B7 chord. Used as phrasing grammar in every song, most of all in the Concept Lab song (nylon guitar, his
instrument) and in the homepage theme's guitar answers, which are now played on nylon guitar.

Voices (no GM 56-63 trumpet / brass anywhere; nothing above G5; leads de-harshed 2.9 / 4.3 kHz, rolled off above ~5.5 kHz):
  theme            tenor sax call (v8) + NYLON guitar answers (was a muted jazz guitar)
  shomer           fretless bass solo, upper register (cool tone), with a whisper of muted guitar an octave up on phones
  lickpick         rock organ solo (drawbar organ, light drive, rotary speaker), pentatonic rock licks
  chore-royale     pizzicato strings + marimba: a playful court dance
  rk               dark Rhodes, sparse, long tones: noir focus music
  trashure-hunters marimba + soft pan flute in its low register: a trail / quest tune
  milo             vibraphone, slow lullaby contour, soft mallets
  fairent          jazz guitar in octaves (smooth, confident)
  concepts         nylon guitar, rumba phrasing, Phrygian cadence (Dave's own style)
  ezra             clarinet in its warm low register, slow
Usage: python3 score_v9.py stems [names]   (writes assets/audio/studio/v6/mel-*.ogg|m4a; ver sc9)
       S3_OLD=<copy of the v8 v6/ folder> keeps the level match against the v8 files.
Requires score_v8.py / score_v7.py / score_v5.py next to this file, GeneralUser GS (env S3_SF2)."""
import os, sys, subprocess
import numpy as np
import soundfile as sf
import pedalboard as pb

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
os.environ.setdefault('S3_OUT', '/dev/shm/s3studio/v9')
import score_v8 as v8                                    # noqa: E402
v7, v5 = v8.v7, v8.v5

SR, BEAT, BAR, bt = v5.SR, v5.BEAT, v5.BAR, v5.bt
WORK = os.environ['S3_OUT']
REPO_OUT = v8.REPO_OUT
OLD_DIR = v8.OLD_DIR
PAD = 0.5
NBM = 32
Part, render, express, norm, fxc = v8.Part, v8.render, v8.express, v8.norm, v8.fxc

# ------------------------------------------------------------------ the page songs: A (bars 0-7) and B (bars 8-15)
# bar lists of (beat, beats, midi[, vel]); chords per bar: Em9 Em9 A13 A13 Em9 Em9 Cmaj9 B7#9
SONGS = {
    'shomer': dict(  # fretless bass: the hook an octave down, slides, lots of air
        A=[[(0.75, .25, 47), (1.0, .5, 50), (1.5, .25, 52), (1.75, 1.25, 50)],
           [(0.5, .5, 55), (1.0, 2.0, 52)],
           [(0.75, .25, 49), (1.0, .5, 52), (1.5, .5, 54), (2.0, 1.25, 57), (3.5, .5, 55)],
           [(0.0, 2.0, 54), (2.75, .25, 52), (3.0, .75, 49)],
           [(0.75, .25, 47), (1.0, .5, 50), (1.5, .25, 52), (1.75, 1.0, 55), (3.0, .75, 57)],
           [(0.0, .75, 59), (1.0, .5, 57), (1.5, .5, 55), (2.0, 1.75, 54)],
           [(0.5, .5, 52), (1.0, .5, 55), (1.5, .5, 59), (2.0, 1.75, 62)],
           [(0.0, .5, 59), (0.5, .5, 57), (1.0, .5, 51), (1.5, 2.0, 47)]],
        B=[[(2.0, .25, 52), (2.25, .25, 55), (2.5, .5, 57), (3.0, 1.0, 59)],
           [(0.0, .5, 62), (0.75, .75, 59), (2.0, 1.75, 55)],
           [(0.5, .5, 57), (1.0, .5, 61), (1.5, .5, 64), (2.0, 1.5, 61)],
           [(0.0, .5, 57), (1.0, 2.0, 54)],
           [(0.75, .25, 52), (1.0, .25, 54), (1.25, .25, 55), (1.5, 1.0, 59), (3.0, .5, 57)],
           [(0.0, .5, 55), (0.5, .5, 54), (1.0, 2.5, 52)],
           [(1.0, .5, 48), (1.5, .5, 52), (2.0, .5, 55), (2.5, 1.25, 59)],
           [(0.0, .5, 57), (0.5, .5, 54), (1.0, .75, 51), (2.0, 1.75, 47)]]),
    'lickpick': dict(  # rock organ: the hook as a pentatonic lick, then runs, a G5 peak, the B7 run down
        A=[[(0.0, .25, 64), (0.25, .25, 67), (0.5, .5, 69), (1.0, .25, 67), (1.25, .25, 64), (1.5, .5, 62), (2.0, 1.0, 64), (3.25, .25, 62), (3.5, .5, 64)],
           [(0.0, .25, 67), (0.25, .25, 69), (0.5, .25, 71), (0.75, .75, 74), (1.75, .25, 71), (2.0, 1.5, 69), (3.5, .5, 67)],
           [(0.0, .5, 69), (0.5, .25, 67), (0.75, .25, 64), (1.0, .5, 61), (1.5, .5, 64), (2.0, 1.5, 66), (3.5, .25, 64), (3.75, .25, 66)],
           [(0.0, .25, 69), (0.25, .25, 71), (0.5, 1.0, 73), (1.5, .5, 71), (2.0, 1.0, 69), (3.0, .5, 66), (3.5, .5, 64)],
           [(0.0, .25, 71), (0.25, .25, 74), (0.5, .25, 76), (0.75, .25, 74), (1.0, .25, 71), (1.25, .25, 69), (1.5, .5, 67), (2.0, .5, 64), (2.5, 1.0, 67)],
           [(0.0, .25, 62), (0.25, .25, 64), (0.5, .25, 67), (0.75, .25, 69), (1.0, 1.5, 71), (2.75, .25, 69), (3.0, .5, 67), (3.5, .5, 69)],
           [(0.0, .5, 71), (0.5, .5, 72), (1.0, .5, 74), (1.5, .5, 76), (2.0, 1.5, 79), (3.5, .5, 76)],
           [(0.0, .25, 75), (0.25, .25, 74), (0.5, .25, 71), (0.75, .25, 69), (1.0, .25, 66), (1.25, .25, 63), (1.5, 1.75, 59), (3.5, .5, 62)]],
        B=[[(0.0, .75, 64), (0.75, .25, 64), (1.25, .25, 67), (1.5, .5, 64), (2.5, .25, 62), (2.75, .25, 64), (3.0, 1.0, 67)],
           [(0.0, .25, 69), (0.25, .25, 67), (0.5, .5, 64), (1.0, .5, 62), (1.5, 2.0, 59)],
           [(0.0, .75, 61), (0.75, .25, 64), (1.25, .25, 66), (1.5, .5, 64), (2.5, .25, 66), (2.75, .25, 67), (3.0, 1.0, 69)],
           [(0.0, .25, 71), (0.25, .25, 69), (0.5, .5, 66), (1.0, .5, 64), (1.5, 2.0, 61)],
           [(0.0, .25, 71), (0.25, .25, 71), (0.5, .25, 74), (0.75, .25, 71), (1.0, .25, 76), (1.25, .25, 71), (1.5, .25, 74), (1.75, .25, 71), (2.0, 1.0, 69), (3.0, 1.0, 67)],
           [(0.0, .25, 64), (0.25, .25, 67), (0.5, .25, 64), (0.75, .25, 62), (1.0, 1.0, 64), (2.0, .25, 67), (2.25, .25, 69), (2.5, 1.5, 71)],
           [(0.0, .33, 72), (0.33, .33, 74), (0.67, .33, 76), (1.0, .5, 79), (1.5, .5, 76), (2.0, .5, 74), (2.5, .5, 72), (3.0, 1.0, 71)],
           [(0.0, .5, 69), (0.5, .5, 66), (1.0, .5, 63), (1.5, .5, 62), (2.0, 1.75, 59)]]),
    'chore-royale': dict(  # pizzicato + marimba court dance: dotted rhythms, the bright dorian C#
        A=[[(0.0, .5, 64), (0.75, .25, 64), (1.0, .5, 67), (1.5, .5, 71), (2.0, .75, 76), (2.75, .25, 74), (3.0, .5, 71)],
           [(0.0, .25, 69), (0.5, .5, 67), (1.0, .5, 64), (2.0, .5, 66), (2.5, .5, 67), (3.0, .5, 69)],
           [(0.0, .75, 73), (0.75, .25, 71), (1.0, .5, 69), (1.5, .5, 73), (2.0, .75, 76), (2.75, .25, 73), (3.0, .5, 69)],
           [(0.0, .5, 71), (0.5, .5, 69), (1.0, 1.0, 66), (2.5, .25, 69), (2.75, .25, 71), (3.0, .5, 73)],
           [(0.0, .5, 74), (0.75, .25, 74), (1.0, .5, 71), (1.5, .5, 67), (2.0, .75, 64), (2.75, .25, 67), (3.0, .5, 71)],
           [(0.0, .5, 76), (0.5, .5, 74), (1.0, .5, 71), (1.5, .5, 69), (2.0, 1.0, 67), (3.5, .5, 66)],
           [(0.0, .5, 64), (0.5, .5, 67), (1.0, .5, 72), (1.5, .5, 76), (2.0, .75, 79), (2.75, .25, 76), (3.0, .5, 72)],
           [(0.0, .5, 75), (0.5, .5, 71), (1.0, .5, 66), (1.5, .5, 63), (2.0, 1.5, 71)]],
        B=[[(0.5, .25, 71), (0.75, .25, 73), (1.0, .5, 74), (1.5, .5, 71), (2.0, .5, 67), (2.5, .5, 71), (3.0, 1.0, 76)],
           [(0.0, .5, 74), (0.5, .5, 71), (1.0, 1.0, 69), (2.5, .5, 67), (3.0, .5, 66), (3.5, .5, 67)],
           [(0.0, .5, 69), (0.5, .5, 73), (1.0, .5, 76), (1.5, .5, 73), (2.0, .5, 78), (2.5, .5, 76), (3.0, 1.0, 73)],
           [(0.0, .5, 71), (0.5, .5, 69), (1.0, .5, 66), (1.5, .5, 64), (2.0, 1.0, 61), (3.0, .5, 64), (3.5, .5, 66)],
           [(0.0, .75, 67), (0.75, .25, 69), (1.0, .5, 71), (1.5, .5, 74), (2.0, .75, 76), (2.75, .25, 74), (3.0, .5, 71), (3.5, .5, 74)],
           [(0.0, 1.0, 79), (1.0, .5, 76), (1.5, .5, 74), (2.0, 1.0, 71), (3.0, .5, 69), (3.5, .5, 67)],
           [(0.0, .5, 72), (0.5, .5, 71), (1.0, .5, 67), (1.5, .5, 64), (2.0, .5, 67), (2.5, .5, 72), (3.0, 1.0, 76)],
           [(0.0, .5, 75), (0.5, .5, 78), (1.0, 1.0, 75), (2.0, .5, 71), (2.5, 1.5, 71)]]),
    'rk': dict(  # dark Rhodes: the hook turned upside down and slowed, chromatic D#-D over B7#9, room to think
        A=[[(1.0, .5, 64), (1.5, .5, 62), (2.0, 2.0, 59)],
           [(2.5, .5, 62), (3.0, 1.0, 64)],
           [(0.0, 1.5, 66), (1.5, .5, 64), (2.0, 2.0, 61)],
           [(2.5, .5, 64), (3.0, 1.0, 66)],
           [(0.0, .5, 67), (0.5, .5, 66), (1.0, 1.5, 64), (2.5, .5, 62), (3.0, 1.0, 59)],
           [(1.0, 3.0, 62)],
           [(0.5, .5, 64), (1.0, .5, 67), (1.5, .5, 71), (2.0, 2.0, 74)],
           [(0.0, 1.0, 75), (1.0, 1.0, 74), (2.0, 2.0, 71)]],
        B=[[(3.0, .5, 59), (3.5, .5, 62)],
           [(0.0, 2.0, 66), (2.0, .5, 64), (2.5, 1.5, 62)],
           [(1.0, .5, 61), (1.5, .5, 64), (2.0, 2.0, 69)],
           [(0.0, 1.0, 67), (1.0, 3.0, 66)],
           [(0.5, .5, 71), (1.0, .5, 69), (1.5, .5, 67), (2.0, 2.0, 66)],
           [(1.0, .5, 64), (1.5, 2.5, 62)],
           [(0.0, 1.5, 64), (1.5, .5, 67), (2.0, 2.0, 71)],
           [(0.0, .5, 69), (0.5, .5, 66), (1.0, 1.0, 63), (2.0, 2.0, 59)]]),
    'trashure-hunters': dict(  # marimba + low pan flute: the hook opened into 4ths and 5ths, a trail tune
        A=[[(0.75, .25, 59), (1.0, .5, 64), (1.5, .25, 66), (1.75, 1.25, 71), (3.0, .5, 69), (3.5, .5, 67)],
           [(0.0, .5, 66), (0.5, .5, 64), (1.0, 2.0, 62), (3.5, .5, 64)],
           [(0.0, .5, 66), (0.5, .5, 69), (1.0, .5, 73), (1.5, 1.5, 76), (3.0, .5, 73), (3.5, .5, 71)],
           [(0.0, 2.0, 69), (2.5, .5, 64), (3.0, .5, 66), (3.5, .5, 69)],
           [(0.0, .75, 71), (0.75, .25, 69), (1.0, .5, 71), (1.5, .25, 74), (1.75, 1.25, 76), (3.0, .5, 74), (3.5, .5, 71)],
           [(0.0, .5, 69), (0.5, .5, 67), (1.0, .5, 66), (1.5, .5, 64), (2.0, 2.0, 66)],
           [(0.0, .5, 67), (0.5, .5, 71), (1.0, .5, 72), (1.5, .5, 76), (2.0, 1.5, 74), (3.5, .5, 72)],
           [(0.0, .5, 71), (0.5, .5, 69), (1.0, .5, 66), (1.5, .5, 63), (2.0, 2.0, 66)]],
        B=[[(0.0, .5, 64), (0.5, .5, 67), (1.0, .5, 71), (1.5, .5, 67), (2.0, .5, 74), (2.5, .5, 71), (3.0, 1.0, 67)],
           [(0.0, .5, 69), (0.5, .5, 71), (1.0, 1.5, 69), (3.0, .5, 66), (3.5, .5, 64)],
           [(0.0, .5, 61), (0.5, .5, 64), (1.0, .5, 69), (1.5, .5, 64), (2.0, .5, 73), (2.5, .5, 69), (3.0, 1.0, 66)],
           [(0.0, .5, 67), (0.5, .5, 69), (1.0, 2.0, 71), (3.5, .5, 73)],
           [(0.0, 1.0, 74), (1.0, .5, 71), (1.5, .5, 74), (2.0, 1.0, 76), (3.0, .5, 74), (3.5, .5, 71)],
           [(0.0, .5, 69), (0.5, .5, 71), (1.0, .5, 67), (1.5, .5, 69), (2.0, 2.0, 64)],
           [(0.0, .5, 72), (0.5, .5, 71), (1.0, .5, 67), (1.5, .5, 72), (2.0, 1.0, 76), (3.0, 1.0, 74)],
           [(0.0, .5, 75), (0.5, .5, 71), (1.0, .5, 66), (1.5, .5, 63), (2.0, 2.0, 59)]]),
    'milo': dict(  # vibraphone lullaby: the hook in long notes, rising thirds, gentle
        A=[[(1.0, 1.0, 64), (2.0, 1.0, 67), (3.0, 1.0, 71)],
           [(0.0, 2.0, 69), (2.0, 2.0, 66)],
           [(1.0, 1.0, 64), (2.0, 1.0, 69), (3.0, 1.0, 73)],
           [(0.0, 2.0, 71), (2.0, 2.0, 69)],
           [(1.0, 1.0, 71), (2.0, 1.0, 74), (3.0, 1.0, 76)],
           [(0.0, 1.5, 74), (1.5, .5, 71), (2.0, 2.0, 69)],
           [(0.5, .5, 67), (1.0, 1.0, 71), (2.0, 1.0, 74), (3.0, 1.0, 72)],
           [(0.0, 2.0, 71), (2.0, 1.0, 69), (3.0, 1.0, 66)]],
        B=[[(0.0, 2.0, 67), (2.5, .5, 71), (3.0, 1.0, 74)],
           [(0.0, 1.0, 76), (1.0, 1.0, 74), (2.0, 2.0, 71)],
           [(0.5, .5, 69), (1.0, 1.0, 73), (2.0, 2.0, 76)],
           [(0.0, 1.0, 73), (1.0, 1.0, 71), (2.0, 2.0, 69)],
           [(0.0, 1.0, 67), (1.0, 1.0, 71), (2.0, 1.0, 74), (3.0, 1.0, 71)],
           [(0.0, 2.0, 69), (2.0, 2.0, 66)],
           [(0.0, 1.0, 64), (1.0, 1.0, 67), (2.0, 1.0, 71), (3.0, 1.0, 72)],
           [(0.0, 2.0, 71), (2.0, 2.0, 63)]]),
    'fairent': dict(  # jazz guitar octaves: the hook in syncopated eighths, smooth and sure of itself
        A=[[(0.5, .5, 59), (1.0, .5, 62), (1.5, .5, 64), (2.0, .75, 66), (2.75, .75, 64), (3.5, .5, 62)],
           [(0.0, 1.5, 64), (2.0, .5, 67), (2.5, .5, 66), (3.0, 1.0, 64)],
           [(0.5, .5, 61), (1.0, .5, 64), (1.5, .5, 66), (2.0, .75, 69), (2.75, .75, 66), (3.5, .5, 64)],
           [(0.0, 2.0, 66), (2.5, .5, 64), (3.0, .5, 61), (3.5, .5, 64)],
           [(0.0, .5, 67), (0.5, .5, 66), (1.0, .5, 64), (1.5, .5, 62), (2.0, .75, 64), (2.75, 1.25, 71)],
           [(0.0, .5, 69), (0.5, .5, 67), (1.0, 2.0, 66), (3.5, .5, 64)],
           [(0.0, .5, 64), (0.5, .5, 67), (1.0, .5, 71), (1.5, .5, 72), (2.0, .75, 74), (2.75, 1.25, 71)],
           [(0.0, .5, 69), (0.5, .5, 66), (1.0, .5, 63), (1.5, .5, 62), (2.0, 2.0, 59)]],
        B=[[(1.0, .5, 71), (1.5, .5, 69), (2.0, .5, 67), (2.5, .5, 64), (3.0, 1.0, 66)],
           [(0.0, .75, 67), (0.75, .75, 64), (1.5, 2.0, 62)],
           [(1.0, .5, 73), (1.5, .5, 71), (2.0, .5, 69), (2.5, .5, 66), (3.0, 1.0, 67)],
           [(0.0, .75, 69), (0.75, .75, 66), (1.5, 2.0, 64)],
           [(0.0, .5, 64), (0.5, .5, 66), (1.0, .5, 67), (1.5, .5, 71), (2.0, 1.0, 74), (3.0, .5, 71), (3.5, .5, 74)],
           [(0.0, 1.5, 76), (1.5, .5, 74), (2.0, 2.0, 71)],
           [(0.5, .5, 72), (1.0, .5, 71), (1.5, .5, 67), (2.0, .5, 64), (2.5, 1.5, 67)],
           [(0.0, .5, 66), (0.5, .5, 63), (1.0, .5, 62), (1.5, .5, 59), (2.0, 2.0, 59)]]),
    'concepts': dict(  # nylon guitar, rumba phrasing (Dave's SoundCloud): repeated-note pickups, neighbour turns,
        # Andalusian walk-downs, and the Phrygian C -> B cadence over B7#9
        A=[[(0.0, .5, 71), (0.5, .5, 71), (1.0, .5, 69), (1.5, .5, 71), (2.0, 1.0, 74), (3.0, .5, 71), (3.5, .5, 69)],
           [(0.0, .5, 67), (0.5, .5, 69), (1.0, .5, 67), (1.5, .5, 66), (2.0, 2.0, 64)],
           [(0.0, .5, 73), (0.5, .5, 73), (1.0, .5, 71), (1.5, .5, 73), (2.0, 1.0, 76), (3.0, .5, 73), (3.5, .5, 71)],
           [(0.0, .5, 69), (0.5, .5, 71), (1.0, .5, 69), (1.5, .5, 67), (2.0, 2.0, 66)],
           [(0.0, .5, 64), (0.5, .5, 66), (1.0, .5, 67), (1.5, .5, 69), (2.0, .5, 71), (2.5, .5, 74), (3.0, 1.0, 71)],
           [(0.0, .5, 69), (0.5, .5, 67), (1.0, .5, 66), (1.5, .5, 64), (2.0, 1.5, 62), (3.5, .5, 64)],
           [(0.0, .5, 67), (0.5, .5, 67), (1.0, .5, 67), (1.5, .5, 71), (2.0, .5, 72), (2.5, .5, 71), (3.0, .5, 72), (3.5, .5, 74)],
           [(0.0, .25, 76), (0.25, .25, 75), (0.5, .25, 72), (0.75, .25, 71), (1.0, .25, 69), (1.25, .25, 67), (1.5, .25, 66), (1.75, .25, 63),
            (2.0, .5, 60), (2.5, 1.5, 59)]],
        B=[[(0.0, 1.0, 71), (1.0, .5, 67), (1.5, .5, 71), (2.0, 1.0, 76), (3.0, 1.0, 74)],
           [(0.0, .5, 71), (0.5, .5, 69), (1.0, 1.0, 67), (2.0, .5, 66), (2.5, 1.5, 64)],
           [(0.0, 1.0, 73), (1.0, .5, 69), (1.5, .5, 73), (2.0, 1.0, 76), (3.0, 1.0, 78)],
           [(0.0, .5, 76), (0.5, .5, 73), (1.0, 1.0, 71), (2.0, .5, 69), (2.5, 1.5, 67)],
           [(0.0, .5, 76), (0.5, .5, 74), (1.0, .5, 71), (1.5, .5, 69), (2.0, 1.0, 67), (3.0, .5, 69), (3.5, .5, 71)],
           [(0.0, 2.0, 66), (2.0, .5, 64), (2.5, .5, 66), (3.0, 1.0, 67)],
           [(0.0, .5, 69), (0.5, .5, 67), (1.0, .5, 64), (1.5, .5, 67), (2.0, 1.0, 72), (3.0, 1.0, 71)],
           [(0.0, .5, 69), (0.5, .5, 67), (1.0, .5, 66), (1.5, .5, 63), (2.0, .5, 60), (2.5, 1.5, 59)]]),
    'ezra': dict(  # clarinet, low and warm: the hook in half the speed, calm steps
        A=[[(1.0, 1.0, 59), (2.0, 1.0, 62), (3.0, 1.0, 64)],
           [(0.0, 2.5, 62), (3.0, 1.0, 59)],
           [(0.0, 1.0, 61), (1.0, 1.0, 64), (2.0, 2.0, 66)],
           [(0.0, 3.0, 64), (3.5, .5, 61)],
           [(0.0, 1.0, 59), (1.0, 1.0, 62), (2.0, 1.0, 64), (3.0, 1.0, 67)],
           [(0.0, 2.0, 66), (2.0, 2.0, 62)],
           [(0.0, 1.0, 64), (1.0, 1.0, 67), (2.0, 2.0, 71)],
           [(0.0, 1.5, 69), (1.5, .5, 66), (2.0, 2.0, 63)]],
        B=[[(0.0, 3.0, 64), (3.0, 1.0, 67)],
           [(0.0, 1.0, 66), (1.0, 1.0, 64), (2.0, 2.0, 62)],
           [(0.0, 3.0, 64), (3.0, 1.0, 69)],
           [(0.0, 1.0, 67), (1.0, 1.0, 66), (2.0, 2.0, 64)],
           [(0.0, 1.0, 62), (1.0, 1.0, 64), (2.0, 1.0, 67), (3.0, 1.0, 71)],
           [(0.0, 2.0, 69), (2.0, 2.0, 66)],
           [(0.0, 1.0, 67), (1.0, 1.0, 64), (2.0, 2.0, 60)],
           [(0.0, 2.0, 59), (2.0, 1.0, 63), (3.0, 1.0, 66)]]),
}

# voice: (GM program, family for the expressive player, velocity, [(doubling program, key offset, level)], tone)
VOICES = {
    'shomer':           (35, 'gtr', 92, [(28, 12, 0.18)], 'bass'),        # fretless bass + whisper of muted guitar 8va
    'lickpick':         (18, 'organ', 100, [], 'rockorgan'),             # rock organ
    'chore-royale':     (45, 'keys', 96, [(12, 0, 0.55)], 'mallet'),      # pizzicato + marimba
    'rk':               (4, 'keys', 84, [], 'rhodes'),                   # dark Rhodes
    'trashure-hunters': (12, 'keys', 98, [(75, 0, 0.45)], 'mallet'),      # marimba + pan flute
    'milo':             (11, 'keys', 80, [], 'vibes'),                   # vibraphone
    'fairent':          (26, 'gtr', 88, [(26, 12, 0.45)], 'jazzgtr'),     # jazz guitar in octaves
    'concepts':         (24, 'keys', 94, [], 'nylon'),                   # nylon guitar
    'ezra':             (71, 'organ', 84, [], 'clarinet'),               # clarinet (organ family = soft swell + light vibrato)
}
LEVEL_REF = {'rk': 'mel-concepts', 'ezra': 'mel-theme'}                  # new stems are level-matched to these v8 files


def hybrid(S, which):
    A, B = S['A'], S['B']
    if which == 0: return A
    if which == 1: return B
    if which == 2: return A[:4] + B[4:]
    # pass 4: B's opening thinned to its long notes (air before the loop comes round), then A's ending
    return [[x for x in bar if x[1] >= 0.5] or bar[-1:] for bar in B[:4]] + A[4:]


def song_notes(name):
    S = SONGS[name]; prog, fam, vel = VOICES[name][:3]; out = []
    for pas in range(4):
        bars = hybrid(S, pas)
        for k, bar in enumerate(bars):
            b = pas * 8 + k
            for i, x in enumerate(bar):
                beat, d, key = x[:3]; v = x[3] if len(x) > 3 else vel
                on_beat = abs(beat - round(beat)) < 1e-6
                v = v + (4 if on_beat and d >= 1.0 else 0) - (6 if d <= 0.25 and not on_beat else 0) - (3 if pas == 3 else 0)
                bf = 0
                if fam == 'gtr' and d >= 1.0 and i > 0 and abs(key - bar[i - 1][2]) <= 3 and VOICES[name][4] == 'bass': bf = -1   # fretless slide in
                if fam == 'gtr' and VOICES[name][4] == 'jazzgtr': bf = 0
                out.append(dict(t=bt(b, beat) + 0.018, d=d * BEAT * (0.92 if fam == 'keys' else 1.0), k=key, v=int(v), bf=bf, vib=d >= 1.0))
    return out

# ------------------------------------------------------------------ tone chains (warm, no screech)


def tone(m, kind):
    if kind == 'bass':
        return fxc(m, [pb.HighpassFilter(45), pb.Compressor(-22, 3.0, 8, 160), pb.LowShelfFilter(180, 1.5, 0.7),
                       pb.PeakFilter(850, 3.0, 0.9),                        # growl / presence so phones hear the line
                       pb.PeakFilter(2600, -3.0, 1.0), pb.LadderFilter(pb.LadderFilter.Mode.LPF12, 3800, 0.0, 1.0)])
    if kind == 'rockorgan':
        m = fxc(m, [pb.HighpassFilter(110), pb.Gain(2.0), pb.Distortion(3.0), pb.PeakFilter(700, 1.5, 0.8), pb.PeakFilter(2900, -6.0, 0.8), pb.PeakFilter(3600, -3.0, 0.6),
                    pb.PeakFilter(4300, -4.0, 1.1), pb.LadderFilter(pb.LadderFilter.Mode.LPF24, 4800, 0.0, 1.0)])
        return v5.chorus(m, 6.2, 1.8, 4.0, 0.5).mean(axis=0, keepdims=True)    # rotary speaker (fast)
    if kind in ('mallet', 'vibes', 'rhodes'):
        dark = {'rhodes': (2200, -4.0, 5200), 'vibes': (3000, -3.5, 6000), 'mallet': (3000, -3.0, 6500)}[kind]
        return fxc(m, [pb.HighpassFilter(120 if kind != 'rhodes' else 90), pb.Compressor(-22, 2.0, 6, 180), pb.PeakFilter(300, -1.0, 0.8),
                       pb.PeakFilter(dark[0], dark[1], 1.0), pb.PeakFilter(4300, -3.0, 1.1), pb.HighShelfFilter(5000, -3.0, 0.7),
                       pb.LadderFilter(pb.LadderFilter.Mode.LPF12, dark[2], 0.0, 1.0)])
    if kind == 'jazzgtr':
        return v8.clean_gtr(m)
    if kind == 'nylon':
        return fxc(m, [pb.HighpassFilter(100), pb.Compressor(-22, 2.5, 5, 150), pb.PeakFilter(220, 1.0, 0.8), pb.PeakFilter(2900, -4.0, 1.0),
                       pb.PeakFilter(4300, -3.0, 1.1), pb.HighShelfFilter(5500, -3.0, 0.7), pb.LadderFilter(pb.LadderFilter.Mode.LPF12, 6500, 0.0, 1.0)])
    if kind == 'clarinet':
        return v8.sax_lead(m, 'tenor')
    raise ValueError(kind)


def p_song(name):
    v7.setlen(NBM)
    prog, fam, vel, dbl, kind = VOICES[name]
    p = Part(); p.prog(0, prog)
    notes = express(p, [(0, 0, 0)], song_notes(name), fam, v5.R)
    m = tone(norm(render(p).mean(axis=0, keepdims=True)), kind)
    for dprog, ko, lvl in dbl:                         # doublings follow the same (humanised) note times, own tone
        q = v5.Part(); q.prog(0, dprog)
        for n in notes: q.n(n['t'] + 0.004, n['d'] * (0.6 if dprog == 28 else 1.0), 0, n['k'] + ko, max(30, n['v'] - (14 if dprog == 28 else 6)), jit=0.003, vj=3)
        dm = render(q).mean(axis=0, keepdims=True)
        dk = 'jazzgtr' if dprog in (26, 28) else ('mallet' if dprog in (12,) else 'clarinet')
        if dprog == 75: dk = 'clarinet'               # pan flute: through the de-harsh woodwind chain
        dm = tone(norm(dm), dk)
        m = m + lvl * dm * np.abs(m).max() / (np.abs(dm).max() + 1e-9)
    return m

# ------------------------------------------------------------------ the homepage theme: v8 tenor call, nylon guitar answers


def p_theme():
    v7.setlen(NBM)
    var = v7.VARIANTS6['theme']; voice = var['t']; t = v7.LEADS6[voice]
    ends = dict(v7.ENDS)
    p = Part(); p.prog(0, t[1], bank=t[0])
    notes = []
    for b in range(NBM):
        for beat, d, k, v, bf, vib in v7.lead_bar(b):
            if k == 'END': k = ends[b]
            notes.append(dict(t=bt(b, beat) + 0.022, d=d * BEAT, k=k, v=v - 4, bf=bf, vib=vib))
    express(p, [(0, 0, 0)], notes, 'sax', v5.R)
    c = v8.lead_tone(norm(render(p).mean(axis=0, keepdims=True)), voice)
    c = fxc(c, [pb.PeakFilter(3300, -4.5, 0.6), pb.HighShelfFilter(2400, -2.5, 0.7)])     # v9: a darker, rounder tenor (less reed edge)
    q = Part(); q.prog(0, 24)                          # nylon guitar answers (was GM 26 muted jazz guitar)
    for b in range(NBM):
        r = v7.resp_bar(b)
        if b % 8 == 7 and r:                           # over B7#9: the Phrygian lean C -> B before the pickup into Em
            r = [(2.75, .25, 60, 80), (3.0, .2, 59, 78)] + [x for x in r if x[0] >= 3.25]
        for beat, d, k, v in r: q.n(bt(b, beat), d * BEAT * 1.15, 0, k, v - 2, jit=0.005, vj=6, late=0.016)
    r = tone(norm(render(q).mean(axis=0, keepdims=True)), 'nylon')
    return c + 0.55 * r * np.abs(c).max() / (np.abs(r).max() + 1e-9)

# ------------------------------------------------------------------ build, level match, encode


def make(stem):
    v7.seed(stem)
    x = p_theme() if stem == 'mel-theme' else p_song(stem[4:])
    return v8.proc(stem, np.atleast_2d(x), NBM)[:1]


ALL = ['mel-theme'] + ['mel-' + k for k in SONGS]


def stems(only=None):
    os.makedirs(WORK, exist_ok=True); v5.irs()
    p = int(PAD * SR); rep = []
    for name in (only or ALL):
        ref = LEVEL_REF.get(name[4:], name)
        old = v8.old_loop(ref)
        y = make(name).astype(np.float64)
        n_old = old.shape[1]
        assert abs(y.shape[1] - n_old) <= 2, (name, y.shape, old.shape)
        if y.shape[1] != n_old: y = y[:, :n_old] if y.shape[1] > n_old else np.pad(y, ((0, 0), (0, n_old - y.shape[1])), mode='wrap')
        y = y[:1]
        k = 10 ** ((v5.loud(v5.stereo(old)) - v5.loud(v5.stereo(y))) / 20); y = y * k     # same loudness as the v8 lead it replaces
        tp = v5.tp_db(y)
        if tp > -1.5: y = y * 10 ** ((-1.5 - tp) / 20)
        rep.append((name, v5.loud(v5.stereo(old)), v5.loud(v5.stereo(y)), v5.tp_db(old), v5.tp_db(y), y.shape[1] / SR))
        print('  %-22s ref %6.2f LUFS  new %6.2f LUFS  TP ref %5.1f new %5.1f  loop %.4f s' % (name, *rep[-1][1:]), flush=True)
        f = np.concatenate([y[:, -p:], y, y[:, :p]], axis=1)
        w = os.path.join(WORK, name + '.wav'); sf.write(w, f.T, SR, subtype='FLOAT')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', w, '-c:a', 'libopus', '-b:a', '40k', '-vbr', 'constrained', '-application', 'audio',
                        os.path.join(REPO_OUT, name + '.ogg')], check=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', w, '-c:a', 'aac', '-b:a', '56k', '-aac_pns', '0', '-movflags', '+faststart',
                        os.path.join(REPO_OUT, name + '.m4a')], check=True)
    return rep


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'stems'
    if cmd == 'stems': stems(sys.argv[2].split(',') if len(sys.argv) > 2 else None)
