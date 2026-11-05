from art import *
def chain_mask(img):
    H,W,_=img.shape; yy,xx=np.mgrid[0:H,0:W]
    mx=img.max(2); mn=img.min(2); r,g,b=img[...,0],img[...,1],img[...,2]
    purple=(b>r+30)&(b>g+60)&((mx-mn)>85)&(b>110)
    reg=(yy>515)&(yy<835)&(xx>385)&(xx<918)
    m=purple&reg
    n,lab,st,_=cv2.connectedComponentsWithStats(m.astype(np.uint8))
    keep=np.zeros_like(m,bool)
    for k in range(1,n):
        if st[k,4]>120: keep|=lab==k
    hole=cv2.dilate(keep.astype(np.uint8),np.ones((19,19),np.uint8)).astype(bool)
    hole=cv2.morphologyEx(hole.astype(np.uint8),cv2.MORPH_CLOSE,np.ones((25,25),np.uint8)).astype(bool)&reg
    near=cv2.dilate(hole.astype(np.uint8),np.ones((21,21),np.uint8)).astype(bool)
    hole|=near&(mx<150)&reg&~((xx<445)&(yy>600))&~((yy>700)&(xx>800))
    stick=(xx>905)&(yy<760)
    hole=cv2.dilate(hole.astype(np.uint8),np.ones((7,7),np.uint8)).astype(bool)&reg
    return hole&~stick
XR=lambda y: 895-8*np.sin(np.pi*np.clip((y-545)/165.,0,1))
def regions(H,W):
    yy,xx=np.mgrid[0:H,0:W]
    xl=440+(yy-525)*(-30/77.)
    bgL=(xx<xl)&(yy>=505)&(yy<=615)
    return bgL
def remove_chain(img,seed=4):
    rng=np.random.default_rng(seed)
    H,W,_=img.shape; yy,xx=np.mgrid[0:H,0:W]
    hole=chain_mask(load())
    bgreg=regions(H,W)
    fur=~bgreg
    u8=np.clip(img,0,255).astype(np.uint8)
    # low freq fur
    Bf=cv2.inpaint(u8,((hole)|(bgreg)|(cv2.dilate(hole.astype(np.uint8),np.ones((21,21),np.uint8)).astype(bool)&(img.max(2)<130))).astype(np.uint8)*255,16,cv2.INPAINT_TELEA).astype(np.float32)
    Bf=cv2.GaussianBlur(Bf,(0,0),6)
    pre=img.copy(); pre[hole]=Bf[hole]
    lowsrc=cv2.GaussianBlur(pre,(0,0),7)
    R=(pre-lowsrc)*1.25
    out=img.copy()
    def shift(A,dx,dy):
        M=np.float32([[1,0,-dx],[0,1,-dy]])  # out(x,y)=A(x+dx,y+dy)
        return cv2.warpAffine(A,M,(W,H),flags=cv2.INTER_NEAREST,borderMode=cv2.BORDER_REFLECT)
    valid=((~cv2.dilate(hole.astype(np.uint8),np.ones((15,15),np.uint8)).astype(bool))&fur&(img.min(2)>60)).astype(np.float32)
    Rd=np.zeros_like(img); done=np.zeros((H,W),bool)
    for k in (1.0,1.5,2.1,2.8,-1.2,-2.0):
        acc=np.zeros_like(img); wacc=np.zeros((H,W),np.float32)
        for (dx,dy),cxc in [((34,-40),470),((0,-52),650),((-36,-36),830),((-40,-30),880)]:
            dx2,dy2=int(dx*k),int(dy*k)
            wx=np.exp(-((xx-cxc)/90.)**2).astype(np.float32)
            v=shift(valid,dx2,dy2)
            acc+=shift(R,dx2,dy2)*(wx*v)[...,None]; wacc+=wx*v
        ok=(wacc>0.35)&~done
        Rd[ok]=(acc/np.maximum(wacc,1e-3)[...,None])[ok]; done|=ok
    m=hole&fur
    out[m]=(Bf+Rd)[m]
    # background in hole: inpaint from bg pixels only
    Bb=cv2.inpaint(u8,(hole|fur&(img.min(2)>60)|(fur&(xx>380)&(xx<900))).astype(np.uint8)*255,20,cv2.INPAINT_TELEA).astype(np.float32)
    bh=hole&bgreg; out[bh]=Bb[bh]
    # contour outline cells (manual)
    xl=lambda y: 440+(y-525)*(-30/77.)
    for cy,cx,sl in grid_cells(hole,OX,OY,C):
        yc,xc_=cy+C//2,cx+C//2
        m=hole[sl]
        if 505<=yc<=612:
            d=xc_-xl(yc)
            if -C<=d<0: out[sl][m]=OUTLINE
            elif 0<=d<C: out[sl][m]=out[sl][m]*np.array([.80,.80,.86])
            elif C<=d<2*C: out[sl][m]=out[sl][m]*np.array([.92,.92,.95])
        if False:
            d=XR(yc)-xc_
            if -C<d<=0: out[sl][m]=OUTLINE
            elif 0<d<=C: out[sl][m]=out[sl][m]*np.array([.80,.80,.86])
            elif C<d<=2*C: out[sl][m]=out[sl][m]*np.array([.92,.92,.95])
    # --- forearm top edge hidden under the chain: rebuild it
    P=np.array([(935,713),(900,718),(866,726),(848,740),(833,759),(822,779),(815,799),(801,820),(786,840)],np.float32)
    poly=np.vstack([P,[[960,900],[960,700]]]).astype(np.int32)
    arm=np.zeros((H,W),np.uint8); cv2.fillPoly(arm,[poly],1); arm=arm.astype(bool)
    ah=hole&arm
    if ah.any():
        known=(~hole)&arm&(img.min(2)>150)
        Ba=cv2.inpaint(u8,(~known).astype(np.uint8)*255,12,cv2.INPAINT_TELEA).astype(np.float32)
        Ba=cv2.GaussianBlur(Ba,(0,0),4)
        Ra=shift(R,26,30); out[ah]=(Ba+Ra*0.8)[ah]
        line=np.zeros((H,W),np.uint8); cv2.polylines(line,[P.astype(np.int32)],False,1,thickness=7)
        lb=line.astype(bool)
        # snap to 5px blocks for a stepped pixel edge
        ys_,xs_=np.where(lb); lb2=np.zeros_like(lb)
        for y_,x_ in zip(ys_,xs_): lb2[(y_//5)*5:(y_//5)*5+5,(x_//5)*5:(x_//5)*5+5]=True
        near=cv2.dilate(hole.astype(np.uint8),np.ones((9,9),np.uint8)).astype(bool)
        lm=lb2&near
        band=cv2.dilate(line,np.ones((31,31),np.uint8)).astype(bool)
        stray=band&arm&~lm&(img.max(2)<120)&~((xx>905)&(yy<760))
        out[stray]=Ba[stray]
        out[lm]=OUTLINE
        # soft shade just above the outline on the neck side (contact shadow)
        sh=np.zeros((H,W),np.uint8); cv2.polylines(sh,[(P+np.array([-6,-6])).astype(np.int32)],False,1,thickness=8)
        sm=sh.astype(bool)&hole&~arm&~lm
        out[sm]=out[sm]*np.array([.86,.86,.9])
    return np.clip(out,0,255),hole
if __name__=='__main__':
    o=np.asarray(Image.open('full_calm.png')).astype(np.float32)
    out,hole=remove_chain(o)
    v=o.copy(); v[hole]=v[hole]*0.3+np.array([0,255,0])*0.7
    zoom(v,(380,500,940,840),1,'z_chainmask.png')
    save(out,'full_calm_nochain.png'); zoom(out,(380,500,940,840),2,'z_nochain.png')
