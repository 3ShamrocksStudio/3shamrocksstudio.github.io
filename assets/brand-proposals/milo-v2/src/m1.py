from PIL import Image, ImageDraw
import numpy as np, cv2
src=np.asarray(Image.open('/home/claude/3shamrocksstudio.github.io/assets/studio/milo/milo-concept.jpg').convert('RGB')).astype(np.float32)
H,W,_=src.shape
mx=src.max(2); mn=src.min(2); sat=(mx-mn)
yy,xx=np.mgrid[0:H,0:W]
box=(xx>=465)&(xx<=975)&(yy>=268)&(yy<=418)
dark=(mx<120)|(sat>70)
nose=((xx-837)/56.)**2+((yy-424)/50.)**2<1
m=box&dark&~nose
m=cv2.morphologyEx(m.astype(np.uint8),cv2.MORPH_CLOSE,np.ones((9,9),np.uint8))
# keep the largest component
n,lab,st,_=cv2.connectedComponentsWithStats(m)
k=1+np.argmax(st[1:,4]); m=(lab==k)
np.save('shade_mask.npy',m)
v=src.copy(); v[m]=v[m]*0.3+np.array([0,255,0])*0.7
Image.fromarray(v.astype(np.uint8)).crop((420,220,1000,500)).resize((1160,560),Image.NEAREST).save('mask_view.png')
