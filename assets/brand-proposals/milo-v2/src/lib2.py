from lib import *
RAMP=np.array([[246,241,238],[234,230,235],[220,215,229],[202,197,219],[180,174,205],[150,142,180]],float)
def qramp(c):
    d=((RAMP-c)**2).sum(1); return RAMP[np.argmin(d)]
def grid_cells(hole,ox,oy,C):
    H,W=hole.shape; ys,xs=np.where(hole)
    for cy in range(oy+((ys.min()-oy)//C)*C, ys.max()+1, C):
        for cx in range(ox+((xs.min()-ox)//C)*C, xs.max()+1, C):
            sl=(slice(max(cy,0),max(cy+C,0)),slice(max(cx,0),max(cx+C,0)))
            if hole[sl].any(): yield cy,cx,sl
def fill2(img,hole,inside,seed=1,C=9,ox=0,oy=0,speck_p=0.06,fall=14,strands=True):
    rng=np.random.default_rng(seed); H,W,_=img.shape
    known_in=(~hole)&inside&(img.max(2)>125)
    known_bg=(~hole)&(~inside)&(img.max(2)<110)
    sm_in,_=ncv(img,known_in.astype(np.float32),9)
    sm_bg,_=ncv(img,known_bg.astype(np.float32),18)
    dist=cv2.distanceTransform(hole.astype(np.uint8),cv2.DIST_L2,5)
    out=img.copy()
    cells=list(grid_cells(hole,ox,oy,C))
    sp={}
    for cy,cx,sl in cells:
        if rng.random()<speck_p:
            L=rng.integers(1,4) if strands else 1; d=rng.choice([-1,1]); lvl=rng.choice([1,1,2])
            for i in range(L): sp[(cy+i*C,cx+d*i*C)]=lvl
    for cy,cx,sl in cells:
        yc=min(max(cy+C//2,0),H-1); xc=min(max(cx+C//2,0),W-1)
        hm=hole[sl]
        if inside[yc,xc]:
            w=np.exp(-dist[yc,xc]/fall)
            c=RAMP[0]*(1-w)+sm_in[yc,xc]*w
            c=qramp(c)
            if (cy,cx) in sp:
                i=min(int(np.argmin(((RAMP-c)**2).sum(1)))+sp[(cy,cx)],len(RAMP)-2); c=RAMP[i]
        else:
            c=sm_bg[yc,xc]
        out[sl][hm]=c
    return out
def draw_outline(out,inside,hole,C=9,ox=0,oy=0,rim=True):
    H,W=inside.shape
    cin=lambda y,x: inside[min(max(y,0),H-1),min(max(x,0),W-1)]
    for cy,cx,sl in list(grid_cells(hole,ox,oy,C)):
        yc,xc=cy+C//2,cx+C//2
        if not cin(yc,xc): continue
        nb=[cin(yc+dy*C,xc+dx*C) for dy,dx in ((0,1),(1,0),(0,-1),(-1,0))]
        if not all(nb): out[sl][hole[sl]]=OUTLINE
        elif rim:
            nb2=[cin(yc+dy*C,xc+dx*C) for dy,dx in ((0,2),(2,0),(0,-2),(-2,0),(1,1),(-1,1),(1,-1),(-1,-1))]
            if not all(nb2): out[sl][hole[sl]]=RAMP[3]
    return out
