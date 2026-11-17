#!/usr/bin/env python3
"""ig_audit.py: automated half of the Instagram pre-post gate (ops/content/ig-identity/AUDIT-GATE.md).

Usage:
  python3 ops/tools/ig_audit.py <post-folder-or-files...> [--out DIR] [--account lickpick|shomer|studio|...]
                                [--tessdata DIR] [--dup 6]

Input: a carousel folder (jpg/png slides, sorted by name) and/or reel videos (mp4/mov).
For each post it writes to --out (default: <first input>/_audit):
  contact-sheet.jpg  every slide, or every reel frame at 0.5 s, numbered
  report.md / report.json  checks, flags and a PASS/FAIL line
Checks (machine):
  1. near-duplicate slides (perceptual hash, Hamming <= --dup); for reels, the same frame
     coming back more than 2 s later
  2. text outside the safe zone (OCR boxes via tesseract): 4:5 slides x 60-1020, y 100-1240;
     9:16 frames x 60-1020, y 250-1500 (scaled for other sizes)
  3. leftover UI / debug words (tap anywhere, sound on, 9:41, lorem, undefined, NaN, localhost, TODO...)
  4. spelling traps: "takes" on LickPick, "SHOMER"/"Shomer" spelt without the star in text
  5. reels only: loudness (-14 LUFS +/-1), true peak <= -1 dBTP, clipped samples
Exit code 0 = PASS, 1 = FAIL. A PASS here is only half the gate: a blind reviewer must also PASS it.
"""
import argparse, json, os, re, shutil, subprocess, sys, tempfile
import numpy as np
from PIL import Image, ImageDraw, ImageFont

LEFTOVER = [r'tap anywhere', r'for sound', r'sound on', r'\b9:41\b', r'lorem', r'ipsum', r'undefined', r'\bnan\b', r'\bnull\b',
            r'localhost', r'127\.0\.0', r'\btodo\b', r'\bfixme\b', r'\bdebug\b', r'placeholder', r'console', r'\[object']

def phash(img):
    from scipy.fftpack import dct
    a = np.asarray(img.convert('L').resize((32, 32), Image.LANCZOS), dtype=np.float32)
    d = dct(dct(a, axis=0, norm='ortho'), axis=1, norm='ortho')[:8, :8]
    return (d > np.median(d)).flatten()

def safe_box(w, h):
    if h / w > 1.6:  # 9:16
        s = h / 1920.0; return 60 * w / 1080, 250 * s, 1020 * w / 1080, 1500 * s
    s = h / 1350.0; return 60 * w / 1080, 100 * s, 1020 * w / 1080, 1240 * s

def ocr(path, langs, tessdata):
    env = dict(os.environ)
    if tessdata: env['TESSDATA_PREFIX'] = tessdata
    try:
        out = subprocess.run(['tesseract', path, '-', '-l', langs, '--psm', '11', '-c', 'tessedit_create_tsv=1'], capture_output=True, text=True, env=env, timeout=120).stdout
    except Exception as e:
        return None, str(e)
    words = []
    for line in out.splitlines()[1:]:
        p = line.split('\t')
        if len(p) < 12 or not p[11].strip(): continue
        try: conf = float(p[10])
        except ValueError: continue
        if conf < 55: continue
        x, y, w, h = map(int, p[6:10]); words.append(dict(t=p[11].strip(), x=x, y=y, w=w, h=h, c=conf))
    return words, None

def langs_available(tessdata):
    env = dict(os.environ)
    if tessdata: env['TESSDATA_PREFIX'] = tessdata
    try: l = subprocess.run(['tesseract', '--list-langs'], capture_output=True, text=True, env=env).stdout.split()
    except Exception: return None
    return '+'.join(x for x in ('eng', 'heb') if x in l) or None

def frames_from_video(v, tmp):
    d = os.path.join(tmp, os.path.basename(v) + '_f'); os.makedirs(d, exist_ok=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', v, '-vf', 'fps=2', os.path.join(d, 'f%04d.jpg')], check=True)
    return sorted(os.path.join(d, f) for f in os.listdir(d))

def loudness(v):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', v, '-af', 'ebur128=peak=true,astats=metadata=0', '-f', 'null', '-'], capture_output=True, text=True).stderr
    if 'Audio' not in r and 'audio' not in r: return None
    i = re.findall(r'I:\s+(-?[\d.]+) LUFS', r); tp = re.findall(r'Peak:\s+(-?[\d.]+|-inf) dBFS', r)
    clip = re.findall(r'Number of (?:clipped|peaks)[^:]*:\s*(\d+)', r)
    pk = re.findall(r'Peak level dB:\s*(-?[\d.]+|-inf)', r)
    return dict(lufs=float(i[-1]) if i else None, true_peak=float(tp[-1]) if tp and tp[-1] != '-inf' else None,
                sample_peak=float(pk[-1]) if pk and pk[-1] != '-inf' else None)

def sheet(paths, labels, out, cols=6, tw=240):
    ims = [Image.open(p).convert('RGB') for p in paths]
    th = int(tw * ims[0].height / ims[0].width)
    rows = (len(ims) + cols - 1) // cols
    S = Image.new('RGB', (cols * (tw + 8) + 8, rows * (th + 34) + 8), '#222')
    d = ImageDraw.Draw(S)
    try: f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
    except Exception: f = ImageFont.load_default()
    for k, (im, lab) in enumerate(zip(ims, labels)):
        x, y = 8 + (k % cols) * (tw + 8), 8 + (k // cols) * (th + 34)
        S.paste(im.resize((tw, th)), (x, y)); d.text((x, y + th + 6), lab, fill='#fff', font=f)
    S.save(out, quality=85)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('inputs', nargs='+'); ap.add_argument('--out'); ap.add_argument('--account', default='')
    ap.add_argument('--tessdata', default=os.environ.get('TESSDATA_PREFIX')); ap.add_argument('--dup', type=int, default=6)
    a = ap.parse_args()
    imgs, vids = [], []
    for p in a.inputs:
        if os.path.isdir(p):
            for f in sorted(os.listdir(p)):
                fp = os.path.join(p, f)
                if f.startswith('_'): continue
                if f.lower().endswith(('.jpg', '.jpeg', '.png')): imgs.append(fp)
                elif f.lower().endswith(('.mp4', '.mov')): vids.append(fp)
        elif p.lower().endswith(('.mp4', '.mov')): vids.append(p)
        else: imgs.append(p)
    out = a.out or os.path.join(a.inputs[0] if os.path.isdir(a.inputs[0]) else os.path.dirname(a.inputs[0]), '_audit')
    os.makedirs(out, exist_ok=True); tmp = tempfile.mkdtemp()
    langs = langs_available(a.tessdata)
    rep = dict(account=a.account, ocr_langs=langs, items=[], fails=[], warns=[])

    def check_frames(paths, labels, kind, src):
        hashes = [phash(Image.open(p)) for p in paths]
        for i in range(len(paths)):
            for j in range(i + 1, len(paths)):
                dist = int((hashes[i] != hashes[j]).sum())
                if dist > a.dup: continue
                if kind == 'slide': rep['fails'].append('%s: slides %s and %s are near-duplicates (pHash distance %d)' % (src, labels[i], labels[j], dist))
                elif (j - i) > 4 and all(int((hashes[k] != hashes[i]).sum()) > a.dup for k in range(i + 1, j)):
                    rep['warns'].append('%s: frame %s repeats at %s (check for a looped or repeated shot)' % (src, labels[i], labels[j]))
        if not langs:
            rep['warns'].append('tesseract not available: edge-text, leftover-UI and spelling checks skipped; the reviewer must do them by eye'); return
        step = 1 if kind == 'slide' else 2  # reels: OCR every 2nd sampled frame (1 s)
        for k in range(0, len(paths), step):
            p = paths[k]; w, h = Image.open(p).size; x0, y0, x1, y1 = safe_box(w, h)
            words, err = ocr(p, langs, a.tessdata)
            if err: rep['warns'].append('OCR error on %s: %s' % (labels[k], err)); continue
            text = ' '.join(x['t'] for x in words)
            for wd in words:
                # ignore OCR noise from photos and art: needs 2+ letters in a row and good confidence
                if wd['c'] < 70 or not re.search(r'[A-Za-z\u0590-\u05FF]{2,}', wd['t']): continue
                if wd['x'] < x0 or wd['y'] < y0 or wd['x'] + wd['w'] > x1 or wd['y'] + wd['h'] > y1:
                    rep['fails'].append('%s %s: text "%s" outside the safe zone at x%d y%d' % (src, labels[k], wd['t'], wd['x'], wd['y']))
                if wd['x'] <= 2 or wd['y'] <= 2 or wd['x'] + wd['w'] >= w - 2 or wd['y'] + wd['h'] >= h - 2:
                    rep['fails'].append('%s %s: text "%s" touches the frame edge (clipped?)' % (src, labels[k], wd['t']))
            low = text.lower()
            for pat in LEFTOVER:
                if re.search(pat, low): rep['fails'].append('%s %s: leftover UI/debug text matches "%s"' % (src, labels[k], pat))
            if 'lickpick' in a.account.lower() and re.search(r'\btakes?\b', low):
                rep['fails'].append('%s %s: says "take(s)"; LickPick says "licks"' % (src, labels[k]))
            if re.search(r'\bshomer\b', low):
                rep['warns'].append('%s %s: "SHOMER" read by OCR; fine inside the badge/logo art, wrong in running text (must be SH✡MER)' % (src, labels[k]))

    if imgs:
        labs = ['%02d' % (i + 1) for i in range(len(imgs))]
        sheet(imgs, labs, os.path.join(out, 'contact-sheet.jpg'), cols=min(8, len(imgs)), tw=270)
        sizes = set(Image.open(p).size for p in imgs)
        if len(sizes) > 1: rep['fails'].append('slides have mixed sizes: %s' % sizes)
        for s in sizes:
            if s not in ((1080, 1350), (1080, 1920), (1080, 1080)): rep['warns'].append('unusual size %s' % (s,))
        check_frames(imgs, labs, 'slide', 'carousel')
        rep['items'].append(dict(type='carousel', slides=len(imgs)))
        if not (2 <= len(imgs) <= 20): rep['fails'].append('carousel must have 2-20 slides, has %d' % len(imgs))
    for v in vids:
        fr = frames_from_video(v, tmp); labs = ['%.1fs' % (i * 0.5) for i in range(len(fr))]
        base = os.path.splitext(os.path.basename(v))[0]
        sheet(fr, labs, os.path.join(out, base + '-frames.jpg'), cols=10, tw=160)
        check_frames(fr, labs, 'reel', base)
        L = loudness(v); item = dict(type='reel', file=v, frames=len(fr), audio=L)
        if L is None: rep['warns'].append('%s: no audio track' % base)
        else:
            if L['lufs'] is None or abs(L['lufs'] + 14) > 1: rep['fails'].append('%s: loudness %s LUFS, target -14 +/-1' % (base, L['lufs']))
            if L['true_peak'] is not None and L['true_peak'] > -1.0: rep['fails'].append('%s: true peak %.1f dBTP > -1' % (base, L['true_peak']))
            if L['sample_peak'] is not None and L['sample_peak'] >= -0.1: rep['fails'].append('%s: sample peak %.2f dBFS, clipping' % (base, L['sample_peak']))
        rep['items'].append(item)
    rep['result'] = 'FAIL' if rep['fails'] else 'PASS'
    json.dump(rep, open(os.path.join(out, 'report.json'), 'w'), indent=1, ensure_ascii=False)
    md = ['# ig_audit report', '', 'Result (machine half): **%s**' % rep['result'], 'OCR: %s' % (langs or 'none'), '']
    md += ['## Fails'] + ['- ' + x for x in rep['fails']] + ['', '## Warnings'] + ['- ' + x for x in rep['warns']] + ['', '## Items'] + ['- %s' % json.dumps(i, ensure_ascii=False) for i in rep['items']]
    md += ['', 'Machine PASS is half the gate. The blind reviewer must also PASS every line of AUDIT-GATE.md.']
    open(os.path.join(out, 'report.md'), 'w').write('\n'.join(md))
    shutil.rmtree(tmp, ignore_errors=True)
    print(rep['result'], '| fails:', len(rep['fails']), '| warns:', len(rep['warns']), '|', out)
    sys.exit(1 if rep['fails'] else 0)

if __name__ == '__main__':
    main()
