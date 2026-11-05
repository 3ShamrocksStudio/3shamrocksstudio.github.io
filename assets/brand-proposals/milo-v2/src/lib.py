from PIL import Image
import numpy as np, cv2
SRC='/home/claude/3shamrocksstudio.github.io/assets/studio/milo/milo-concept.jpg'
def load(): return np.asarray(Image.open(SRC).convert('RGB')).astype(np.float32)
CELL=9
FUR_HI=np.array([245,240,237.]); FUR_SPECK=np.array([212,206,222.]); FUR_SPECK2=np.array([186,180,204.])
OUTLINE=np.array([14,8,32.]); RIM=np.array([150,142,178.])
def ncv(img,w,sig):
    k=int(sig*3)|1
    num=cv2.GaussianBlur(img*w[...,None],(k,k),sig); den=cv2.GaussianBlur(w.astype(np.float32),(k,k),sig)
    return num/np.maximum(den,1e-4)[...,None], den
def cellify(mask,ox=0,oy=0,thr=0.25):
    """snap a mask to the CELL grid (any cell with >thr coverage)."""
    H,W=mask.shape; out=np.zeros_like(mask)
    for y in range(oy-CELL,H,CELL):
        for x in range(ox-CELL,W,CELL):
            y0,y1,x0,x1=max(y,0),min(y+CELL,H),max(x,0),min(x+CELL,W)
            if y1<=y0 or x1<=x0: continue
            if mask[y0:y1,x0:x1].mean()>thr: out[y0:y1,x0:x1]=True
    return out
def fur_fill(img,hole,inside,seed=1,density=1.0,ox=0,oy=0,bgcol=None):
    """repaint hole: fur where inside, background elsewhere; pixel cells of size CELL."""
    rng=np.random.default_rng(seed)
    H,W,_=img.shape
    mx=img.max(2)
    known_fur=(~hole)&(mx>150)&(img.min(2)>140)
    smooth,_=ncv(img,known_fur.astype(np.float32),22)
    out=img.copy()
    ys,xs=np.where(hole); y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
    # cell grid
    gy0=oy+((y0-oy)//CELL)*CELL; gx0=ox+((x0-ox)//CELL)*CELL
    cells={}
    for cy in range(gy0,y1,CELL):
        for cx in range(gx0,x1,CELL):
            sl=(slice(max(cy,0),cy+CELL),slice(max(cx,0),cx+CELL))
            hm=hole[sl]
            if not hm.any(): continue
            cells[(cy,cx)]=sl
    # strand speckles: random diagonal runs
    speck=set()
    keys=list(cells.keys())
    for (cy,cx) in keys:
        s=smooth[cy+CELL//2 if cy+CELL//2<H else H-1, cx+CELL//2 if cx+CELL//2<W else W-1]
        darkness=np.clip((245-s.mean())/40,0,1)
        p=(0.035+0.22*darkness)*density
        if rng.random()<p:
            L=rng.integers(1,4); d=rng.choice([-1,1])
            for i in range(L): speck.add((cy+i*CELL,cx+d*i*CELL, 2 if (darkness>0.5 and rng.random()<0.5) else 1))
    speckd={(a,b):c for a,b,c in speck}
    for (cy,cx),sl in cells.items():
        hm=hole[sl]; ins=inside[sl]
        cyc=min(max(cy+CELL//2,0),H-1); cxc=min(max(cx+CELL//2,0),W-1)
        if inside[cyc,cxc]:
            base=smooth[cyc,cxc]
            # quantize base toward palette steps
            t=np.clip((FUR_HI.mean()-base.mean())/60,0,1)
            t=np.round(t*4)/4
            col=FUR_HI*(1-t)+FUR_SPECK2*t
            k=speckd.get((cy,cx))
            if k==1: col=FUR_SPECK if t<0.5 else FUR_SPECK2
            if k==2: col=FUR_SPECK2*0.85+np.array([150,140,178])*0.15
        else:
            col=bgcol if bgcol is not None else smooth[cyc,cxc]
        out[sl][hm]=col
    return out
def outline_contour(img,inside,region,thick=1):
    """draw dark outline cells along inside boundary within region (cell aligned)."""
    er=cv2.erode(inside.astype(np.uint8),np.ones((CELL*thick*2+1,CELL*thick*2+1),np.uint8)).astype(bool)
    edge=inside&~er&region
    out=img.copy(); out[edge]=OUTLINE
    er2=cv2.erode(er.astype(np.uint8),np.ones((CELL*2+1,CELL*2+1),np.uint8)).astype(bool)
    rim=er&~er2&region
    out[rim]=out[rim]*0.45+RIM*0.55
    return out
def save(a,p): Image.fromarray(np.clip(a,0,255).astype(np.uint8)).save(p)
def zoom(a,box,z=2,p='z.png'):
    im=Image.fromarray(np.clip(a,0,255).astype(np.uint8)).crop(box)
    im.resize((im.width*z,im.height*z),Image.NEAREST).save(p)
