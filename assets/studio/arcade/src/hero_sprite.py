"""Dave minime hero sprite, hand-placed pixels. Paper-doll parts composed into frames."""
PAL = {
 'o': '#140d1c',  # outline
 'K': '#2b2833', 'k': '#4d4859', 'q': '#17141d', 'm': '#615b70',  # cap
 'S': '#f2bf94', 's': '#d38f69', 'd': '#a8664d', 'h': '#ffe0c2',  # skin
 'B': '#7a4527', 'b': '#4f2a16', 'r': '#a8693f',  # beard / brows
 'W': '#fbf6ee', 'G': '#4fae5a', 'g': '#2d7a3c', 'P': '#120c18',  # eyes
 'T': '#211e29', 't': '#3b3645', 'u': '#110e16',  # tee
 'L': '#8be36a', 'l': '#2fb7c9', 'v': '#9b59f7', 'y': '#e3b24a',  # tee logo
 'J': '#3b3b48', 'j': '#272631', 'i': '#5a5a6b',  # jeans
 'N': '#56607c',  # tattoo ink
 'Z': '#16141c', 'z': '#46424f',  # shoes
 'C': '#c9ccdc', 'c': '#717489',  # chain
 'E': '#e6e6f2',  # earring
}

W = 28
HEAD = [
"..........oooooooo..........",
"........ookkKKKKKKoo........",
".......okkKKKKKKKKKKo.......",
"......okKKKKKKKKKKKKKo......",
".....okKKKKKKKKKKKKKKKo.....",
".....oKKKKKKKKKKKKKKKKKoo...",
"....oKqqqqqqqqqqqqqqqKKmmoo.",
"....oqmqqmqqmqqmqqmqqqKKKmmo",
"....oqSShSSSSSSSSSSSSqoKKKKo",
"...obShhSSSSSSSSSSSSSsoqqqqo",
"...oSbbbbbSSSSSSbbbbbSsooooo",
"..osSWWWWSSSSSSSSWWWWSsSo...",
"..osSWGGPWSSSSSSWPGGWSssSo..",
"..odSWGgPWSSShSSWPgGWSsdSoE.",
"...osSWWWSSSSSSSSWWWSssso...",
"...osSSSSSSSSsSSSSSSSSsso...",
"...oBBSSSSSSsssSSSSSSsBBo...",
"...oBBrBBbbBBBBBBbbBBrBBo...",
"...oBBBBbBBdSSSSdBBbBBBBo...",
"...oBBBBBBBBbbbbBBBBBBBBo...",
"....oBBrBBBBBBBBBBBBBBBo....",
"....obBBBBBBrBBrBBBBBBbo....",
".....obBBBBBBBBBBBBBBbo.....",
"......oobBBBBBBBBBBboo......",
"........oobbbbbbbboo........",
]
# eye variants replace rows 11..14 (indexes)
EYES = {
'open': None,
'blink': [
"..osSSSSSSSSSSSSSSSSSSsSo...",
"..osSSSSSSSSSSSSSSSSSSssSo..",
"..odSbbbbbSSShSSbbbbbSsdSoE.",
"...osSSSSSSSSSSSSSSSSssso...",
],
'fierce': [
"..osSbbWWSSSSSSSSWWbbSsSo...",
"..osSWWGPbSSSSSSbPGWWSssSo..",
"..odSWGgPWSSShSSWPgGWSsdSoE.",
"...osSSWWSSSSSSSSWWSSssso...",
],
}

# torso frames: (rows, extra_rows_above). Rows overlay starting at head_len-2-extra.
TORSO = {
'idle': (0, [
".......ooo.oTTTTTTo.ooo.....",
"......otTTooTTTTTToTTTTo....",
".....otttTTTTTTTTTTTTTTTo...",
"....ottTTTTTTTTTTTTTTTTuTo..",
"....otTTTTTTTLLTLLTTTTTuTo..",
"....oTTTTTTTlLLLLLvTTTTuTo..",
"....oSotTTTTlllLvvvTTTTuoSo.",
"...oSNotTTTTvlyyyvTTTTuToNSo",
"...ohNotTTTTTyyyyyTTTTuToNso",
"...oNSotTTTTTTTTTTTTTTuToSNo",
"...ohNoTTTTTTTTTTTTTTTuToNso",
"...ohSouTTTTTTTTTTTTTTTuosso",
"...osSoooooooooooooooooooSso",
"...ohSSojjjjjjjjjjCjjjjoSSso",
"...osSsoJJJJJJJJJJJCJJJosdso",
"....ooo.oJJJJJJJJJJcJJo.ooo.",
]),
}

ARM_UP = [  # right arm raised, rows above shoulder; cols in sprite space
"............................oooo...",
"...........................ohSSSo..",
"...........................oSShSso.",
"...........................osSSSso.",
"............................osssoo.",
"...........................oSNSo...",
"..........................oSNSo....",
"..........................oNSso....",
".........................oSNSo.....",
"........................ohSso......",
".......................ohSNo.......",
]
BODY_NOARM_R = [
".......ooo.oTTTTTTo.ooootto.",
"......otTTooTTTTTToTTTtTTo..",
".....otttTTTTTTTTTTTTTTTo...",
"....ottTTTTTTTTTTTTTTTTuo...",
"....otTTTTTTTLLTLLTTTTTuo...",
"....oTTTTTTTlLLLLLvTTTTuo...",
"....oSotTTTTlllLvvvTTTTuo...",
"...oSNotTTTTvlyyyvTTTTTuo...",
"...ohNotTTTTTyyyyyTTTTTuo...",
"...oNSotTTTTTTTTTTTTTTTuo...",
"...ohNoTTTTTTTTTTTTTTTTuo...",
"...ohSouTTTTTTTTTTTTTTTuo...",
"...osSooooooooooooooooooo...",
"...ohSSojjjjjjjjjjCjjjjo....",
"...osSsoJJJJJJJJJJJCJJJo....",
"....ooo.oJJJJJJJJJJcJJo.....",
]
BODY_NOARM_BOTH = [
"....ottoooTTTTTTo.ooootto...",
".....otTTooTTTTTToTTTtTo....",
".....otttTTTTTTTTTTTTTTo....",
"....ottTTTTTTTTTTTTTTTuo....",
"....otTTTTTTTLLTLLTTTTuo....",
"....oTTTTTTTlLLLLLvTTTuo....",
"....otTTTTTTlllLvvvTTTuo....",
"....otTTTTTTvlyyyvTTTTuo....",
"....otTTTTTTTyyyyyTTTTuo....",
"....otTTTTTTTTTTTTTTTTuo....",
"....otTTTTTTTTTTTTTTTTuo....",
"....ouTTTTTTTTTTTTTTTuuo....",
"....oooooooooooooooooooo....",
"....ojjjjjjjjjjjCjjjjjo.....",
"....oJJJJJJJJJJJJCJJJJo.....",
".....oJJJJJJJJJJJcJJJo......",
]
def _mirror(rows):
    out=[]
    for r in rows:
        cells={}
        for x,ch in enumerate(r):
            if ch!='.': cells[27-x]=ch
        mn=min(cells) if cells else 0
        out.append(cells)
    return out
TORSO['punch'] = (0, [
".......ooo.oTTTTTTo.ooo...............",
"......otTTooTTTTTToTTTTooooooooo.oooo.",
".....otttTTTTTTTTTTTTTtTShSShSShoohSSSo",
".....ttTTTTTTTTTTTTTTTtTSNSSNSSNooSShSso",
"....otTTTTTTTLLTLLTTTTuTsssssssssoSSSSso",
"....oTTTTTTTlLLLLLvTTTuooooooooooososso.",
"....oSotTTTTlllLvvvTTTuo.........oooo..",
"...oSNotTTTTvlyyyvTTTTuo..............",
"...ohNotTTTTTyyyyyTTTTuo..............",
"...oNSotTTTTTTTTTTTTTTuo..............",
"...ohNoTTTTTTTTTTTTTTTuo..............",
"...ohSouTTTTTTTTTTTTTTuo..............",
"...osSoooooooooooooooooo..............",
"...ohSSojjjjjjjjjjCjjjo...............",
"...osSsoJJJJJJJJJJJCJJo...............",
"....ooo.oJJJJJJJJJJcJo................",
])

LEGS = {
'stand': [
"........oJJJJoJJJJJCo.......",
"........oJiJJooJiJJco.......",
"........oJiJjooJiJJCo.......",
"........oJJJjooJJJJjo.......",
"........oJJJjooJJJJjo.......",
"........oJJJjooJJJJjo.......",
".......ooZZZZooZZZZZoo......",
".......ozzZZZoozzZZZZo......",
".......ooooooooooooooo......",
],
'walk1': [
".........oJJJJoJJJJCo.......",
"........oJiJJo.oJJJco.......",
".......oJiJjo..oJiJCo.......",
"......oJJJjo...oJJJjo.......",
".....oJJJjo....oJJJjo.......",
"....ooZZZo.....oJJJjoo......",
"...ozzZZZo....oZZZZZZo......",
"...oooooo.....ozzZZZZZo.....",
"..............ooooooooo.....",
],
'walk2': [
"........oJJJJoJJJJJCo.......",
"........oJiJJooJiJJco.......",
"........oJiJjooJiJjCo.......",
".........oJJjooJJJjo........",
".........oJJjooJJjjo........",
"........ooJJjooZZZZo........",
".......oZZZZZoozzZZo........",
".......ozzZZZo.ooooo........",
".......ooooooo..............",
],
'walk3': [
"........oJJJJoJJJJCo........",
"........oJiJJo.oJiJo........",
"........oJiJjo..oJiJo.......",
"........oJJJjo...oJJJo......",
"........oJJJjo....oJJJo.....",
".......ooJJJjo.....oZZZoo...",
"......oZZZZZZo.....ozzZZZo..",
".....ozzZZZZZo......oooooo..",
".....ooooooooo..............",
],
'crouch': [
".......oJJJJJoJJJJJJCo......",
"......oJiJJJo.oJJiJJco......",
".....oJiJjjo...ojJiJCo......",
"....ooZZZZo.....oZZZZZo.....",
"...ozzZZZZo.....ozzZZZZo....",
"...ooooooooo....ooooooooo...",
],
'jump': [
"........oJJJJoJJJJJCo.......",
"........oJiJJooJiJJco.......",
".........oJJjooJJJjo........",
".........ooZZooZZZoo........",
"........ozzZZoozzZZo........",
"........oooooooooooo........",
],
}


def cells(rows, dx=0, dy=0, mirror=False):
    out = {}
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            if ch != '.':
                out[((27 - x) if mirror else x) + dx, y + dy] = ch
    return out


def frame(torso='idle', legs='stand', eyes='open', head_dy=0):
    head = list(HEAD)
    if EYES.get(eyes):
        head[11:15] = EYES[eyes]
    ts = len(head) - 2          # torso top row
    layers = []
    if torso == 'up':
        body = BODY_NOARM_R; arms = [cells(ARM_UP, dy=ts - 10)]
    elif torso == 'cheer':
        body = BODY_NOARM_BOTH; arms = [cells(ARM_UP, dy=ts - 10), cells(ARM_UP, dy=ts - 10, mirror=True)]
    else:
        body = TORSO[torso][1]; arms = []
    lg = LEGS[legs]
    ly = ts + len(body) - 1
    layers.append(cells(lg, dy=ly))
    layers.append(cells(body, dy=ts))
    hc = cells(head, dy=head_dy)
    layers.append(hc)
    layers += arms
    out = {}
    for L in layers:
        out.update(L)
    return out


def bounds(c):
    xs = [p[0] for p in c]; ys = [p[1] for p in c]
    return min(xs), min(ys), max(xs), max(ys)


def check():
    for name, part in [('HEAD', HEAD), ('ARM', ARM_UP), ('BNR', BODY_NOARM_R), ('BNB', BODY_NOARM_BOTH)] + [('T.' + k, v[1]) for k, v in TORSO.items()] + [('L.' + k, v) for k, v in LEGS.items()] + [('E.' + k, v) for k, v in EYES.items() if v]:
        for i, r in enumerate(part):
            for ch in r:
                if ch != '.' and ch not in PAL:
                    print('bad ch', name, i, ch)
