import sys, os, json
sys.path.insert(0,'/dev/shm/milo')
from lib import *
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import chain
OUT='/home/claude/3shamrocksstudio.github.io/assets/brand-proposals/milo-v2'
for d in ('character','logo','system'): os.makedirs(f'{OUT}/{d}',exist_ok=True)
F='/dev/shm/milo/fonts/'
NIGHT=(26,2,59); INK=(14,8,32); FUR=(244,239,235); FROST=(246,243,255)
PINK=(255,79,163); PINK_DEEP=(194,24,111); ICE=(92,200,255); CORAL=(255,122,102); INDIGO=(75,58,158)
moods={m:np.load(f'mood_{m}.npy') for m in ('calm','breathe','proud')}
nochain={m:chain.remove_chain(moods[m])[0] for m in moods}
SQ=(200,60,1190,1050)  # square crop without the old wordmark
def to_img(a): return Image.fromarray(np.clip(a,0,255).astype(np.uint8))
def save_small(im,path,max_kb=390):
    for colors in (None,256,192,128):
        if colors is None: im.save(path,optimize=True)
        else: im.quantize(colors=colors,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.FLOYDSTEINBERG).save(path,optimize=True)
        if os.path.getsize(path)<=max_kb*1024: return os.path.getsize(path)
    raise SystemExit('too big '+path)
# 1. characters
for m in moods:
    for tag,arr in (('',moods[m]),('-nochain',nochain[m])):
        im=to_img(arr).crop(SQ).resize((768,768),Image.LANCZOS)
        save_small(im,f'{OUT}/character/milo-{m}{tag}.png')
# head avatars (nearest crop 2x of 256 region -> 512) for mood states
HB=(444,150,956,662)
for m in moods:
    im=to_img(nochain[m]).crop(HB).resize((384,384),Image.LANCZOS)
    save_small(im,f'{OUT}/character/avatar-{m}.png')
# before / after
orig=to_img(load()).crop(SQ).resize((600,600),Image.LANCZOS)
new=to_img(moods['calm']).crop(SQ).resize((600,600),Image.LANCZOS)
ba=Image.new('RGB',(1220,600),NIGHT); ba.paste(orig,(0,0)); ba.paste(new,(620,0))
save_small(ba,f'{OUT}/character/before-after.png')
# 2x zoom proof of the eye area (nearest)
z=to_img(moods['calm']).crop((440,220,1000,470)).resize((1120,500),Image.NEAREST)
save_small(z,f'{OUT}/character/eye-area-2x.png')
z=to_img(nochain['calm']).crop((380,490,940,840)).resize((1120,700),Image.NEAREST)
save_small(z,f'{OUT}/character/chain-area-2x.png')
# 2. wordmark
def wordmark(color,dot=ICE,size=400,pad=40):
    f=ImageFont.truetype(F+'Fredoka-600.ttf',size)
    txt='Mılo'
    tmp=Image.new('L',(size*4,size*2),0); d=ImageDraw.Draw(tmp)
    d.text((pad,pad+size*0.25),txt,font=f,fill=255)
    bb=tmp.getbbox(); mask=tmp.crop((bb[0]-pad,bb[1]-int(size*0.42),bb[2]+pad,bb[3]+pad))
    W,H=mask.size
    im=Image.new('RGBA',(W,H),(0,0,0,0)); im.paste(Image.new('RGBA',(W,H),color+(255,)),(0,0),mask)
    # locate dotless i stem to place a pixel 'ice cube' dot
    wM=f.getlength('M'); wi=f.getlength('ı')
    x0=pad+wM+ (wi*0.5); stem=f.getbbox('ı'); sw=(stem[2]-stem[0])
    cx=pad+wM+stem[0]+sw/2
    s=int(sw*1.04); top=int(size*0.42)-int(s*1.55)+ (pad+int(size*0.25)-bb[1]+int(size*0.42)) - int(size*0.42)
    # top of i stem in mask coords
    ib=f.getbbox('ı'); stem_top=(pad+size*0.25+ib[1])-(bb[1]-int(size*0.42))
    y=int(stem_top - s*1.22); x=int(cx-s/2)-(bb[0]-pad)
    d2=ImageDraw.Draw(im)
    d2.rounded_rectangle([x,y,x+s,y+s],radius=max(2,s//7),fill=dot+(255,))
    q=s//3; d2.rectangle([x+s//6,y+s//6,x+s//6+q-1,y+s//6+q-1],fill=(255,255,255,235))
    return im
wm_dark=wordmark(PINK); wm_light=wordmark(PINK_DEEP,dot=(27,155,220))
for nm,im in (('wordmark-pink',wm_dark),('wordmark-pink-deep',wm_light)):
    im2=im.resize((im.width//2,im.height//2),Image.LANCZOS); im2.save(f'{OUT}/logo/{nm}.png',optimize=True)
# 3. app icon (nearest 2x of a 512 crop)
IB=(380,96,1020,736)
icon=to_img(nochain['calm']).crop(IB).resize((1024,1024),Image.NEAREST)
save_small(icon,f'{OUT}/logo/app-icon-1024.png')
i180=icon.resize((180,180),Image.LANCZOS); i180.save(f'{OUT}/logo/app-icon-180.png',optimize=True)
# 180 check sheet: 180 at 1x, plus iOS-style mask, plus 60 and 40
chk=Image.new('RGB',(560,240),FROST); dd=ImageDraw.Draw(chk)
mask=Image.new('L',(180,180),0); ImageDraw.Draw(mask).rounded_rectangle([0,0,179,179],radius=40,fill=255)
chk.paste(i180,(20,30),mask)
for sz,x in ((120,230),(60,380),(40,470)):
    t=icon.resize((sz,sz),Image.LANCZOS); mk=Image.new('L',(sz,sz),0); ImageDraw.Draw(mk).rounded_rectangle([0,0,sz-1,sz-1],radius=int(sz*0.225),fill=255)
    chk.paste(t,(x,30+(180-sz)//2),mk)
fr=ImageFont.truetype(F+'Rubik-500.ttf',16)
for txt,x in (('180',95),('120',275),('60',395),('40',475)): dd.text((x,218),txt,font=fr,fill=INK,anchor='mm')
chk.save(f'{OUT}/logo/app-icon-check.png',optimize=True)
# 4. lockups
def tile(size):
    t=icon.resize((size,size),Image.LANCZOS); mk=Image.new('L',(size,size),0)
    ImageDraw.Draw(mk).rounded_rectangle([0,0,size-1,size-1],radius=int(size*0.225),fill=255); return t,mk
def lockup(bg,wm,sub_col,path):
    w=wm.resize((int(wm.width*0.62),int(wm.height*0.62)),Image.LANCZOS)
    Wd,Hd=490+w.width+100,520; im=Image.new('RGB',(Wd,Hd),bg); d=ImageDraw.Draw(im)
    t,mk=tile(320); im.paste(t,(110,100),mk)
    im.paste(w,(490,58),w)
    fs=ImageFont.truetype(F+'Rubik-500.ttf',50)
    d.text((500,58+w.height+6),'Breathe & Be Brave',font=fs,fill=sub_col)
    save_small(im,path)
lockup(NIGHT,wm_dark,(205,239,255),f'{OUT}/logo/lockup-horizontal-on-dark.png')
lockup(FROST,wm_light,INDIGO,f'{OUT}/logo/lockup-horizontal-on-light.png')
# 5. brand card
card=Image.new('RGB',(1600,1000),NIGHT); d=ImageDraw.Draw(card)
# soft vertical gradient night->indigo
g=np.linspace(0,1,1000)[:,None]
grad=(np.array(NIGHT)[None,None]*(1-g[...,None]*0.55)+np.array((48,26,110))[None,None]*(g[...,None]*0.55)).repeat(1600,1)
card=Image.new('RGB',(1600,1000),(25,3,59)); d=ImageDraw.Draw(card)
bear=to_img(nochain['calm']).crop((290,110,1210,1030)).resize((860,860),Image.LANCZOS)
card.paste(bear,(40,70))
w=wm_dark.resize((int(wm_dark.width*0.7),int(wm_dark.height*0.7)),Image.LANCZOS); card.paste(w,(930,150),w)
d.text((945,150+w.height+10),'Breathe & Be Brave',font=ImageFont.truetype(F+'Rubik-500.ttf',52),fill=(205,239,255))
d.text((945,150+w.height+88),'A calm-and-courage friend for kids 6–12.',font=ImageFont.truetype(F+'Rubik-400.ttf',32),fill=(181,174,200))
ax=945
for m,lab in (('calm','Calm'),('breathe','Breathe'),('proud','Proud')):
    a=to_img(nochain[m]).crop(HB).resize((170,170),Image.LANCZOS); mk=Image.new('L',(170,170),0); ImageDraw.Draw(mk).rounded_rectangle([0,0,169,169],radius=38,fill=255)
    card.paste(a,(ax,640),mk); d.text((ax+85,835),lab,font=ImageFont.truetype(F+'Rubik-500.ttf',28),fill=(244,239,235),anchor='mm'); ax+=200
sw=[(26,2,59),(75,58,158),(92,200,255),(244,239,235),(255,79,163),(255,122,102)]
for k,c in enumerate(sw): d.rounded_rectangle([945+k*86,885,945+k*86+70,925],radius=10,fill=c,outline=(255,255,255) if c==(26,2,59) else None)
save_small(card,f'{OUT}/logo/brand-card.png')
# 6. sheets
def sheet(dct,path,labels=('Calm / happy','Breathing','Proud')):
    Wd=3*520+40; im=Image.new('RGB',(Wd,600),NIGHT); d=ImageDraw.Draw(im)
    for k,m in enumerate(('calm','breathe','proud')):
        a=to_img(dct[m]).crop(SQ).resize((500,500),Image.LANCZOS); im.paste(a,(20+k*520,20))
        d.text((20+k*520+250,560),labels[k],font=ImageFont.truetype(F+'Rubik-500.ttf',30),fill=(244,239,235),anchor='mm')
    save_small(im,path)
sheet(moods,f'{OUT}/character/moods.png'); sheet(nochain,f'{OUT}/character/moods-nochain.png')
cc=Image.new('RGB',(1060,600),NIGHT); d=ImageDraw.Draw(cc)
for k,(arr,lab) in enumerate(((moods['calm'],'A · with chain'),(nochain['calm'],'B · no chain'))):
    cc.paste(to_img(arr).crop(SQ).resize((500,500),Image.LANCZOS),(20+k*520,20))
    d.text((20+k*520+250,560),lab,font=ImageFont.truetype(F+'Rubik-500.ttf',30),fill=(244,239,235),anchor='mm')
save_small(cc,f'{OUT}/character/chain-compare.png')
# 7. palette json
pal={"source":"sampled from milo-concept.jpg; 'tuned' = adjusted from a sampled colour",
 "core":{"night":{"hex":"#1A023B","from":"sampled background","use":"default surface, Milo's tile"},
         "ink":{"hex":"#0E0820","from":"sampled outline","use":"text on light, pixel outlines"},
         "fur":{"hex":"#F4EFEB","from":"sampled fur","use":"text on dark, light cards"},
         "fur-shade":{"hex":"#B5AEC8","from":"sampled fur shadow","use":"secondary text on dark"},
         "frost":{"hex":"#F6F3FF","from":"tuned from fur","use":"light surface"}},
 "calm_cool":{"indigo":{"hex":"#4B3A9E","from":"tuned from eye/chain purple","use":"calm screens, breathe background"},
         "lilac":{"hex":"#784EB2","from":"sampled chain","use":"secondary calm accent"},
         "ice":{"hex":"#5CC8FF","from":"tuned from lens cyan #1B9BDC","use":"breathe ring, calm highlights, i-dot"},
         "ice-deep":{"hex":"#1B9BDC","from":"sampled lens","use":"ice on light backgrounds"},
         "frost-blue":{"hex":"#CDEFFF","from":"tuned tint of ice","use":"calm surface on light"}},
 "win_warm":{"pink":{"hex":"#FF4FA3","from":"tuned from wordmark #F42A92","use":"wordmark on dark, 'I did it'"},
         "pink-deep":{"hex":"#C2186F","from":"tuned","use":"wordmark/pink text on light"},
         "coral":{"hex":"#FF7A66","from":"tuned (new)","use":"brave-move wins, celebration"},
         "magenta":{"hex":"#EB2AC7","from":"sampled popsicle","use":"illustration only"}},
 "contrast":{"pink on night":6.18,"coral on night":7.37,"ice on night":10.0,"fur on night":16.48,"pink-deep on frost":5.25,"night on frost":17.19,"indigo on frost":8.0}}
json.dump(pal,open(f'{OUT}/system/palette.json','w'),indent=1)
print('done')
