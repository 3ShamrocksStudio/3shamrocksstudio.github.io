# python3 sheet.py out.jpg cols label img1 img2 ...  -> labelled contact sheet (each frame scaled to 360x640)
import sys
from PIL import Image, ImageDraw
out, cols, label, imgs = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4:]
W, H = 360, 640; rows = (len(imgs) + cols - 1) // cols
sh = Image.new('RGB', (W * cols, H * rows + 40), '#0B0912'); dr = ImageDraw.Draw(sh)
for i, p in enumerate(imgs):
    im = Image.open(p).convert('RGB').resize((W, H)); x, y = (i % cols) * W, (i // cols) * H
    sh.paste(im, (x, y)); dr.text((x + 6, y + 6), p.split('/t')[-1].replace('.jpg', ' s'), fill='#FFE600')
dr.text((8, H * rows + 12), label, fill='#FFF7F0')
sh.save(out, quality=88)
