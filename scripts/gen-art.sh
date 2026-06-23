#!/bin/bash
# Generate premium Grok art for the 3S studio site. Reviews happen after; weak ones get discarded.
set -e
cd "/Users/davemarkovich/Desktop/3S Projects"
set -a; . ./3S-SECRETS.env; set +a
OUT="3Shamrocks-Studio/Website-2026/assets/art"
mkdir -p "$OUT"

gen () {
  local name="$1"; local prompt="$2"
  if [ -f "$OUT/$name.jpg" ]; then echo "skip $name (exists)"; return; fi
  local body url
  body=$(python3 -c "import json,sys;print(json.dumps({'model':'grok-imagine-image','prompt':sys.argv[1]}))" "$prompt")
  resp=$(curl -s https://api.x.ai/v1/images/generations \
     -H "Authorization: Bearer $XAI_API_KEY" -H "Content-Type: application/json" -d "$body")
  url=$(printf '%s' "$resp" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['data'][0]['url'] if 'data' in d and d['data'] else 'ERR:'+json.dumps(d)[:200])")
  if [[ "$url" == ERR:* ]]; then echo "FAIL $name :: $url"; return 1; fi
  curl -s "$url" -o "$OUT/$name.jpg"
  echo "ok $name ($(sips -g pixelWidth -g pixelHeight "$OUT/$name.jpg" 2>/dev/null | grep -oE '[0-9]+' | tr '\n' 'x' | sed 's/x$//'))"
}

# ---- HERO (light, editorial, brand-green) ----
gen hero "Premium abstract background artwork for a high-end product design studio website. Soft warm off-white and cream base, with elegant flowing translucent ribbons of light in emerald green and fresh mint, a few delicate strokes of deep navy for depth. Sophisticated gradient-mesh light, airy, generous negative space, gallery-quality fine-art minimalism, soft grain. Bright and clean overall so dark text sits on top. No people, no text, no logos, no clip-art. Ultra-wide 16:9."

# ---- PRODUCT SHOWCASE BACKDROPS (atmospheric, will get a dark scrim + real logo on top) ----
gen p-shomergency "Cinematic atmospheric aerial view of a calm city at blue hour, seen from above, warm protective golden window-lights glowing across a deep navy-blue cityscape, soft mist, a sense of watchful safety and community, moody premium color grade, shallow depth, no text no logos no people faces. 16:9."
gen p-forest "Cinematic misty pine forest at dawn, deep emerald greens, volumetric god-rays through tall trees, dewy atmosphere, calm and protective mood, premium nature cinematography, no animals no people no text. 16:9."
gen p-beach "Cinematic aerial of a Mediterranean coastline at golden hour, turquoise water meeting pale sand, gentle waves, clean and serene, premium travel-film color grade, no people no text no logos. 16:9."
gen p-chorewars "Warm cozy modern family home interior at evening, soft golden lamp glow, blurred bokeh, inviting domestic warmth, clean and tidy, premium lifestyle cinematography, no people no text. 16:9."
gen p-ezra "Soft dignified still life of warm morning sunlight streaming through a window onto a simple wooden table, calm golden-hour glow, gentle and reassuring, premium minimalist photography, no people no text. 16:9."
gen p-milo "Dreamy soft pastel meadow at soft light, gentle rolling green grass with tiny floating glowing motes, calm and comforting children's-storybook atmosphere, painterly, no characters no creatures no people no text. 16:9."
gen p-j8nix "Sophisticated dark command-center abstract, deep navy space with elegant glowing data arcs and soft warm peach and gold light trails, premium futuristic operations dashboard mood, minimal, no text no logos no people. 16:9."
gen p-brandkit "Premium creative studio flat-lay abstract, flowing ribbons of paint and ink in emerald, navy and gold across a clean off-white surface, elegant design-tool aesthetic, sophisticated, no text no logos no people. 16:9."
gen p-trashure "Vibrant stylized animated-game world scene of a sunny urban riverside park, lush green grass and a clean sparkling stream, bright playful Pixar-style environment, hopeful eco-adventure mood, no characters no creatures no text. 16:9."

# ---- SECTION / CTA band ----
gen band-studio "Elegant wide abstract banner, soft cream and warm off-white with subtle emerald-green light gradients sweeping diagonally, refined fine-art minimalism, lots of negative space, premium, no text no logos. Ultra-wide 21:9 panorama."
gen band-cta "Rich deep navy abstract banner with soft emerald and mint light blooming from the upper right, sophisticated, premium, atmospheric depth, no text no logos. Ultra-wide 21:9 panorama."

echo "=== DONE ==="
ls -1 "$OUT"
