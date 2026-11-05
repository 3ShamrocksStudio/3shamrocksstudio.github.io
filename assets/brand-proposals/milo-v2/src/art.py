from lib2 import *
OX,OY,C=3,4,9
COL={'D':(22,14,40),'I':(70,54,128),'W':(255,255,255),'w':(206,222,255),'s':tuple(RAMP[1]),'S':tuple(RAMP[2]),
     'T':tuple(RAMP[3]),'P':(247,150,196),'p':(250,196,220),'K':(236,64,150),'M':(58,18,62),'B':(150,212,255),'b':(206,236,255)}
def cellxy(i,j): return OX+i*C, OY+j*C
def sprite(img,i0,j0,rows):
    for dj,row in enumerate(rows):
        for di,ch in enumerate(row):
            if ch=='.': continue
            x,y=cellxy(i0+di,j0+dj); img[y:y+C,x:x+C]=COL[ch]
    return img
def ij(x,y): return round((x-OX)/C), round((y-OY)/C)
FALL=12
def build_noshade():
    img=load(); H,W,_=img.shape
    yy,xx=np.mgrid[0:H,0:W]
    m0=np.load('shade_mask.npy')
    m=cv2.dilate(m0.astype(np.uint8),np.ones((11,11),np.uint8)).astype(bool)
    nose=((xx-837)/60.)**2+((yy-424)/54.)**2<1
    grow=cv2.dilate(m0.astype(np.uint8),np.ones((49,49),np.uint8)).astype(bool)
    halo=grow&((img.min(2)>140)|(xx>880))&~nose&(xx<960)&(yy>255)&(xx>=560)
    hole=cellify((m|halo)&(xx<1000),ox=OX,oy=OY,thr=0.15)&~nose
    rng=np.random.default_rng(9)
    for cy,cx,sl in list(grid_cells(hole,OX,OY,C)):
        if cx>=560 and hole[sl].all() and rng.random()<0.5 and cy-C>0:
            if not hole[cy-C+C//2, cx+C//2] and img[cy-C:cy, max(cx,0):cx+C].min()>150: hole[cy-C:cy, max(cx,0):cx+C]=True
    xc=893+(yy-262)*(33/150.)+9*np.sin(np.pi*np.clip((yy-262)/150.,0,1))
    inside=cellify(xx<xc,ox=OX,oy=OY,thr=0.5)
    import lib2 as _l
    g=globals(); _q=g['qramp']; g['qramp']=qramp_nolight
    out=fill_region(img,hole,inside,seed=5,fall=7,kmin=200)
    g['qramp']=_q
    # textured fallback B: inpaint + cell median, full ramp
    B=cv2.inpaint(img.astype(np.uint8),hole.astype(np.uint8)*255,12,cv2.INPAINT_TELEA).astype(np.float32)
    dist=cv2.distanceTransform(hole.astype(np.uint8),cv2.DIST_L2,5)
    for cy,cx,sl in grid_cells(hole,OX,OY,C):
        yc=min(cy+C//2,H-1); xc_=min(cx+C//2,W-1)
        if not inside[yc,xc_]: continue
        use = (cx<478)
        if use:
            c=np.median(B[sl].reshape(-1,3),0)
            out[sl][hole[sl]]=dq(c,rng)
    bgh=hole&~inside
    Bbg=cv2.inpaint(img.astype(np.uint8),(hole|(inside&(xx>780))|(img.min(2)>120)&(xx>780)).astype(np.uint8)*255,20,cv2.INPAINT_TELEA).astype(np.float32)
    out[bgh]=Bbg[bgh]
    out=rim_outline(out,inside,hole&(xx>850),seed=2)
    return out
def dq(c,rng):
    d=np.sqrt(((RAMP-c)**2).sum(1)); o=np.argsort(d); a,b=o[0],o[1]
    p=d[a]/(d[a]+d[b]+1e-6)
    return RAMP[b] if rng.random()<p else RAMP[a]
def fill_region(img,hole,inside,seed,fall=7,kmin=200,speck_p=0.035,sig=12,dither=False,kmax=None,gap=0):
    H,W,_=img.shape
    rng=np.random.default_rng(seed)
    known_in=(~hole)&inside&((img.min(2)>kmin) if kmax is None else (img.max(2)>kmax))
    if gap: known_in&=~cv2.dilate(hole.astype(np.uint8),np.ones((2*gap+1,2*gap+1),np.uint8)).astype(bool)
    known_bg=(~hole)&(~inside)&(img.max(2)<100)
    sm_in,_=ncv(img,known_in.astype(np.float32),sig)
    wr,_=ncv(img,((~hole)&inside&(img.min(2)>226)).astype(np.float32),30)
    sm_bg,_=ncv(img,known_bg.astype(np.float32),40)
    dist=cv2.distanceTransform(hole.astype(np.uint8),cv2.DIST_L2,5)
    out=img.copy(); cells=list(grid_cells(hole,OX,OY,C)); sp={}
    for cy,cx,sl in cells:
        if rng.random()<speck_p:
            L=rng.integers(1,4); d=rng.choice([-1,1]); lvl=rng.choice([1,1,2])
            for i in range(L): sp[(cy+i*C,cx+d*i*C)]=lvl
    for cy,cx,sl in cells:
        yc=min(max(cy+C//2,0),H-1); xc_=min(max(cx+C//2,0),W-1); hm=hole[sl]
        if inside[yc,xc_]:
            w=np.exp(-dist[yc,xc_]/fall) if fall else 1.0
            wref=wr[yc,xc_] if wr[yc,xc_].min()>200 else RAMP[0]
            c=(dq(RAMP[0]*(1-w)+sm_in[yc,xc_]*w,rng) if dither else qramp(RAMP[0]*(1-w)+sm_in[yc,xc_]*w))
            if np.allclose(c,RAMP[0]): c=np.round(wref)
            if (cy,cx) in sp:
                i=min(int(np.argmin(((RAMP-c)**2).sum(1)))+sp[(cy,cx)],4); c=RAMP[i]
        else: c=sm_bg[yc,xc_]
        out[sl][hm]=c
    return out
def rim_outline(out,inside,hole,seed=0):
    rng=np.random.default_rng(seed); H,W=inside.shape
    cin=lambda y,x: inside[min(max(y,0),H-1),min(max(x,0),W-1)]
    for cy,cx,sl in list(grid_cells(hole,OX,OY,C)):
        yc,xc=cy+C//2,cx+C//2
        if not cin(yc,xc): continue
        for k in (1,2,3):
            nb=[cin(yc+dy*C*k,xc+dx*C*k) for dy,dx in ((0,1),(1,0),(0,-1),(-1,0),(1,1),(-1,1))]
            if not all(nb): break
        else: continue
        if k==1:
            nb4=[cin(yc+dy*C,xc+dx*C) for dy,dx in ((0,1),(1,0),(0,-1),(-1,0))]
            c=OUTLINE if not all(nb4) else (RAMP[4] if rng.random()<.5 else RAMP[3])
        elif k==2: c=RAMP[3] if rng.random()<.55 else RAMP[2]
        else: c=RAMP[2] if rng.random()<.4 else RAMP[1]
        out[sl][hole[sl]]=c
    return out
# ---------- eyes ----------
NEAR=(70,36); FAR=(93,35)
EYES={
 'calm':(["..DDD..",".DDDDD.",".DWWDD.",".DWWDD.",".DDDID.","..DDD..","..sss.."],
         [".DDD.","DDDD.","DWWD.","DWWD.","DDID.",".DD..",".ss.."]),
 'breathe':(["", "", "","D.....D".replace('.', '.'),".DD.DD.".replace('.D','.D'),"..DDD.."],
            ["","","","D...D",".D.D.","..D.."]),
 'proud':(["","","..DDD..",".D...D.","D.....D","",".PpP..."],
          ["","",".DD..","D..D.","....D","","PpP.."]),
}
def eyes(img,mood):
    a,b=EYES[mood]
    sprite(img,NEAR[0]-1,NEAR[1]-1,a); sprite(img,FAR[0],FAR[1]-1,b); return img
def qramp_nolight(c):
    d=((RAMP-c)**2).sum(1); k=int(np.argmin(d)); return RAMP[0] if k==1 else RAMP[k]
EYES={
 'calm':([".DDDD.","DDDDDD","DWWDDD","DWWDDD","DDDDwD","DIIIDD",".DDDD."],
         [".DDD.","DDDDD","DWWDD","DWWDD","DDDwD","DIIDD",".DDD."]),
 'breathe':(["","","","D....D","DD..DD",".DDDD.",""],
            ["","","","D...D","DD.DD",".DDD.",""]),
 'proud':(["","",".DDDD.","DD..DD","D....D","","PpPP.."],
          ["","",".DDD.","DD.DD","D...D","","pPP.."]),
}
NEARC=(655,342); FARC=(840,334)
def eyes(img,mood):
    a,b=EYES[mood]
    i,j=ij(*NEARC); sprite(img,i-3,j-3,a)
    i,j=ij(*FARC); sprite(img,i-2,j-3,b); return img
def smile_curve(img):
    pts={}
    for x in range(660,845):
        col=img[440:530,x].max(1); y=int(np.argmin(col))+440
        if col.min()<90: pts[x]=y
    return pts
def erase_mouth(img,xmin,xmax,seed=7):
    H,W,_=img.shape; yy,xx=np.mgrid[0:H,0:W]
    hole=(img.max(2)<120)&(xx>=xmin)&(xx<=xmax)&(yy>435)&(yy<528)
    hole=cv2.dilate(hole.astype(np.uint8),np.ones((9,9),np.uint8)).astype(bool)
    hole=cellify(hole,OX,OY,0.15)
    inside=np.ones((H,W),bool)
    return fill_region(img,hole,inside,seed,fall=0,kmin=150,speck_p=0.0,sig=14)
