from art import *
import lib2, art
lib2_q=lib2.qramp
base=build_noshade()
_t=base[240:262,668:694]; _m=_t.min(2)<228; _t[_m]=np.array([244,239,236.]); base[240:262,668:694]=_t
np.save('base.npy',base)
art.qramp=lib2_q
STEM=(835,498)
def erase_all_mouth(o,seed):
    from art import dq
    rng=np.random.default_rng(seed)
    H,W,_=o.shape; yy,xx=np.mgrid[0:H,0:W]
    nose=((xx-837)/62.)**2+((yy-424)/56.)**2<1
    line=(o.max(2)<110)&(xx>=650)&(xx<=827)&(yy>435)&(yy<528)&~nose
    hole=cv2.dilate(line.astype(np.uint8),np.ones((7,7),np.uint8)).astype(bool)&~nose
    hole=cellify(hole,OX,OY,0.10)&~nose&~(xx>826)
    B=cv2.inpaint(o.astype(np.uint8),hole.astype(np.uint8)*255,10,cv2.INPAINT_TELEA).astype(np.float32)
    out=o.copy()
    for cy,cx,sl in grid_cells(hole,OX,OY,C):
        c=np.median(B[sl].reshape(-1,3),0); out[sl][hole[sl]]=dq(c,rng)
    return out
def draw_mouth(o,lip,depth=None,tongue=True):
    """lip: list of row offsets per column (right end = stem). depth: open-mouth depth per column."""
    si,sj=ij(*STEM); n=len(lip)
    for k,r in enumerate(lip):
        i=si-n+k; sprite(o,i,sj+r,['D'])
        if depth:
            d=depth[k]
            for t in range(1,d+1):
                ch='K' if (tongue and t>=d-1 and d>=3) or (tongue and t==d and d==2) else 'M'
                sprite(o,i,sj+r+t,[ch])
            if d: sprite(o,i,sj+r+d+1,['D'])
    return o
LIP_FULL=[-6,-5,-4,-3,-2,-1,0,0,0,0,0,0,0,0,0,0,0,0]
def mouth_breathe(o):
    o=erase_all_mouth(o,11)
    return draw_mouth(o,[-2,-1,0,0,0,0,0,0,0,-1])
def mouth_proud(o):
    o=erase_all_mouth(o,12)
    lip=[-7,-6,-5,-4,-3,-2,-1,-1,0,0,0,0,0,0,0,0,0,0,-1]
    dep=[0,0,1,2,3,3,4,4,4,4,4,3,3,2,2,1,0,0,0]
    return draw_mouth(o,lip,dep)
def run():
  for mood in ('calm','breathe','proud'):
    o=eyes(base.copy(),mood)
    if mood=='breathe': o=mouth_breathe(o)
    if mood=='proud': o=mouth_proud(o)
    np.save(f'mood_{mood}.npy',o)
    zoom(o,(560,280,940,580),2,f'z_{mood}.png'); save(o,f'full_{mood}.png')

if __name__=='__main__': run()
