"""Builds the "Made of the work" photomosaic of Dave for the homepage "20 years" section (v3, 8 Nov 2026).
Every tile is a crop of a real piece of the studio's work: current brand marks, app icons, app screens, illustrations,
brand sheets, HealthTech (AposHealth, VIBRANT) work, old 3shamrocks.com (Wix) work in src/legacy/ and brand palettes.
Each source gives several distinct tiles (whole view, logo on dark and light, detail crops of the art, UI fragments),
near-identical tiles are dropped, and one tile shows at most CAP_TILE times at rest and CAP_ALL times counting flips.
Outputs: atlas.webp (small tiles, used at rest, mipmapped), atlas-hi.webp (same grid, larger tiles: the magnifier and the
exploded grid, loaded lazily) and layout.json (tile meta and the desktop/mobile mosaics: which tile sits where, matched
to the colour of that region of Dave's photo; the photo itself is never changed).
Excluded on purpose: J8NIX (internal to-dos), Milo with chain or sunglasses, R&K pawn+king, SH✡MER Nature, people's
faces and photos (the old-site 'shamrock keeper' and 'shamrock grove' portraits, the AposHealth model too), maps of real home areas, AI stock scenes, anything showing prices. Run from the repo root:  python3 assets/studio/mosaic/build.py"""
import json, os, math, random, heapq, re
import numpy as np
from PIL import Image, ImageFilter

OUT = 'assets/studio/mosaic'
COLS = 73                                # both atlases: 73 slots a row, same slot order
LO_SLOT, LO_PAD = 28, 1                  # rest atlas: 2048 wide, power of two (mipmapped)
HI_SLOT, HI_PAD = 48, 2                  # magnifier / exploded-grid atlas (loaded on first interaction)
C = 56                                   # tiles are cut and colour-matched at this size, then scaled into both atlases
MAXT = COLS * 72                         # lo atlas 2048 x 1024
CAP_TILE, CAP_ALL, CAP_PIECE = 2, 3, 22  # max rest uses of one tile / rest + flip uses / rest uses of one piece of work
PRODUCTS = {  # key: (display name, link)
  'sh': ('SH✡MER', 'work/shomer.html'), 'lp': ('LickPick', 'work/lickpick.html'),
  'cr': ('Chore Royale', 'work/chore-royale.html'),
  'th': ('Trashure Hunters', 'work/trashure-hunters.html'), 'mi': ('Milo', 'work/milo.html'),
  'rk': ('Rookie & King', 'work/rk.html'), 'ez': ('EZRA', 'work/ezra.html'),
  'fr': ('FaiRent', 'work/fairent.html'), 'ap': ('AposHealth', '#experience'), 'vb': ('VIBRANT', '#experience'),
  'st': ('3Shamrocks Studio', '#about'),
}
BV, W, S9, M, H = 'assets/brand-v3/', 'assets/work/', 'assets/studio/s9/', 'assets/studio/marks/', 'assets/studio/home/'
TH, LG, MV = 'th-site/assets/img/', OUT + '/src/legacy/', 'assets/brand-proposals/milo-v2/'
SRC = []  # (product, label, path, mode)
def A(p, mode, *items):
  for it in items:
    SRC.append((p, it[0], it[1], it[2] if len(it) > 2 else mode))

# --- SH✡MER: app screens, command centre, site, badge, first-aid icons
A('sh', 'screen', ('map', W+'shomer/app-map.webp'), ('around me', W+'shomer/app-around.webp'), ('trusted circles', W+'shomer/app-circles.webp'),
  ('CPR guide', W+'shomer/app-cpr.webp'), ('command dashboard', W+'shomer/command-desktop.webp'), ('command, mobile', W+'shomer/command-mobile.webp'),
  ('website', W+'shomer/site-desktop.webp'), ('website, mobile', W+'shomer/site-mobile.webp'), ('map screen', S9+'sh-map.webp'),
  ('member card', S9+'sh-card.webp'), ('trusted circle', S9+'sh-circle.webp'), ('first-aid steps', S9+'sh-cpr.webp'),
  ('badge', W+'shomer/badge.webp', 'logo'), ('badge', 'assets/studio/logos/shomer.png', 'logo'))
A('sh', 'icon', *[('first-aid icon: ' + n, H + 'sh-guide-%s.webp' % n) for n in ['allergy', 'bleed', 'bone', 'burn', 'call', 'choke', 'cpr', 'heart']])
# --- LickPick
A('lp', 'screen', ('home screen', S9+'lp-home.webp'), ('pick screen', S9+'lp-pick.webp'), ('style screen', S9+'lp-style.webp'),
  ('library', 'lickpick/assets/m_home.jpg'), ('pick a take', 'lickpick/assets/m_pick.jpg'), ('post screen', 'lickpick/assets/m_post.jpg'),
  ('band screen', 'lickpick/assets/m_band.jpg'), ('export screen', 'lickpick/assets/m_export.jpg'), ('landing page', 'lickpick/assets/og.jpg'),
  ('website', W+'lickpick/site-desktop.webp'), ('website, mobile', W+'lickpick/site-mobile.webp'))
A('lp', 'logo', ('app icon', 'lickpick/app/icon-512-v5.png'), ('pick mark', 'lickpick/app/icon-192-v5.png'), ('lockup', 'assets/studio/logos/lickpick-lockup.png'))
# --- Chore Royale
A('cr', 'screen', ('live check', W+'chore-royale/live-check.webp'), ('live duel', W+'chore-royale/live-duel.webp'), ('live grab', W+'chore-royale/live-grab.webp'),
  ('live grid', W+'chore-royale/live-grid.webp'), ('arena screen', S9+'cr-arena.webp'), ('power cards', S9+'cr-cards.webp'), ('chores screen', S9+'cr-chores.webp'),
  ('game, desktop', W+'s16/cr-game-d.webp'), ('game, mobile', W+'s16/cr-game-m.webp'), ('hero', BV+'chore-royale/hero.png'), ('icon set', BV+'chore-royale/icons.png'))
A('cr', 'square', ('crest', W+'chore-royale/crest.jpg'), ('app icon', BV+'chore-royale/app-icon.png'), ('brand card', BV+'chore-royale/brand-card.png'))
A('cr', 'logo', ('logo', BV+'chore-royale/logo-stacked.png'), ('wordmark', BV+'chore-royale/wordmark.png'), ('logo mark', BV+'chore-royale/logo-mark.png'))
# --- Trashure Hunters: current site art (th-site), real screens, plus the best of the old site's character art (src/legacy)
A('th', 'screen', ('map screen', S9+'th-map.webp'), ('hatch screen', S9+'th-hatch.webp'), ('cinematic', S9+'th-cine.webp'),
  ('website', W+'trashure-hunters/site-desktop.webp'), ('website, mobile', W+'trashure-hunters/site-mobile.webp'), ('splash screen', TH+'splash.webp'),
  ('Air map', TH+'map-air.webp'), ('Earth map', TH+'map-earth.webp'), ('Fire map', TH+'map-fire.webp'), ('Water map', TH+'map-water.webp'),
  ('park', TH+'park-bg.webp'), ('character line-up sheet', LG+'th-lineup.webp'), ('brand board', LG+'th-brandboard.webp'), ('app screens', LG+'th-app-screens.webp'))
A('th', 'art', *[(n, TH + f + '.webp') for n, f in [('Blazo', 'blazo'), ('Bloop', 'bloop'), ('Cosmix', 'cosmix'), ('Orbo', 'orbo'), ('Sproutz', 'sproutz'), ('Wispo', 'wispo'),
  ('Cosmic compo', 'compo-cosmic'), ('Fluff compo', 'compo-fluff'), ('Fluid compo', 'compo-fluid'), ('Leaf compo', 'compo-leaf'),
  ('Air egg', 'egg-air'), ('Earth egg', 'egg-earth'), ('Fire egg', 'egg-fire'), ('Space egg', 'egg-space'), ('Water egg', 'egg-water'),
  ('Air Grime', 'gz-air'), ('Earth Grime', 'gz-earth'), ('Fire Grime', 'gz-fire'), ('Space Grime', 'gz-space'), ('King Grime', 'kinggrime'),
  ('asteroid', 'f-asteroid'), ('balloon', 'f-balloon'), ('bubble', 'f-bubble'), ('cloud', 'f-cloud'), ('flame', 'f-flame'), ('jellyfish', 'f-jelly'), ('leaf', 'f-leaf'),
  ('barrel', 'rf-barrel'), ('bottle', 'rf-bottle'), ('charcoal', 'rf-charcoal'), ('debris', 'rf-debris'), ('wrapper', 'rf-wrapper'), ('water gun', 'watergun'),
  ('captured', 'i-captured'), ('Trash-Cam', 'i-trashcam'), ('light cell', 'light-cell')]])
A('th', 'art', ('Cyclops star', LG+'th-star.webp'), ('Trashure Hunters logo', LG+'th-logo-monster.webp'))
A('th', 'dark', *[(l, LG + f + '.webp') for l, f in [ ('Aqua cyclops', 'th-blue'),
  ('Amber cyclops', 'th-amber'), ('Ember cyclops', 'th-orange'), ('Scale cyclops', 'th-scales'), ('Mint cyclops', 'th-ghost'), ('Peach cyclops', 'th-peach'),
  ('Pink cyclops', 'th-pink'), ('Red cyclops', 'th-red'), ('Silver cyclops', 'th-silver'), ('Crowned cyclops', 'th-gold'), ('Teal cyclops', 'th-teal'),
  ('Rainbow cyclops', 'th-rainbow'), ('Litter cyclops', 'th-litter'), ('Lilac cyclops', 'th-lilac'), ('Chrome cyclops', 'th-chrome-green'),
  ('Bubble cyclops', 'th-bubble'), ('Sunny cyclops', 'th-yellow'), ('Water-gun cyclops', 'th-watergun'), ('Ranger cyclops', 'th-ranger')]])
A('th', 'logo', ('logo', TH+'logo.webp'), ('app icon', TH+'th-icon.webp'), ('wordmark', LG+'th-wordmark.webp'), ('Air king', H+'th-king-air.webp', 'art'),
  ('Earth king', H+'th-king-earth.webp', 'art'), ('Fire king', H+'th-king-fire.webp', 'art'), ('Space king', H+'th-king-space.webp', 'art'), ('Water king', H+'th-king-water.webp', 'art'))
# --- Milo: only the current brand (pixel polar bear, no sunglasses)
A('mi', 'detail', ('Milo, calm', MV+'character/milo-calm-nochain.png'), ('Milo, breathing', MV+'character/milo-breathe-nochain.png'), ('Milo, proud', MV+'character/milo-proud-nochain.png'))
A('mi', 'square', ('avatar, calm', MV+'character/avatar-calm.png'), ('avatar, breathing', MV+'character/avatar-breathe.png'), ('avatar, proud', MV+'character/avatar-proud.png'),
  ('app icon', MV+'logo/app-icon-1024.png'), ('brand card', MV+'logo/brand-card.png'))
A('mi', 'logo', ('wordmark', MV+'logo/wordmark-pink.png'), ('wordmark on light', MV+'logo/wordmark-pink-deep.png'), ('lockup', MV+'logo/lockup-horizontal-on-dark.png'),
  ('lockup on light', MV+'logo/lockup-horizontal-on-light.png'))
A('mi', 'screen', ('moods', MV+'character/moods-nochain.png'))
# --- Rookie & King (brand-v3/rk and src/rk-board*.webp are kept current by the R&K agent: whatever is there when this runs is what we use)
A('rk', 'square', ('app icon', BV+'rk/app-icon.png'), ('brand card', BV+'rk/brand-card.png'))
A('rk', 'screen', ('the board', OUT+'/src/rk-board-play.webp'), ('hero', BV+'rk/hero.png'), ('icon set', BV+'rk/icons.png'))
A('rk', 'square', ('board close-up', OUT+'/src/rk-board.webp'))
A('rk', 'logo', ('mark', BV+'rk/logo-mark.png'), ('logo', BV+'rk/logo.png'), ('logo on light', BV+'rk/logo-on-light.png'), ('stacked logo', BV+'rk/logo-stacked.png'),
  ('mark on light', BV+'rk/mark-on-light.png'), ('mark, flat', BV+'rk/mark-flat.png'), ('rookie piece', BV+'rk/piece-rookie.png'), ('king piece', BV+'rk/piece-king.png'),
  ('wordmark', BV+'rk/wordmark.png'), ('display wordmark', BV+'rk/wordmark-display.png'))
# --- EZRA
A('ez', 'screen', ('splash screen', S9+'ezra-splash.webp'), ('tasks screen', W+'s16/ez-tasks-v5.webp'), ('hero', BV+'ezra/hero.png'), ('icon set', BV+'ezra/icons.png'))
A('ez', 'square', ('app icon', BV+'ezra/app-icon.png'), ('brand card', BV+'ezra/brand-card.png'))
A('ez', 'logo', ('mark', BV+'ezra/logo-mark.png'), ('logo', BV+'ezra/logo.png'), ('logo on dark', BV+'ezra/logo-on-dark.png'), ('wordmark', 'assets/studio/logos/ezra.png'))
# --- FaiRent (current app screens and brand)
A('fr', 'screen', ('home screen', W+'fairent/app-home.webp'), ('price result', W+'fairent/app-result.webp'), ('message', W+'fairent/app-message.webp'),
  ('data screen', W+'fairent/app-data.webp'), ('compare screen', W+'fairent/app-compare.webp'), ('form screen', W+'fairent/app-form.webp'),
  ('hero', BV+'fairent/hero.png'), ('icon set', BV+'fairent/icons.png'))
A('fr', 'square', ('app icon', BV+'fairent/app-icon.png'), ('brand card', BV+'fairent/brand-card.png'), ('light app icon', BV+'fairent/app-icon-light.png'))
A('fr', 'logo', ('mark', BV+'fairent/logo-mark.png'), ('logo', BV+'fairent/logo.png'), ('logo on dark', BV+'fairent/logo-on-dark.png'))
# --- AposHealth and VIBRANT (HealthTech case work) + the same brands from the old site
A('ap', 'screen', *[('brand work', W+'healthtech/ap-%d.webp' % i) for i in (1, 2, 4, 6)],
  ('companion app', LG+'ap-app.webp'), ('website and app', LG+'ap-site.webp'), ('medical icons', LG+'ap-icons.webp'),
  ('foot anatomy', LG+'ap-foot.webp'), ('gait cycle', LG+'ap-gait.webp'), ('logo variations', LG+'ap-marks.webp'), ('print collateral', LG+'ap-docs.webp'))
A('ap', 'logo', ('logo', W+'healthtech/ap-logo.png'), ('logo', LG+'ap-logo.webp'))
A('vb', 'screen', *[('brand work', W+'healthtech/vb-%d.webp' % i) for i in (1, 2, 3, 4, 5, 6)], ('brand book', LG+'vb-brandbook.webp'), ('logo spacing', LG+'vb-spacing.webp'))
A('vb', 'logo', ('logo', W+'healthtech/vb-logo.png'), ('logo', LG+'vb-logo.webp'), ('white logo', M+'vibrant-white.png'))
# --- 3Shamrocks Studio: marks and design work from the old 3shamrocks.com
A('st', 'logo', ('wordmark', LG+'st-wordmark.webp'), ('heart mark', LG+'st-heart.webp', 'art'), ('home icon', LG+'st-home-icon.webp', 'art'),
  ('Media Network mark', 'assets/studio/logos/media-network.png'), ('shamrock mark', 'assets/studio/heart-on-dark.png'))
A('st', 'screen', ('studio site', LG+'st-laptop.webp'), 
  ("tee: On Slater's Mind", LG+'tee-face.webp'), ("tee: On Slater's Mind", LG+'tee-face-white.webp'), ('tee: galaxy', LG+'tee-galaxy.webp'), ('tee: ocean', LG+'tee-ocean.webp'),
  ('tee: surf', LG+'tee-surf.webp'), ('tee: sunset', LG+'tee-sunset.webp'), ('tee: bloom', LG+'tee-bloom.webp'))
# ===== v3 additions: every other usable studio asset already in the repo (checked by eye, 8 Nov 2026) =====
SP, HW, MT, TP = 'assets/shomer-pilot/', 'assets/studio/s7/hw/', 'th-mvp/assets/assets/', 'th-mvp/assets/assets/trashures/'
A('sh', 'screen', ('pilot: trusted circles', SP+'app-circles.webp'), ('pilot: map', SP+'app-map.webp'), ('pilot: circles screen', SP+'brand-app-circles.webp'),
  ('pilot: first-aid guide', SP+'brand-app-guide.webp'), ('pilot: profile', SP+'brand-app-profile.webp'), ('pilot: live map', SP+'brand-app-map.webp'),
  ('neighbourhood illustration', SP+'hero-neighbours.webp'), ('neighbourhood, mobile', SP+'hero-neighbours-m.webp'),
  ('app screen', 'assets/real/shomer-screen1.jpg'), ('call screen', 'assets/studio/shomer-app-call.webp'), ('circles screen', 'assets/studio/shomer-app-circles.webp'),
  ('map screen', 'assets/studio/shomer-app-map.webp'), ('clean map', 'assets/studio/shomer-app-map-clean.webp'), ('guide screen', 'assets/studio/shomer-app-guide.webp'),
  ('map view', 'assets/studio/hero/shomer-map.webp'), ('near me', 'assets/studio/hero/shomer-near.webp'),
  ('member card', 'assets/studio/hero/shomer-card.webp'), ('command centre', M+'shomer-command-sm.webp'), ('command centre, wide', 'assets/studio/pf/shomer-command.webp'),
  ('app screen', 'assets/opt/shomer-screen.webp'), ('share card', 'assets/og/og-shomer.jpg'))
A('sh', 'square', ('badge', SP+'shomer-badge.webp'), ('badge, brand sheet', SP+'brand-badge.webp'), ('app icon', 'assets/products/shomergency.png'), ('badge', 'assets/opt/shomer.webp'))
A('lp', 'screen', ('cut screen', 'assets/studio/screens/lickpick-cut.webp'), ('pick screen', 'assets/studio/screens/lickpick-pick.webp'),
  ('style screen', 'assets/studio/screens/lickpick-style.webp'), ('share screen', 'assets/studio/screens/lickpick-share.webp'),
  ('welcome screen', 'assets/studio/screens/lickpick-welcome.webp'), ('share card', 'assets/og/og-lickpick.jpg'))
A('lp', 'logo', ('app icon', 'assets/studio/logos/lickpick.png'), ('app icon, v3', 'lickpick/app/icon-192-v3.png'), ('maskable icon', 'lickpick/app/icon-maskable-512-v5.png'))
A('cr', 'screen', ('spin screen', W+'chore-royale/scr-spin.jpg'), ('clan screen', W+'chore-royale/scr-clan.jpg'), ('chores list', W+'chore-royale/scr-chores.jpg'),
  ('wheel screen', W+'chore-royale/scr-wheel.jpg'), ('check screen', W+'chore-wars/scr-check.jpg'), ('chores screen', W+'chore-wars/scr-chores.jpg'),
  ('arena screen', W+'chore-wars/scr-arena.jpg'), ('wheel', 'assets/real/scr-chore.png'), ('hero', W+'s16/cr-hero.webp'), ('family show card', 'assets/screens/chore.png'),
  ('chores', 'assets/studio/hero/cw-chores.webp'), ('power cards', 'assets/studio/hero/cw-cards.webp'), ('arena', 'assets/studio/hero/cw-arena.webp'),
  ('share card', 'assets/og/og-chore-royale.jpg'))
A('cr', 'logo', ('crown', 'assets/brand/chore-logo.png'), ('crest', 'assets/chore/crest-cutout.webp', 'art'), ('logo', BV+'chore-royale/logo.png'),
  ('mark', BV+'chore-royale/logo-mark-512.webp'), ('stacked logo', BV+'chore-royale/logo-stacked-600.webp'), ('logo', W+'s16/cr-logo.webp'),
  ('app icon', W+'s16/cr-app-icon.webp'), ('crest', W+'chore-royale/crest-400.jpg', 'square'), ('logo', 'assets/studio/logos/chore-royale.png'))
A('th', 'screen', ('movie key art', 'assets/mockups/trashure-hunters-movie-keyart.png'), ('vibe board', 'assets/mockups/th-vibe.png'), ('hero team', 'assets/brand/th-hero-team.png'),
  ('map screen', W+'trashure/screen-map.png'), ('choose your team', W+'trashure/chooseteam.jpg'), ('splash', W+'trashure/splashscreen.png'),
  ('map', 'assets/opt/th-map.webp'), ('splash', 'assets/screens/th-splash.png'), ('live map', 'assets/studio/reels/th-live.webp'), ('team', TH+'team.webp'),
  ('park', TH+'park-bg.webp'), ('AR view', TH+'ar.webp'), ('share card', TH+'og.jpg'), ('onboarding park', MT+'THonbrd_BG.a00e439882550b87b6a76c139edff3ed.png'),
  ('share card', 'assets/og/og-trashure-hunters.jpg'))
A('th', 'logo', ('wordmark', 'assets/brand/th-wordmark.png'), ('wordmark', W+'trashure-hunters/logo-wordmark-white.png'), ('app icon', 'assets/real/th-icon.png'),
  ('logo', 'assets/products/trashure.png'), ('logo', 'assets/studio/logos/trashure-hunters.png'), ('app icon', TH+'apple-touch-icon.png'),
  ('Trash-Cam button', MT+'trashcam.01b33dc66e6d37b765b3ee0b2356cf9e.png'), ('logo', MT+'TH_logo.a59b661f9ae3657e7e0682b052a0d2e5.png'),
  ('wordmark', MT+'TH-text.f3a6e2ef300397aa01cfd9f8794af232.png'), ('Trashure Hunt button', MT+'trashure-hunt.dbf7d9b34686ab26980bbdaeb3c49a40.png'), ('home button', TH+'i-home.webp'))
A('th', 'art', *[(n, MT + f) for n, f in [('Earth hatchling', 'earth_lvl1.c255d2fc0ff1d5de37ef24dc74a22698.png'), ('Space hatchling', 'space_lvl1.fa1018ed3ca3911797d3e4dd6dca1061.png'),
  ('Water Elemonster', 'water_Elemonster.5d362d3d797a598ddb68311aaa4c4a87.png'), ('Water egg', 'water_lvl0.ee5630bcc6bc0686b452dcae52d27e1d.png'),
  ('Air hatchling', 'air_lvl1.bc9baf41cc3a6a4b824b10111d9329be.png'), ('Water hatchling', 'water_lvl1.8843a87d223559c98140a0177207eab7.png'), ('Orbo', 'Orbo.e96ce0c19022fca6a535d79f74a615de.png'),
  ('Air Elemonster', 'air_Elemonster.144a32c37cb85feea3353ca4aa9f0261.png'), ('King Grime', 'kingGrime.8b746ed5e419c61870ed7d7c84400049.png'), ('trash bag', 'trash.0662f1b2ed4462318554c37d1d6cc657.png'),
  ('Space king', 'space_king.beb34e9333515009cc2d40b07ab8b665.png'), ('Earth Elemonster', 'earth_Elemonster.57272ef53ad9d89bfb93a513f90e72e6.png'), ('Fire hatchling', 'fire_lvl1.0c63636d35492000fe442976c5af7b54.png'),
  ('Earth king', 'earth_king.e378264a64dce3e25c3181c850b801a6.png'), ('Water king', 'water_king.c18c620b1da7291e35953ecc3224be27.png'), ('Fire Elemonster', 'fire_Elemonster.9c46f75c3329ebf829b3367e2bb48b73.png'),
  ('Air king', 'air_king.8c963d309413e5e6f63a978f6d31a7fb.png'), ('Space egg', 'space_lvl0.d2e60689d5ef13c82a87b33dbba46679.png'), ('Fire king', 'fire_king.6f2cd50324519e12dc651b8daf1540fc.png'),
  ('Fire egg', 'fire_lvl0.26b259c23462cc66e747b3950b7246a5.png'), ('Space Elemonster', 'space_Elemonster.78ded492e6dc3c3b01ade7dc16ac7d5d.png'), ('Earth egg', 'earth_lvl0.98805b8855a544ee6922aebde789fd54.png'),
  ('Air egg', 'air_lvl0.84e03a53440b1937d6d1a8e9e22273dc.png'), ('water gun', 'AR_game/watergun_1_icon.82e769a053de446ede8b7157b7341ffc.png'),
  ('Leaf compo', 'Trashures PNG/compo_leaf_01.fd64c043dd3c586da43f35dd3af5ed33.png'), ('Cosmic compo', 'Trashures PNG/compo_cosmic_01.a82dc7ec239cb190182c349158a416e2.png'),
  ('Fluff compo', 'Trashures PNG/compo_fluff_01.13b1d2edcfec5d9d9cc9ca68bcf06116.png'), ('Fluid compo', 'Trashures PNG/compo_fluid_01.c93c16b247c859e5f572b9a2a7182d57.png'),
  ('space debris', 'Realms Assets/space_debris.65ff37d0c771af21b0d6a7968dfb17da.png'), ('bottle', 'Realms Assets/earth_bottle.9bf8eb48b3b539a16acdd841854b7f96.png'),
  ('flame', 'Realms Assets/fire_flame.b11fffa1845c58f13b8f667c3a72c337.png'), ('light cell', 'Realms Assets/Light_cell.76f4f70a4314b05a11a3786d14de8886.png'),
  ('Air Grime Zone', 'Realms Assets/GrimeZone_Air.45e37c24f9e8cc8f43e3d030ccfe519c.png'), ('charcoal', 'Realms Assets/fire_charcoal.be73a3f7174f237e6ebdb5269b4055a2.png'),
  ('bubble', 'Realms Assets/water_bubble.208ac934828e02529476b5687764559c.png'), ('Space Grime Zone', 'Realms Assets/GrimeZone_Space.8bd6aea770d9545178406e5bea5d39e5.png'),
  ('leaf', 'Realms Assets/earth_leaf.751a4e056b142e35f80986fd2a53d99d.png'), ('barrel', 'Realms Assets/fire_barrel.a0c50bfb58e24c54fe7caf3c4f182ca2.png'),
  ('asteroid', 'Realms Assets/space_asteroid.315957cd1a112b0381a0b7404bfca160.png'), ('Fire Grime Zone', 'Realms Assets/GrimeZone_Fire.c0d79203ac8c2673f72f3ee1d614238b.png'),
  ('Water Grime Zone', 'Realms Assets/GrimeZone_Water.b63647e5a4cb580dbc38507fa8b3c94c.png'), ('Earth Grime Zone', 'Realms Assets/GrimeZone_Earth.6c60d2d21819fb03d931027f12742796.png'),
  ('wrapper', 'Realms Assets/earth_wrapper.f0bcf46437c3d8a2786028648b80d1c2.png'), ('cloud', 'Realms Assets/air_cloud.7697bcfe6dcfc746693610cae4fcd786.png')]],
  *[(n, TH + f) for n, f in [('asteroid', 'rf-asteroid.webp'), ('bubble', 'rf-bubble.webp'), ('leaf', 'rf-leaf.webp'), ('flame', 'rf-flame.webp'), ('Space Grime', 'grime-space.webp'),
  ('Water Grime', 'gz-water.webp'), ('cloud', 'rf-cloud.webp')]],
  *[(n, M + f) for n, f in [('Air hatchling', 'th-air.webp'), ('Fire hatchling', 'th-fire.webp'), ('King Grime', 'th-grime.webp'), ('Water hatchling', 'th-water.webp'),
  ('Earth hatchling', 'th-earth.webp'), ('Space hatchling', 'th-space.webp')]],
  *[(n, W + 'trashure/' + f) for n, f in [('Earth hatchling', 'earth_lvl1.png'), ('Water hatchling', 'water_lvl1.png'), ('Fire hatchling', 'fire_lvl1.png'), ('King Grime', 'kingGrime.png'),
  ('Space hatchling', 'space_lvl1.png'), ('Air hatchling', 'air_lvl1.png'), ('hero group', 'hero-group.png')]])
A('th', 'square', *[('Trashure: ' + n, TP + f) for n, f in [('ember', 'ember_01.60979dd5e5e0bdf1b54855e33126c7dc.jpg'), ('cosmic', 'cosmic_03.ebd66a558b49bc149ee15d7d0fa43148.jpg'),
  ('fluid', 'fluid_01.8710f6a1d339d331c2adca51db3c5676.jpg'), ('cosmic', 'cosmic_02.2020ada82078b916caec26aaba79dd38.jpg'), ('cosmic', 'cosmic_04.97e7c17e4caf9e200511e25e43d8dc73.jpg'),
  ('metal', 'metal_03.89476cae360d559fb9774400a370cfb6.jpg'), ('fluff', 'fluff_01.4445b4abc35429b335bd21ae0e9cedcf.jpg'), ('scales', 'scales_01.ef93d5f3bb9e1e1e636c71289566bdfc.jpg'),
  ('leaf', 'leaf_01.137472b8cafdf35e60d09d69478eef02.jpg'), ('crystal', 'crystal_01.f7ba46f244d7788639fb75079db8f7ff.jpg'), ('fluff', 'fluff_03.9d8d37da3b207376a0981c1709d8c31e.jpg'),
  ('cosmic', 'cosmic_01.f9f3225675d68f2d1aa9003f06a8ff69.jpg'), ('metal', 'metal_04.e35c2650284ce4d4d6bded7222c75952.jpg'), ('ember', 'ember_03.dd36d9fdd6edc04086458d441275db83.jpg'),
  ('metal', 'metal_02.96f651e4ad97aebd78758a1f71055e7e.jpg'), ('rainbow', 'rainbow_01.215739bb5eaf5ce1014eda469b51ed97.jpg'), ('leaf', 'leaf_02.cd53d3af056aab042ac1d72784bab76d.jpg'),
  ('fluff', 'fluff_02.9ac2ba660c275885c62c719f58f17436.jpg')]])
A('mi', 'square', ('calm face', W+'milo/milo-v2-calm-face.webp'), ('proud face', W+'milo/milo-v2-proud-face.webp'), ('avatar, breathing', W+'milo/milo-v2-av-breathe.webp'),
  ('avatar, calm', W+'milo/milo-v2-av-calm.webp'), ('popsicle', W+'milo/milo-pop.webp'), ('app icon', MV+'logo/app-icon-180.png'), ('pixel eyes', MV+'character/eye-area-2x.png'))
A('mi', 'logo', ('wordmark', W+'milo/milo-wordmark.png'))
A('rk', 'logo', ('wordmark on light', BV+'rk/wordmark-on-light.png'), ('display wordmark on light', BV+'rk/wordmark-display-on-light.png'), ('favicon', BV+'rk/favicon-180.png'),
  ('app icon', BV+'rk/app-icon-180.png'), ('stacked logo on light', BV+'rk/logo-stacked-on-light.png'), ('mark', W+'rk/rk-mark.webp'), ('logo', W+'rk/rk-logo.webp'))
A('rk', 'screen', ('concept card', 'assets/studio/concepts/rk.webp'))
A('ez', 'screen', ('concept card', 'assets/studio/concepts/ezra.webp'), ('tasks screen', S9+'ezra-tasks.webp'), ('voice screen', 'assets/screens/ezra.png'), ('share card', 'assets/og/og-ezra.jpg'))
A('ez', 'square', ('helping hand', 'assets/brand/ezra-situational.jpg'), ('helping hand', 'assets/products/ezra.jpg'))
A('ez', 'logo', ('mark', W+'s16/ez-mark.webp'), ('logo', W+'s16/ez-logo.webp'), ('logo on dark', W+'s16/ez-logo-dark.webp'), ('app icon', W+'s16/ez-app-icon.webp'),
  ('hand mark', 'assets/studio/pf/ezra-mark.png'), ('hand mark', H+'ezra-mark.png'))
A('fr', 'screen', ('overcharge flow', 'assets/mockups/fairent-hogen-overcharge-flow.png'), ('gauge screen', 'assets/real/scr-fairent.png'), ('message script', S9+'fr-script.webp'),
  ('share card', 'assets/og/og-fairent.jpg'))
A('fr', 'square', ('fair-rent scales', 'assets/concept/hogen.jpg'), ('iOS app icon', BV+'fairent/app-icon-ios-1024.png'))
A('fr', 'logo', ('wordmark', 'assets/brand/fairent-wordmark-white.png'), ('mark', W+'s16/fr-mark.webp'), ('logo', W+'s16/fr-logo.webp'), ('logo on dark', W+'s16/fr-logo-dark.webp'),
  ('app icon', W+'s16/fr-app-icon.webp'), ('logo', 'assets/studio/logos/fairent.png'))
A('ap', 'screen', *[('brand work', W+'healthtech/ap-%d.webp' % i) for i in (1, 2, 4, 6)], *[('brand work', W+'aposhealth/screen-%d.png' % i) for i in (1, 2, 4, 6)],
  ('gait study', 'assets/studio/apos-gait.webp'), ('app screen', M+'apos-screen.webp'), ('logo system', HW+'ap-logo.webp'), ('medical icons', HW+'ap-icons.webp'),
  ('gait cycle', HW+'ap-gait.webp'), ('logo system', S9+'ap-logo.webp'), ('medical icons', S9+'ap-icons.webp'), ('gait cycle', S9+'ap-gait.webp'), ('HealthTech card', 'assets/og/og-healthtech.jpg'))
A('ap', 'logo', ('logo', W+'aposhealth/logo.png'))
A('vb', 'screen', *[('brand work', W+'vibrant/screen-%d.png' % i) for i in (1, 2, 3, 4, 5, 6)], ('brand book', 'assets/opt/vibrant.webp'),
  ('icon set', HW+'vb-icons.webp'), ('app home', HW+'vb-app-home.webp'), ('app tour', HW+'vb-app-tour2.webp'), ('app tour, results', HW+'vb-app-tour3.webp'),
  ('app tour, messages', HW+'vb-app-tour4.webp'), ('logo spacing', HW+'vb-logo.webp'), ('brand book', HW+'vb-brand.webp'), ('website', HW+'vb-web.webp'),
  ('icon set', S9+'vb-icons.webp'), ('logo spacing', S9+'vb-logo.webp'), ('app screens', S9+'vb-app.webp'), ('brand book', S9+'vb-brand.webp'))
A('vb', 'logo', ('logo', M+'vibrant.png'))
A('st', 'logo', ('wordmark', 'assets/studio/3shamrocks.png'), ('wordmark on light', 'assets/studio/3shamrocks_black.png'), ('3S logo', 'assets/studio/3S_logo.png'),
  ('heart mark on light', 'assets/studio/heart-on-light.png'), ('human-centred icon', 'assets/studio/icon-human.png'), ('systems icon', 'assets/studio/icon-systems.png'),
  ('ops icon', 'assets/studio/icon-ops.png'), ('design system', 'assets/products/design-system.png'), ('wordmark', SP+'brand-3shamrocks.png'), ('wordmark', SP+'3shamrocks-studio.webp'),
  ('wordmark', 'lickpick/assets/3shamrocks.png'), ('wordmark', TH+'studio.webp'),
  ('client logo: Guberman', W+'clients/guberman.png'), ('client logo: Eldan', W+'clients/eldan.png'), ('client logo: Winplant', W+'clients/winplant.png'))
A('st', 'screen', ('river of three', 'assets/studio/s7/river-of-three.webp'))

# brand palettes (colour swatch tiles): the brand-v3 palette files where they exist, otherwise sampled from the brand's own marks
PAL_SRC = {'cr': BV+'chore-royale/palette.json', 'ez': BV+'ezra/palette.json', 'fr': BV+'fairent/palette.json', 'rk': BV+'rk/palette.json',
           'sh': [W+'shomer/badge.webp', S9+'sh-map.webp', SP+'brand-app-circles.webp'], 'lp': ['lickpick/app/icon-512-v5.png', S9+'lp-home.webp'],
           'th': [TH+'logo.webp', TH+'team.webp', TH+'map-earth.webp'], 'mi': [MV+'logo/brand-card.png'], 'ap': [LG+'ap-logo.webp', W+'healthtech/ap-1.webp', LG+'ap-icons.webp'],
           'vb': [LG+'vb-brandbook.webp', W+'healthtech/vb-1.webp'], 'st': ['assets/studio/heart-on-dark.png', LG+'st-wordmark.webp', LG+'st-laptop.webp']}

SAME = [[W+'shomer/badge.webp', 'assets/studio/logos/shomer.png', SP+'shomer-badge.webp', SP+'brand-badge.webp', 'assets/opt/shomer.webp', 'assets/products/shomergency.png'],
        [LG+'ap-logo.webp', W+'healthtech/ap-logo.png', W+'aposhealth/logo.png'], [LG+'vb-logo.webp', W+'healthtech/vb-logo.png', M+'vibrant-white.png', M+'vibrant.png'],
        [LG+'st-heart.webp', 'assets/studio/heart-on-dark.png', 'assets/studio/heart-on-light.png'], [LG+'th-wordmark.webp', TH+'logo.webp']]
PIECE = {q: g[0] for g in SAME for q in g}
DARK, LIGHT = (16, 12, 30), (240, 238, 246)

def on_bg(im, col):
  bg = Image.new('RGBA', im.size, col + (255,)); bg.alpha_composite(im); return bg.convert('RGB')

def contain(im, col, f=.86):
  im = im.copy(); im.thumbnail((int(C * f), int(C * f)), Image.LANCZOS)
  bg = Image.new('RGBA', (C, C), col + (255,)); bg.alpha_composite(im, ((C - im.width) // 2, (C - im.height) // 2)); return bg.convert('RGB')

def crops(im, n):
  w, h = im.size; s = min(w, h); out = []
  for k in range(n):
    t = (k + .5) / n
    x = int((w - s) * t) if w > h else 0; y = int((h - s) * t) if h > w else 0
    out.append(im.crop((x, y, x + s, y + s)).resize((C, C), Image.LANCZOS))
  return out

def windows(rgb, frac, k, steps=6):
  """k detail crops (square, frac of the short side) from the busiest, mutually distant parts of the image"""
  w, h = rgb.size; s = int(min(w, h) * frac)
  if s < 40: return []
  small = rgb.resize((max(1, w // 4), max(1, h // 4)), Image.BILINEAR); a = np.asarray(small, dtype=np.float32) / 255; L_ = a @ np.array([.299, .587, .114])
  cand = []
  for yy in np.linspace(0, h - s, steps).astype(int):
    for xx in np.linspace(0, w - s, steps).astype(int):
      sub = L_[yy // 4:(yy + s) // 4, xx // 4:(xx + s) // 4]
      if sub.size: cand.append((float(sub.std()), xx, yy))
  cand.sort(key=lambda c: -c[0]); out = []
  for sc, xx, yy in cand:
    if sc < .035: break
    if all(abs(xx - px) + abs(yy - py) > s * .7 for _, px, py in out): out.append((sc, xx, yy))
    if len(out) == k: break
  return [rgb.crop((xx, yy, xx + s, yy + s)).resize((C, C), Image.LANCZOS) for _, xx, yy in out]

def dark_windows(rgb, frac, k, steps=7):
  """quiet dark close-ups of dark screens (fragments of the UI chrome, cards, map): the beard, suit and backdrop need
  many more dark tiles than bright ones, and each tile may only show twice"""
  w, h = rgb.size; s = int(min(w, h) * frac)
  if s < 48: return []
  small = rgb.resize((max(1, w // 4), max(1, h // 4)), Image.BILINEAR); L_ = (np.asarray(small, dtype=np.float32) / 255) @ np.array([.299, .587, .114])
  cand = []
  for yy in np.linspace(0, h - s, steps).astype(int):
    for xx in np.linspace(0, w - s, steps).astype(int):
      sub = L_[yy // 4:(yy + s) // 4, xx // 4:(xx + s) // 4]
      if sub.size and sub.mean() < .22 and .025 < sub.std() < .2: cand.append((float(sub.std()), xx, yy))
  cand.sort(key=lambda c: -c[0]); out = []
  for sc, xx, yy in cand:
    if all(abs(xx - px) + abs(yy - py) > s * .6 for _, px, py in out): out.append((sc, xx, yy))
    if len(out) == k: break
  return [rgb.crop((xx, yy, xx + s, yy + s)).resize((C, C), Image.LANCZOS) for _, xx, yy in out]

def has_alpha(im): return im.getchannel('A').getextrema()[0] < 250

def bbox_rgb(im, col):
  b = im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox() if has_alpha(im) else None
  rgb = on_bg(im, col); return rgb.crop(b) if b else rgb

def tiles_of(path, mode):
  im = Image.open(path).convert('RGBA'); im.thumbnail((1600, 1600), Image.LANCZOS); w, h = im.size
  if mode in ('logo', 'art', 'icon'):
    f = .86 if mode == 'logo' else .94
    v = [contain(im, DARK, f), contain(im, LIGHT, f)] if has_alpha(im) else [contain(im, tuple(im.getpixel((2, 2))[:3]), f)]
    if mode == 'icon' or min(w, h) < 160: return v
    bb = bbox_rgb(im, DARK); bw, bh = bb.size
    if mode == 'art':   # the character's face (upper middle) plus close-ups of its texture
      s_ = int(min(bw, bh) * .62); x0 = (bw - s_) // 2; y0 = int(bh * .12)
      v.append(bb.crop((x0, y0, x0 + s_, y0 + s_)).resize((C, C), Image.LANCZOS))
      v += windows(bb, .42, 2)
    else:               # logo lockups: a crop of the mark/letters
      v += windows(bb, .55 if max(bw, bh) / max(1, min(bw, bh)) < 2 else .9, 1 if max(bw, bh) / max(1, min(bw, bh)) < 2 else 2)
    return v
  if mode == 'dark': return [contain(im, DARK, .94)] + windows(bbox_rgb(im, DARK), .5, 2)
  rgb = on_bg(im, DARK)
  if mode == 'square': return crops(rgb, 1) + windows(rgb, .5, 3) + windows(rgb, .3, 2) + dark_windows(rgb, .3, 3)
  if mode == 'detail':  # whole character plus close-ups (face, popsicle)
    return [rgb.resize((C, C), Image.LANCZOS)] + [rgb.crop((int(w * a), int(h * b), int(w * c), int(h * d))).resize((C, C), Image.LANCZOS)
                                                  for a, b, c, d in ((.14, .06, .70, .62), (.46, .38, 1., .94))] + windows(rgb, .3, 2)
  r = max(w, h) / min(w, h)
  v = crops(rgb, 1 if r < 1.25 else 2 if r < 2 else 3 if r < 3 else 4)
  if r >= 1.25: v.append(contain(im, (22, 18, 38)))
  v += windows(rgb, .5, 3)                               # UI fragments
  if min(w, h) >= 420: v += windows(rgb, .28, 3)         # close-ups: icons, buttons, type
  if float(np.asarray(rgb.resize((32, 32)), dtype=np.float32).mean() / 255) < .32:
    v += dark_windows(rgb, .42, 4) + dark_windows(rgb, .26, 6) + dark_windows(rgb, .17, 6)
  return v

def busy(t):  # share of pixels that differ from the tile's own background
  a = np.asarray(t, dtype=np.int16); return float((np.abs(a - a[2, 2]).max(2) > 28).mean())

def palette_of(p):
  s = PAL_SRC[p]
  if isinstance(s, str):
    return [tuple(int(c['hex'][i:i + 2], 16) for i in (1, 3, 5)) for c in json.load(open(s))['palette']][:8]
  ims = [Image.open(q).convert('RGB').resize((160, 160)) for q in s if os.path.exists(q)]
  sheet = Image.new('RGB', (160 * len(ims), 160))
  for i, q in enumerate(ims): sheet.paste(q, (160 * i, 0))
  qz = sheet.quantize(12, method=Image.Quantize.MEDIANCUT); pal = qz.getpalette()[:36]; cnt = sorted(qz.getcolors(), reverse=True)
  out = []
  for n, i in cnt:
    c = tuple(pal[i * 3:i * 3 + 3])
    if all(sum(abs(a - b) for a, b in zip(c, o)) > 60 for o in out): out.append(c)
  return out[:6]

def swatches(cols):
  n = len(cols); out = []
  t = Image.new('RGB', (C, C)); [t.paste(c, (i * C // n, 0, (i + 1) * C // n, C)) for i, c in enumerate(cols)]; out.append(t)
  t = Image.new('RGB', (C, C), cols[0]); [t.paste(c, (0, (i + 1) * C // (n + 1), C, (i + 2) * C // (n + 1))) for i, c in enumerate(cols[1:] + cols[:1])]; out.append(t)
  t = Image.new('RGB', (C, C), cols[0]); h2 = C // 2
  for i, c in enumerate(cols[1:4]): t.paste(c, ((i + 1) % 2 * h2, (i + 1) // 2 * h2, (i + 1) % 2 * h2 + h2, (i + 1) // 2 * h2 + h2))
  out.append(t)
  t = Image.new('RGB', (C, C), cols[-1]); k = min(n, 4)
  for i, c in enumerate(cols[:k]): m = i * C // (2 * k + 1); t.paste(c, (m, m, C - m, C - m))
  out.append(t)
  return out

tiles, missing, dropped = [], [], 0
for p, label, path, mode in SRC:
  if not os.path.exists(path): missing.append(path); continue
  vs = tiles_of(path, mode)
  for t in vs:
    if mode in ('logo', 'art', 'icon') and len(vs) > 1 and t is not vs[0] and busy(t) < .16: dropped += 1; continue   # keep the first view of every piece
    tiles.append((p, label, t, PIECE.get(path, path)))
for p in PAL_SRC:
  for t in swatches(palette_of(p)): tiles.append((p, 'colour palette', t, 'palette:' + p))
print('sources', len(SRC) - len(missing), 'missing', missing, 'tiles', len(tiles), 'mostly-empty dropped', dropped)
# near-duplicates (same art from another file or size, overlapping crops) are dropped: 8x8 colour signature distance
sig = np.array([np.asarray(t[2].resize((8, 8), Image.BILINEAR), dtype=np.float32).ravel() / 255 for t in tiles])
keep = []
for i in range(len(tiles)):
  thr = .018 + .027 * min(1., float(sig[i].mean()) / .3)     # dark tiles differ in smaller steps: finer threshold
  if keep and np.abs(sig[keep] - sig[i]).mean(1).min() < thr: continue
  if float(np.asarray(tiles[i][2], dtype=np.float32).std()) < 3: continue    # flat: nothing of the work shows
  keep.append(i)
tiles = [tiles[i] for i in keep]
print('after de-dup', len(tiles))
if len(tiles) > MAXT: raise SystemExit('too many tiles %d > %d' % (len(tiles), MAXT))
from collections import Counter; print(dict(Counter(t[0] for t in tiles)))

meta = []
for p, label, t, _ in tiles:
  a = np.asarray(t, dtype=np.float32) / 255
  q = a.reshape(2, C // 2, 2, C // 2, 3).mean((1, 3)).reshape(4, 3)
  meta.append({'p': p, 'l': label, 'm': [round(float(c), 3) for c in a.reshape(-1, 3).mean(0)], 'q': q,
               'sd': float((a @ np.array([.299, .587, .114])).std())})
pieceid = {}; G = [pieceid.setdefault(t[3], len(pieceid)) for t in tiles]

# --- target: Dave's real photo (cut-out) over the section's own backdrop gradient ---
cut = Image.open('assets/studio/dave-portrait-cut.webp').convert('RGBA'); PW, PH = cut.size
g = np.linspace(0, 1, PH)[:, None, None]
grad = (np.array([42, 26, 82]) * (1 - g) + np.array([22, 13, 51]) * g) * np.ones((PH, PW, 3))
bg = Image.fromarray(grad.astype(np.uint8)).convert('RGBA'); bg.alpha_composite(cut)
photo = np.asarray(bg.convert('RGB'), dtype=np.float32) / 255
alpha = np.asarray(cut, dtype=np.float32)[..., 3] / 255
lum = photo @ np.array([.299, .587, .114])
gy, gx = np.gradient(np.asarray(Image.fromarray((lum * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)), dtype=np.float32))
energy = np.hypot(gx, gy)
yy, xx = np.mgrid[0:PH, 0:PW]
face = np.exp(-(((xx - 400) / 150) ** 2 + ((yy - 300) / 230) ** 2))   # head + beard region of this photo
Y0 = 410  # lower half (beard, shirt, suit): matched on a levels curve so dark tones separate
def levels(c, lo=.025, hi=.80, gam=1.12):
  return np.clip((c - lo) / (hi - lo), 0, 1) ** gam
match_lo = levels(photo)

def geometry(N, base_cols, min_div):
  S0 = PW / base_cols; rows = math.ceil(PH / S0)
  cells = [(c * S0, r * S0, S0) for r in range(rows) for c in range(base_cols)]
  def score(c):
    x, y, s = c
    if s / 2 < S0 / min_div - 1e-6: return -1
    sl = (slice(int(y), min(PH, int(y + s))), slice(int(x), min(PW, int(x + s))))
    if energy[sl].size == 0: return -1
    return (energy[sl].mean() + 4) * (1 + 5 * face[sl].mean()) * (alpha[sl].mean() + .15) * s * s
  h = [(-score(c), i, c) for i, c in enumerate(cells)]; heapq.heapify(h); out = []; k = len(h)
  while len(h) + len(out) < N and h:
    sc, _, c = heapq.heappop(h)
    if sc >= 0: out.append(c); continue
    x, y, s = c; s2 = s / 2
    for d in [(0, 0), (s2, 0), (0, s2), (s2, s2)]:
      k += 1; n = (x + d[0], y + d[1], s2); heapq.heappush(h, (-score(n), k, n))
  cells = out + [c for _, _, c in h]
  cells = [c for c in cells if c[0] < PW and c[1] < PH]
  out = []
  for x, y, s in cells:
    sl = (slice(int(y), min(PH, int(y + s))), slice(int(x), min(PW, int(x + s))))
    fig, sub = alpha[sl].mean(), lum[sl]
    split = y >= Y0 - 1e-6 and fig > .5 and (s > S0 * .75 or (s > S0 * .375 and face[sl].mean() > .25 and sub.std() > .07))
    if split: out += [(x + dx, y + dy, s / 2) for dy in (0, s / 2) for dx in (0, s / 2) if x + dx < PW and y + dy < PH - .5]
    else: out.append((x, y, s))
  return out

PK = list(PRODUCTS); TP = np.array([PK.index(m['p']) for m in meta]); TG = np.array(G)
TM = np.array([m['m'] for m in meta]); TQ = np.array([m['q'] for m in meta]); TS = np.array([m['sd'] for m in meta])
TMl, TQl = levels(TM), levels(TQ)
TL = TM @ np.array([.299, .587, .114])

def layout(N, base_cols, min_div, seed):
  cells = geometry(N, base_cols, min_div); n = len(cells)
  X = np.array([c[0] for c in cells]); Y = np.array([c[1] for c in cells]); Sz = np.array([c[2] for c in cells])
  eps = Sz.min() * .08
  def sl_of(x, y, s): return (slice(int(y), min(PH, int(round(y + s)))), slice(int(x), min(PW, int(round(x + s)))))
  fcell = np.array([face[sl_of(*c)].mean() + alpha[sl_of(*c)].mean() * .5 for c in cells])
  order = np.argsort(-fcell, kind='stable')   # the face and figure first, so they get the best match; backdrop last
  rnd = random.Random(seed)
  pc = np.zeros(len(PK)); PCAP = .2 * n   # no product takes more than 20% of the cells
  ua = np.zeros(len(meta)); ub = np.zeros(len(meta)); up = np.zeros(len(pieceid)); pused = np.zeros(len(PK))
  A_, B_ = np.full(n, -1), np.full(n, -1); res = [None] * n
  relaxed = 0
  for ci in order:
    x, y, s = cells[ci]; sl = sl_of(x, y, s)
    nb = np.where((X < x + s + eps) & (X + Sz > x - eps) & (Y < y + s + eps) & (Y + Sz > y - eps))[0]
    nb = nb[nb != ci]
    nbt = [t for t in np.concatenate([A_[nb], B_[nb]]) if t >= 0]
    banned = np.zeros(len(meta), bool); banned[nbt] = True
    banned |= np.isin(TG, TG[nbt]) if nbt else False   # the same piece of work never touches itself either
    low = y >= Y0 - 1e-6
    reg = (match_lo if low else photo)[sl]; hh, ww = reg.shape[:2]
    mean = photo[sl].reshape(-1, 3).mean(0); mm = reg.reshape(-1, 3).mean(0)
    q = np.array([reg[:max(1, hh // 2), :max(1, ww // 2)].reshape(-1, 3).mean(0), reg[:max(1, hh // 2), ww // 2:].reshape(-1, 3).mean(0) if ww > 1 else mm,
                  reg[hh // 2:, :max(1, ww // 2)].reshape(-1, 3).mean(0) if hh > 1 else mm, reg[hh // 2:, ww // 2:].reshape(-1, 3).mean(0) if hh > 1 and ww > 1 else mm])
    fig = alpha[sl].mean()
    rn = np.array([rnd.random() for _ in meta])
    if not low:
      d = ((TQ - q) ** 2).sum((1, 2)) + 2 * ((TM - mean) ** 2).sum(1) + .045 * ua + rn * .012
    else:
      dk = 1 - min(1, float(mm @ np.array([.299, .587, .114])) / .45)
      # dark tones: favour quiet tiles (their detail is what turns the beard and suit muddy)
      d = (((TQl - q) ** 2).sum((1, 2)) + 3 * ((TMl - mm) ** 2).sum(1) + (.02 + .5 * dk) * TS ** 2 + .04 * ua + rn * .006)
    if fig < .3:   # backdrop cells show the work in its own colours (dimmed), so spread them across every product
      d = .03 * d + .004 * pused[TP] + .006 * ua + 3 * np.maximum(0, TL - .22) ** 2 + rn * .02   # keep the backdrop moody: pale tiles go to the face
    def pick(extra_ban, cnt, cap):
      ok = ~banned & ~extra_ban & (cnt < cap) & (ua + ub < CAP_ALL) & (up[TG] < CAP_PIECE) & (pc[TP] < PCAP)
      if not ok.any(): ok = ~banned & ~extra_ban & (cnt < cap) & (ua + ub < CAP_ALL) & (up[TG] < CAP_PIECE)   # relax: product share, then piece cap
      if not ok.any(): ok = ~banned & ~extra_ban & (cnt < cap) & (ua + ub < CAP_ALL)
      if not ok.any(): return None
      dd = np.where(ok, d, 1e9); return int(np.argmin(dd))
    a = pick(np.zeros(len(meta), bool), ua, CAP_TILE)
    if a is None: a = int(np.argmin(np.where(~banned, d, 1e9))); relaxed += 1
    xb = np.zeros(len(meta), bool); xb[a] = True; xb |= TG == TG[a]
    # the alternate (shown when the tile flips) is a good match too, but a different piece
    top = np.argsort(np.where(~banned & ~xb & (ua + ub < CAP_ALL), d, 1e9))[:3]
    b = int(top[rnd.randrange(len(top))])
    ua[a] += 1; ub[b] += 1; up[TG[a]] += 1; pc[TP[a]] += 1
    if fig < .3: pused[TP[a]] += 1
    A_[ci], B_[ci] = a, b
    res[ci] = [round(x / PW, 5), round(y / PW, 5), round(s / PW, 5), a, b] + [round(float(c), 3) for c in mean] + [round(float(fig), 2)]
  res.sort(key=lambda r: (r[1], r[0]))
  return res, ua, ub, up, relaxed


desk, uad, ubd, upd, rl1 = layout(1400, 22, 4, 7); mob, uam, ubm, upm, rl2 = layout(950, 18, 4, 11)
print('desktop cells', len(desk), 'mobile cells', len(mob), 'relaxed', rl1, rl2)
for nm, ua_, ub_, up_ in (('desktop', uad, ubd, upd), ('mobile', uam, ubm, upm)):
  print(nm, 'tiles at rest', int((ua_ > 0).sum()), 'tiles incl. flips', int(((ua_ + ub_) > 0).sum()), 'max rest use', int(ua_.max()),
        'max rest+flip use', int((ua_ + ub_).max()), 'max piece use', int(up_.max()))
assert rl1 == rl2 == 0 and max(uad.max(), uam.max()) <= CAP_TILE and max((uad + ubd).max(), (uam + ubm).max()) <= CAP_ALL
used = sorted(set(r[3] for r in desk + mob) | set(r[4] for r in desk + mob))
sh = Counter(meta[r[3]]['p'] for r in desk); print('desktop cell share by product', {k: round(v / len(desk), 2) for k, v in sh.items()})
# only tiles the mosaics use go into the atlases (kept in product order), indices remapped
used.sort(key=lambda i: (PK.index(meta[i]['p']), i)); nid = {o: k for k, o in enumerate(used)}
for r in desk + mob: r[3], r[4] = nid[r[3]], nid[r[4]]
tiles = [tiles[i] for i in used]; meta = [meta[i] for i in used]; gid = {}; G = [gid.setdefault(G[i], len(gid)) for i in used]
print('unique tiles', len(tiles), 'unique pieces', len(gid))
rows = math.ceil(len(tiles) / COLS); CL, CH = LO_SLOT - 2 * LO_PAD, HI_SLOT - 2 * HI_PAD
atlas = Image.new('RGB', (2048, 1 << (rows * LO_SLOT - 1).bit_length()), DARK); hi = Image.new('RGB', (COLS * HI_SLOT, rows * HI_SLOT), DARK)
for i, (p, label, t, _) in enumerate(tiles):
  cx, cy = i % COLS, i // COLS
  for im, sl, pd, c in ((atlas, LO_SLOT, LO_PAD, CL), (hi, HI_SLOT, HI_PAD, CH)):
    im.paste(t.resize((sl, sl), Image.LANCZOS), (cx * sl, cy * sl)); im.paste(t.resize((c, c), Image.LANCZOS), (cx * sl + pd, cy * sl + pd))   # edge bleed, then tile
atlas.save(OUT + '/atlas.webp', 'WEBP', quality=76, method=6)
hi.save(OUT + '/atlas-hi.webp', 'WEBP', quality=66, method=6)
print('atlas kB', os.path.getsize(OUT + '/atlas.webp') // 1024, atlas.size, 'hi kB', os.path.getsize(OUT + '/atlas-hi.webp') // 1024, hi.size)
json.dump({'v': 3, 'cols': COLS, 'aspect': PH / PW, 'lo': [atlas.width, atlas.height, LO_SLOT, LO_PAD], 'hi': [hi.width, hi.height, HI_SLOT, HI_PAD],
           'cap': [CAP_TILE, CAP_ALL, CAP_PIECE], 'products': {k: {'n': v[0], 'h': v[1]} for k, v in PRODUCTS.items()},
           'tiles': [[m['p'], m['l']] + m['m'] for m in meta], 'g': G,
           'desktop': desk, 'mobile': mob}, open(OUT + '/layout.json', 'w'), separators=(',', ':'), ensure_ascii=False)
print('layout kB', os.path.getsize(OUT + '/layout.json') // 1024)
