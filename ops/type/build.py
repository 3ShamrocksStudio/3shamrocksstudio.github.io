"""Build three 3Shamrocks display-type directions from OFL bases (renamed, modified).
A  3S Cut   : Secular One  -> diagonal chamfers top-left + bottom-right, trefoil dots
B  3S Band  : Karantina Bold -> three bands (two horizontal cuts), 9deg forward lean
C  3S Leaf  : Varela Round -> curved rising "vein" cut, leaf-shaped dots
"""
import math, sys, os
import pathops
from fontTools.ttLib import TTFont
from fontTools.subset import Subsetter, Options
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.transformPen import TransformPen

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
OUT = os.path.join(HERE, 'out')
os.makedirs(OUT, exist_ok=True)

TEXT = ''.join(chr(c) for c in range(0x20, 0x7f)) + ''.join(chr(c) for c in range(0x5d0, 0x5eb)) + '·—–’‘“”…'
DOT_GLYPH_CHARS = set('ij.:;!?')


def rect(x0, y0, x1, y1):
    p = pathops.Path(); pen = p.getPen()
    pen.moveTo((x0, y0)); pen.lineTo((x0, y1)); pen.lineTo((x1, y1)); pen.lineTo((x1, y0)); pen.closePath()
    return p


def poly(pts):
    p = pathops.Path(); pen = p.getPen()
    pen.moveTo(pts[0])
    for q in pts[1:]:
        pen.lineTo(q)
    pen.closePath(); return p


def circle(cx, cy, r, n=64):
    return poly([(cx + r * math.cos(2 * math.pi * i / n), cy + r * math.sin(2 * math.pi * i / n)) for i in range(n)][::-1])


def trefoil(cx, cy, size):
    """Three overlapping circles = shamrock dot, fits a box of ~size."""
    r = size * 0.25
    d = size * 0.27
    out = pathops.Path()
    for k in range(3):
        a = math.pi / 6 + k * 2 * math.pi / 3
        c = circle(cx + d * math.cos(a), cy + size * 0.22 + d * math.sin(a), r)
        out = pathops.op(out, c, pathops.PathOp.UNION, fix_winding=True, clockwise=True)
    return out


def leaf(cx, cy, size):
    """Vesica (leaf) tilted 45deg."""
    L = size * 0.62; W = size * 0.30; n = 24
    pts = []
    for i in range(n + 1):
        t = -1 + 2 * i / n
        pts.append((t * L, W * (1 - t * t)))
    for i in range(n + 1):
        t = 1 - 2 * i / n
        pts.append((t * L, -W * (1 - t * t)))
    a = math.radians(45)
    pts = [(cx + x * math.cos(a) - y * math.sin(a), cy + x * math.sin(a) + y * math.cos(a)) for x, y in pts]
    return poly(pts[::-1])


def contours(path):
    for c in path.contours:
        yield c


def bbox(p):
    return p.bounds  # (xMin, yMin, xMax, yMax)


def glyph_path(gs, name):
    p = pathops.Path()
    gs[name].draw(pathops.PathPen(p, gs))
    p.simplify(fix_winding=True, clockwise=True)
    return p


def replace_dots(path, char, maker, xh):
    if char not in DOT_GLYPH_CHARS:
        return path
    if path.area == 0:
        return path
    out = pathops.Path(); changed = False
    for c in contours(path):
        b = c.bounds
        w, h = b[2] - b[0], b[3] - b[1]
        small = abs(c.area) < (xh * 0.30) ** 2 and max(w, h) < xh * 0.45
        if small and not c.clockwise is None:
            s = max(w, h) * (1.05 if maker is trefoil else 1.25)
            dot = maker((b[0] + b[2]) / 2, (b[1] + b[3]) / 2, s)
            out = pathops.op(out, dot, pathops.PathOp.UNION, fix_winding=True, clockwise=True); changed = True
        else:
            cp = pathops.Path(); c.draw(cp.getPen())
            out = pathops.op(out, cp, pathops.PathOp.UNION, fix_winding=True, clockwise=True)
    return out if changed else path


def treat_cut(path, ctx, char):
    path = replace_dots(path, char, trefoil, ctx['xh'])
    xmin, ymin, xmax, ymax = bbox(path)
    if xmax - xmin < 1:
        return path
    he = bool(char) and 0x5d0 <= ord(char) <= 0x5ea
    c = min(ctx['upm'] * (0.10 if he else 0.17), (xmax - xmin) * 0.40, (ymax - ymin) * 0.40)
    m = 2
    clip = poly([(xmin - m, ymin - m), (xmin - m, ymax - c), (xmin + c, ymax + m), (xmax + m, ymax + m), (xmax + m, ymin + c), (xmax - c, ymin - m)][::-1])
    return pathops.op(path, clip, pathops.PathOp.INTERSECTION, fix_winding=True, clockwise=True)


def treat_band(path, ctx, char):
    xmin, ymin, xmax, ymax = bbox(path)
    if xmax - xmin < 1:
        return path
    g = ctx['upm'] * 0.05
    ch = ctx['cap']
    ys = (ch * 0.33, ch * 0.62) if ymax > ch * 0.85 else (ctx['xh'] * 0.48,)
    for y in ys:
        if ymin < y < ymax:
            path = pathops.op(path, rect(xmin - 50, y - g / 2, xmax + 50, y + g / 2), pathops.PathOp.DIFFERENCE, fix_winding=True, clockwise=True)
    return path


def treat_leaf(path, ctx, char):
    path = replace_dots(path, char, leaf, ctx['xh'])
    xmin, ymin, xmax, ymax = bbox(path)
    if xmax - xmin < 1 or ymax - ymin < ctx['xh'] * 0.5:
        return path
    g = ctx['upm'] * 0.042
    # circle through (xmin, y0) and (xmax, y1), radius R, centre below-right -> gently rising vein
    top = min(ymax, ctx['cap'])
    y0, y1 = ymin + (top - ymin) * 0.30, ymin + (top - ymin) * 0.58
    R = ctx['upm'] * 1.5
    x0 = xmin - 20; x1 = xmax + 20
    mx, my = (x0 + x1) / 2, (y0 + y1) / 2
    dx, dy = x1 - x0, y1 - y0
    d = math.hypot(dx, dy)
    if d >= 2 * R:
        return path
    hh = math.sqrt(R * R - (d / 2) ** 2)
    # perpendicular pointing up-left; the centre goes the other way (down-right) so the arc bulges up-left
    ux, uy = -dy / d, dx / d
    cx, cy = mx - ux * hh, my - uy * hh
    ring = pathops.op(circle(cx, cy, R + g / 2, 360), circle(cx, cy, R - g / 2, 360), pathops.PathOp.DIFFERENCE, fix_winding=True, clockwise=True)
    return pathops.op(path, ring, pathops.PathOp.DIFFERENCE, fix_winding=True, clockwise=True)


def drop_slivers(path, ctx):
    lim = (ctx['upm'] * 0.03) ** 2
    out = pathops.Path(); dropped = False
    for c in path.contours:
        b = c.bounds
        if abs(c.area) < lim or min(b[2]-b[0], b[3]-b[1]) < ctx['upm'] * 0.02:
            dropped = True; continue
        cp = pathops.Path(); c.draw(cp.getPen())
        out = pathops.op(out, cp, pathops.PathOp.XOR, fix_winding=True, clockwise=True)
    return out if dropped else path


def build(src, family, treat, skew_deg=0.0):
    f = TTFont(os.path.join(SRC, src))
    opts = Options(); opts.layout_features = ['kern', 'liga']; opts.name_IDs = []; opts.notdef_outline = True
    sub = Subsetter(opts); sub.populate(text=TEXT); sub.subset(f)
    upm = f['head'].unitsPerEm
    os2 = f['OS/2']
    cmap = f.getBestCmap(); rev = {}
    for cp, gn in cmap.items():
        rev.setdefault(gn, chr(cp))
    gs = f.getGlyphSet()
    def h(ch):
        gn = cmap.get(ord(ch));
        return bbox(glyph_path(gs, gn))[3] if gn else upm * 0.7
    ctx = {'upm': upm, 'cap': getattr(os2, 'sCapHeight', 0) or h('H'), 'xh': getattr(os2, 'sxHeight', 0) or h('x')}
    new = {}
    k = math.tan(math.radians(skew_deg))
    for gn in f.getGlyphOrder():
        if gn == '.notdef':
            continue
        p = glyph_path(gs, gn)
        if p.area == 0:
            continue
        p = drop_slivers(treat(p, ctx, rev.get(gn, '')), ctx)
        tp = TTGlyphPen(None)
        pen = Cu2QuPen(tp, 1.0, reverse_direction=False)
        if k:
            pen = TransformPen(pen, (1, 0, k, 1, -k * ctx['xh'] / 2, 0))
        p.draw(pen)
        new[gn] = tp.glyph()
    glyf = f['glyf']
    for gn, g in new.items():
        glyf[gn] = g
        g.recalcBounds(glyf)
        adv, _ = f['hmtx'][gn]
        f['hmtx'][gn] = (adv, g.xMin if hasattr(g, 'xMin') else 0)
    # names: OFL derivative, Reserved Font Names not used
    name = f['name']
    for rec in list(name.names):
        name.removeNames(nameID=rec.nameID)
    ps = family.replace(' ', '')
    for nid, val in {1: family, 2: 'Regular', 3: f'3Shamrocks:{ps}:2026', 4: family, 5: 'Version 0.1 (direction draft, 17 Nov 2026)', 6: ps + '-Regular',
                     0: f'Modified 2026 by 3Shamrocks Studio from an SIL OFL 1.1 font ({src}); original copyright retained in the bundled licence.',
                     13: 'This Font Software is licensed under the SIL Open Font License, Version 1.1.', 14: 'https://openfontlicense.org'}.items():
        name.setName(val, nid, 3, 1, 0x409)
    if 'CFF ' in f:
        raise SystemExit('unexpected CFF')
    out = os.path.join(OUT, ps + '.woff2')
    f.flavor = 'woff2'; f.save(out)
    f.flavor = None; f.save(os.path.join(OUT, ps + '.ttf'))
    print(family, 'glyphs modified:', len(new), 'ctx', ctx, '->', os.path.getsize(out), 'bytes')


build('SecularOne-Regular.ttf', '3S Cut', treat_cut)
build('Karantina-Bold.ttf', '3S Band', treat_band, skew_deg=7)
build('VarelaRound-Regular.ttf', '3S Leaf', treat_leaf)
