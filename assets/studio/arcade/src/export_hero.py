import sys, json; sys.path.insert(0, __import__('os').path.dirname(__file__))
import hero_sprite as hero
F={'idle0':('idle','stand','open',0),'idle1':('idle','stand','open',1),'blink':('idle','stand','blink',0),
'walk0':('idle','walk1','open',0),'walk1':('idle','walk2','open',1),'walk2':('idle','walk3','open',0),
'crouch':('idle','crouch','fierce',1),'jump':('up','jump','fierce',0),'punch':('punch','stand','fierce',0),
'punchlow':('punch','crouch','fierce',1),'cheer':('cheer','stand','open',0),'cheer1':('cheer','stand','open',1)}
stand=hero.frame('idle','stand')
ay=max(y for x,y in stand)+1; ax=14
out={}
for k,a in F.items():
  c=hero.frame(*a); x0,y0,x1,y1=hero.bounds(c)
  rows=[''.join(c.get((x,y),'.') for x in range(x0,x1+1)) for y in range(y0,y1+1)]
  out[k]={'x':x0-ax,'y':y0-ay,'r':rows}
js='/* Dave minime hero: hand-placed pixel frames (generated from the sprite source). */\nwindow.ARC_HERO='+json.dumps({'pal':hero.PAL,'f':out},separators=(',',':'))+';\n'
open(__import__('os').path.join(__import__('os').path.dirname(__file__), '..', 'hero.js'),'w').write(js); print(len(js), ay)
