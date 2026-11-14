# BRAND-SYNC · where every 3S brand appears (v1, 14 Nov 2026)

Dave's standing rule (14 Nov 21:02): "Every change must be reflected in portfolio, always. If we change brand and design, every relevant channel and link must ALWAYS UPDATE ACCORDINGLY AND ACCURATELY and continuously reflect the brand's design language, identity etc."

This file is the list a sync pass walks. One block per brand: where the truth lives, the files, the look, and every surface with its URL or path. Paths are repo-relative (`3shamrocksstudio.github.io`, served at https://3shamrocks.com/) unless they start with `/mnt/user-data/outputs/` (studio outputs folder) or `~/Desktop/3S Projects/` (Dave's Mac).

Status marks: ✅ matches (checked, date) · ⚠️ mismatch (see the note) · 🔍 needs a check in Chrome (no login; read the public page only) · 🔒 needs Dave (his login or his decision) · — not applicable.

---

## Brand-change protocol (mandatory)

1. **Every brand or design change ships with a sync pass** through that brand's block below. The change is not done until every listed surface matches.
2. **Order of the pass:** source of truth first (BRAND.md / tokens / palette.json), then logo files (PNG exports), then each surface top to bottom: portfolio case page and home card → product site/app → OG image and favicon → J8NIX badge + PCOL colour → store listings → social profiles → decks/docs.
3. **Live-verify every web surface** after push: fetch it with a cache-buster (`?cb=<random>`), confirm the new asset/text is served, and run axe (WCAG 2.1 A/AA, 390 px and 1280 px) on every page you changed. No new violations allowed.
4. **Logos:** PNG on pages and posts (Dave's rule); SVG only inside app code that needs it. Never a logo in a box or chip unless the brand file says so. Never redraw Dave's logo files.
5. **Words:** use the brand's current name and terms (Chore Royale, FaiRent, "licks", SH✡MER). Never "launched"/"live" for a beta or concept, never "we" in client copy (Dave is the sole builder: "I built"), never the word הוגן.
6. **Surfaces only Dave can change** (store dashboards, IG/LinkedIn bios and avatars, Play Console, anything behind his login): prepare the exact asset/text first, then add ONE `j8_tasks` row per surface group with action, direct link and minutes (SQL in `ops/brain/J8NIX-DATA.md`, project `otkvebgrdiayjnqrytrn`, owner `'dave'`, the team's prep task in `blocked_by`). Team checks get owner `'team'`.
7. **Update this file** in the same commit as the change: mark the surfaces you synced, set "last synced" to the date, and add new surfaces the moment they exist (a new page, listing, profile or deck).
8. **Brands in flux** (marked below): don't sync outward until the brand is decided; only keep them from contradicting a 3S rule.

---

## 1 · 3Shamrocks Studio (3SDS)
- **Owner seat:** CDO / CMO (Studio and brand pod) · **Last synced:** 14 Nov 2026
- **Source of truth:** `/mnt/user-data/outputs/ds/studio.md` (3SDS v4.0) and `ops/brain/brandos/` (Brand OS genome); Mac `~/Desktop/3S Projects/3SDS/`.
- **Logo PNGs:** `assets/studio/3shamrocks.png` (on dark), `assets/studio/3shamrocks_black.png` (on light), `assets/studio/3S_logo.png`, `favicon.png`, `assets/studio/heart-on-dark.png` / `heart-on-light.png` (the mark), J8NIX badge `j8/brand/studio.png`.
- **Colour / type:** canvas `#08080f`, purple `#8239ea` (+ `#9b59f7`, `#b07cff`), shamrock green `#3dcc6e` (text on light `#187a42`). Syne (display), Inter (body), Space Grotesk (numbers). Masculine and bold; no heart motifs beyond the logo.

| Surface | Where | Status |
|---|---|---|
| Home page | `index.html` → https://3shamrocks.com/ | ✅ 14 Nov |
| Case-page footers (logo + links) | `work/*.html` (`.sf3` footer) | ✅ 14 Nov (accessibility statement link added) |
| Work with me | `work-with-me.html` | ✅ 14 Nov ("we" removed) |
| Brand Sprint / Founder audit | `sprint/index.html`, `audit/index.html` | ✅ 14 Nov (PNG logo; Sprint's "together we agree" is the client-and-Dave "we", kept) |
| Link page (bio link) | `links/index.html` | ✅ 14 Nov |
| OG image / favicon | `assets/og/og-home.jpg` · `favicon.png` | ⚠️ og-home (8 Nov) shows the old Chore Royale screen; refresh needs Dave's OK (he approves home carousel screens) |
| Gumroad store | https://markodave.gumroad.com (store name/avatar) | 🔍 avatar and bio not checked |
| Instagram | @3shamrocks.studio · https://www.instagram.com/3shamrocks.studio/ | 🔍 bio, avatar, link |
| LinkedIn (personal) | https://www.linkedin.com/in/davemarkovich/ | 🔍 banner, headline, featured links |
| LinkedIn (company) | /company/3shamrocks (found in files, not verified) | 🔍 exists? logo, banner |
| Google Maps listing | "3Shamrocks Studio for Brand & Design" · https://maps.google.com/?cid=18334575276684160102 | 🔍 logo, cover |
| Decks / docs | `/mnt/user-data/outputs/Services-Kit-2026-10-31/`, `/mnt/user-data/outputs/cv/`, Brand OS offer copy (`ops/brain/brandos/`) | 🔍 re-check on next studio brand change |
| J8NIX badge / PCOL | `j8/brand/studio.png` · `j8/app.js` PCOL `p-site`… `['#8239EA','#3DCC6E']` | ✅ 14 Nov |

## 2 · J8NIX
- **Owner seat:** CPO (Products lab) / CTO for the app · **Last synced:** 14 Nov 2026 (audit only; no portfolio page exists)
- **Source of truth:** `assets/brand-v3/j8nix/BRAND.md` + `palette.json` (brand v4: the logo system, Dave's vectors). Live app look = `j8/app.css` 6.1 tokens. Coming: `/mnt/user-data/outputs/j8nix-v7/DESIGN-v71.md` (v7.1 five-hue system: Sun Amber `#FFA41B` you, Studio Blue `#1257E6` studio, Flow Teal `#10B5A3` progress, Talk Orchid `#D07CF5` people, Alarm Red `#E23744`; navy `#0D1C2B`, canvas `#F6F8FB`, Peach Gold `#F2C194`). **Not live yet; do not publish v7.1 visuals.**
- **Logo PNGs:** `assets/brand-v3/j8nix/logo.png` (stacked, on dark), `logo-on-light.png`, `wordmark.png`, `logo-mark.png` (app icon), `glyph-*.png`; app `j8/icons/icon-192.png`, `icon-512.png`, `maskable-512.png`, `apple-touch-icon.png`; studio copy `assets/studio/logos/j8nix.png`.
- **Colour / type:** brand v4 Peach Gold `#F2C194`, white 8, Slate `#586475`, Command Navy `#0D1C2B`, Signal Blue `#1563FF`. App 6.1: light "brighter" base (mist `#F7F9FD`, ink `#1A2638`, gold `#F2C194`, blue `#1563FF`, theme `#FFC462`). Futura/Jost (logo, display), Assistant / Source Sans 3 (UI).

| Surface | Where | Status |
|---|---|---|
| Portfolio case page | none. `work/j8nix.html`, `j8nix-case.html`, `products/j8nix.html` redirect home; no home card (Dave took J8NIX off the site in Nov, then said it is to be added to the portfolio later) | ⚠️ no page. Leftover `.bp-j8` CSS in `index.html` still carries the old slate look (unused). Build the case page when v7.1 ships, from the v7.1 palette and real screens |
| The app (PWA) | https://3shamrocks.com/j8/ (`j8/index.html`, v6.1.2) | ✅ is the reference for the 6.1 look |
| App manifest / icons | `j8/manifest.webmanifest` (theme `#FFC462`, bg `#F4F7FF`), `j8/icons/*` | ✅ 6.1 · update with v7.1 |
| Android APK | `j8/app/J8NIX-1.0.0.apk`, `j8-android/` | 🔍 icon matches 6.1? re-check with v7.1 |
| Brand file | `assets/brand-v3/j8nix/BRAND.md` | ⚠️ still v4 dark slate/navy palette; does not describe the 6.1 light look or v7.1. Update when v7.1 ships |
| OG image | `assets/og/og-j8nix.jpg` (old dark look; used by no page) | ⚠️ replace with v7.1 when the case page is built |
| Timeline dashboard | https://3shamrocks.com/ops/ | 🔍 J8NIX naming/badge |
| Product badges + colours inside J8NIX (PCOL / PBADGE) | `j8/brand/*.png`, `j8/app.js` `PCOL`, `PBADGE` | ⚠️ `p-fairent` still `['#6550FF','#53D805']` (FaiRent v4 indigo/green; v5 is Ledger Ink `#1A1633` + Highlighter `#FFE53D` + Red Pen `#FF4A2B`); `p-chore` `['#6A21C4','#F59E0B']` vs brand v4 `#5B23C8` / `#F5B92E`; no FaiRent badge. Fold into the next J8NIX release. Milo badge ✅ 14 Nov (v2 bear, reaches phones with the next J8NIX cache version) |

## 3 · SH✡MER (+ SH✡MER Nature)
- **Owner seat:** CPO / CTO (SH✡MER pod); site and pages CDO · **Last synced:** 14 Nov 2026
- **Source of truth:** `/mnt/user-data/outputs/ds/shomer.md`, repo `shomer-app/` (`BRAND.md`, `brand.css`), Mac `3S Projects/Shomer/Core/BRAND.md`. Nature: `/mnt/user-data/outputs/ds/shomer-nature.md` (based on SH✡MER only, nature adjustments).
- **Logo PNGs:** `shomer-app/SHOMER_logo_big.png` (transparent badge), `assets/studio/logos/shomer.png`, `assets/work/shomer/badge.webp`, wordmark `assets/work/shomer/logo.png` (new 14 Nov, 2x PNG of `logo.svg`), J8NIX badge `j8/brand/shomer.png`. Nature: `assets/studio/logos/shomer-nature.png`, `j8/brand/nature.png`. App icons `logo-512/192.png` are launcher-only (never on a page).
- **Colour / type:** navy `#0C1B3A`, orange `#FC9918` (site, Command, the ✡), gold `#E0A828` (app), red = SOS only. Alef (site), Marion (wordmark artwork). Nature: sand `#FAF6EC`, leaf `#2F8540`, Heebo. Never a logo in a square/frame. Never "launched/live" (closed beta).

| Surface | Where | Status |
|---|---|---|
| Portfolio case page | `work/shomer.html` | ✅ 14 Nov (wordmark now PNG) |
| Home card + identity row | `index.html` (`#work` first device, `#identity`) | ✅ 14 Nov |
| Product site | https://www.shomer-app.co.il/ (repo `shomer-app`, `index.html`) | 🔍 next SH✡MER brand change |
| App (PWA / Android / iOS) | `shomer-app/shomer.html`, `shomer-app/native/` | — (app team) |
| Command dashboard funnel | `shomer-command/`, `shomer-dashboard-lock-preview/` | ✅ uses SH✡MER template |
| Pilot page | `shomer-pilot.html` (noindex) | ✅ |
| Beta join page | `shomer-beta/` | ✅ |
| Previews (staging) | `shomer-site-preview/`, `shomer-shake-preview/`, `shomer-nature-preview/`, `shomer-nature-layer-preview/` | — staging only. Their terms page says "שימוש הוגן" (legal "fair use", not FaiRent): leave |
| OG image | `assets/og/og-shomer.jpg` | ✅ |
| Google Play (closed beta) | `il.co.shomerapp` · https://play.google.com/store/apps/details?id=il.co.shomerapp | 🔒 listing icon/screens/text in Play Console |
| Instagram | @shomer.app · https://www.instagram.com/shomer.app/ | 🔍 bio, avatar, link |
| LinkedIn company | https://www.linkedin.com/company/sh%E2%9C%A1mer/ | 🔍 logo, banner |
| Decks / grant docs | `/mnt/user-data/outputs/tnufa/`, `SHOMER-Pilot-*.md`, `shomer-sales/`, `תנופה-SHOMER-*.docx` | 🔍 logo version on next change |
| J8NIX badge / PCOL | `j8/brand/shomer.png`, `nature.png`; PCOL `p-shomer` `['#E0A828','#0C1B3A']`, `p-nature` `['#2F8540','#4FA85C']` | ✅ |
| **Nature on the studio site** | must not appear (Dave). `work/shomer-nature.html`, `shomernature-case.html` redirect home | ✅ 14 Nov: no Nature on home, footer or sitemap |

## 4 · LickPick
- **Owner seat:** CPO (Products lab) · **Last synced:** 14 Nov 2026
- **Source of truth:** `/mnt/user-data/outputs/ds/lickpick.md` (v1.0) + live `lickpick/app/index.html` `:root`. Terms: "licks", never "takes".
- **Logo PNGs:** `assets/studio/logos/lickpick.png` (pick mark), `assets/studio/logos/lickpick-lockup.png`, app icons `lickpick/app/icon-192-v5.png`, `icon-512-v5.png`, `icon-maskable-512-v5.png`; J8NIX badge `j8/brand/lickpick.png`.
- **Colour / type:** stage `#0B0912`, volt `#FFE600`, hot `#FF2E88`, text `#FFF7F0`. Dela Gothic One (display), Archivo (body). Portfolio tile on its pink/yellow logo background.

| Surface | Where | Status |
|---|---|---|
| Portfolio case page | `work/lickpick.html` | ✅ 14 Nov |
| Home card | `index.html` (`#work`, second device) | ✅ |
| Landing | https://3shamrocks.com/lickpick/ (`lickpick/index.html`), `lickpick/beta.html`, `lickpick/new.html` | ✅ 14 Nov: share image now the current "licks" card (`assets/og/og-lickpick-v2.jpg`), absolute URL; the old `lickpick/assets/og.jpg` said "take" |
| App (PWA) | https://3shamrocks.com/lickpick/app/ | — (app team) |
| Domain | lickpick.app | 🔍 where it points |
| Instagram | @lickpick.app · https://www.instagram.com/lickpick.app/ · link page `n/lickpick/` | 🔍 bio, avatar, link |
| OG image | `assets/og/og-lickpick-v2.jpg` | ✅ |
| J8NIX badge / PCOL | `j8/brand/lickpick.png`; `p-lickpick` `['#FFE600','#FF2E88']` | ✅ |

## 5 · Trashure-Hunters
- **Owner seat:** CPO (Products lab) · **Last synced:** 14 Nov 2026
- **Source of truth:** `/mnt/user-data/outputs/ds/trashure-hunters.md`, Mac `3S Projects/Trashure-Hunters/02_Brand-Assets/brand-system.md`. Slogan: "Clean the World. Win the Game."
- **Logo files:** stacked `assets/work/trashure-hunters/brand/logo-th26.webp` (portfolio uses stacked, Dave), horizontal `logo-horizontal.webp` / `th-site/assets/img/logo.webp`, icon `assets/studio/marks/th-icon.webp`, studio PNG `assets/studio/logos/trashure-hunters.png`, J8NIX badge `j8/brand/th.png`. No stacked PNG export in the repo yet.
- **Colour / type:** navy `#0A0A2E`, orange `#FF6C00` (text on it = navy), gold `#FCD34D`, realm colours. Fredoka (display), Inter (body).

| Surface | Where | Status |
|---|---|---|
| Portfolio case page | `work/trashure-hunters.html` | ✅ |
| Home card + identity row | `index.html` | ✅ (identity row uses the horizontal lockup; card uses stacked) |
| Game site | https://3shamrocks.com/th-site/ | ✅ |
| Test builds | `th-mvp/`, `th-mvp-android/`; privacy `th-privacy/` | — (app team; app is being redone) |
| Case study (old) | `thcasestudy/` | 🔍 still reachable? brand v2026? |
| Instagram | @trashure_hunters · link page `n/trashure_hunters/` | 🔍 bio, avatar, link |
| OG image | `assets/og/og-trashure-hunters-v2.jpg`; site `th-site/assets/img/og.jpg` | ✅ |
| J8NIX badge / PCOL | `j8/brand/th.png`; `p-th` `['#FF6C00','#0A0A2E']` | ✅ |

## 6 · Chore Royale
- **Owner seat:** CPO (Products lab) · **Last synced:** 14 Nov 2026
- **Source of truth:** `assets/brand-v3/chore-royale/BRAND.md` + `palette.json` (brand v4, icons v6, 12 Nov). `/mnt/user-data/outputs/ds/chore-royale.md` (v1.1, 2 Nov) is **outdated** (violet `#6a21c4`/Fredoka and an open name question that Dave settled: always Chore Royale).
- **Logo PNGs:** `assets/brand-v3/chore-royale/logo-stacked.png` (final), `logo.png`, `wordmark.png`, `logo-mark.png`, `app-icon.png`; web `logo-stacked-600.webp`, `logo-mark-512.webp`; J8NIX badge `j8/brand/chore.png` (Dave's final raster).
- **Colour / type:** Night Court `#1A0B3B`, Royal Purple `#5B23C8`, Purple Deep `#3A1590`, Amethyst `#8B4DFF`, Crown Gold `#F5B92E`, Spell Teal `#22E0C0`, Royal Ink `#14072E`. Bevan (display), Nunito (body), Bungee (marquee).

| Surface | Where | Status |
|---|---|---|
| Portfolio case page | `work/chore-royale.html` | ✅ |
| Home card | `index.html` (`#work`, row 2) | ⚠️ tile glow and splash are teal (`#14C2B0`), the brand leads with purple + gold; teal is an accent. Possibly deliberate (Dave wants tiles distinct). Decide on next home pass |
| OG image | `assets/og/og-chore-royale-v2.jpg` | ✅ 14 Nov (new: v4 logo, "Spin it. Steal it. Rule the house.", current screens). Old `og-chore-royale.jpg` had the old tagline |
| App (staging) | Mac `3S Projects/Chore-Wars/` (`data-brand="choreroyale"`) | — |
| Logo proposals page | `work/chore-royale-logo-proposals.html` (internal) | — |
| J8NIX badge / PCOL | `j8/brand/chore.png`; `p-chore` `['#6A21C4','#F59E0B']` | ⚠️ PCOL on the old v1.1 violet; use `#5B23C8` / `#F5B92E` in the next J8NIX release |
| Design-system file | `/mnt/user-data/outputs/ds/chore-royale.md` | ⚠️ update to brand v4 |

## 7 · FaiRent
- **Owner seat:** CPO (Products lab) · **Last synced:** 14 Nov 2026
- **Name:** FaiRent. Never הוגן (Dave, 3 and 14 Nov). On 14 Nov Dave also called FaiRent "an old brand": ⚠️ open question whether it stays in the portfolio.
- **Source of truth:** `assets/brand-v3/fairent/BRAND.md` + `palette.json` + `tokens.css` (brand v5 "The renter's red pen", 12 Nov). `/mnt/user-data/outputs/ds/fairent.md` (v1.1, title "Fairent · הוגן", indigo/green) is **outdated**.
- **Logo PNGs:** `assets/brand-v3/fairent/logo.png`, `logo-on-dark.png`, `logo-stacked.png`, `logo-stacked-on-dark.png`, `logo-mark.png`, `app-icon.png`, `app-icon-light.png`, `app-icon-dark.png`, `favicon-32.png`, `favicon-180.png`; web `logo-on-green.webp`. ⚠️ `assets/studio/logos/fairent.png` and `assets/brand/fairent-wordmark-white.png` are the old v4 wordmark (unused on pages; don't reuse).
- **Colour / type:** Ledger Ink `#1A1633`, Receipt Paper `#F7F3EA`, Red Pen `#FF4A2B`, Highlighter `#FFE53D`, Red Ink `#C8331A`. Rubik.

| Surface | Where | Status |
|---|---|---|
| Portfolio case page | `work/fairent.html` | ✅ 14 Nov (הוגן removed from the type specimen and the demo copy) |
| Home card + footer link | `index.html` | ✅ v5 logo · ⚠️ keep or remove: Dave's call |
| Brand board | `assets/brand-v3/fairent/board.html` | ✅ 14 Nov (הוגן removed) |
| Favicon on case page | `assets/brand-v3/fairent/favicon.svg` | ⚠️ SVG favicon; PNG `favicon-32.png` exists. Low priority |
| OG image | `assets/og/og-fairent-v5.jpg` | ✅ |
| App | separate `fairent` repo (`/fairent/`) | ⚠️ said הוגן in og:title and text on 3 Nov; not reachable from this repo. Check before FaiRent is shown again |
| J8NIX PCOL | `p-fairent` `['#6550FF','#53D805']` | ⚠️ v4 colours; v5 = `#1A1633` / `#FFE53D` |
| Design-system file | `/mnt/user-data/outputs/ds/fairent.md` | ⚠️ outdated, contains הוגן |
| Social / reels | none. Never in reels or media accounts (Dave 14 Nov) | ✅ |

## 8 · Accessibility checker (a11y)
- **Owner seat:** CRO (Revenue) for sales; CTO for the engine · **Last synced:** 14 Nov 2026
- **Source of truth:** the page itself `a11y/index.html` (studio 3SDS look: near-black, purple button, studio PNG logo), product notes `/mnt/user-data/outputs/a11y-product/STATUS.md`, `GUMROAD-LISTING.md`, `MONITOR-LISTING.md`. Engine `a11y/engine/engine.ts`, edge `a11y/edge/`.
- **Logo:** studio PNG `assets/studio/3shamrocks.png` (no own logo). Favicon `favicon.png`. OG `assets/og/og-home.jpg`.
- **Names in use:** "Free accessibility check" / "בדיקת נגישות לאתר", paid "Accessibility Report Pro" (US$29, one site, one-time), "Accessibility Monitor" (US$12/month).

| Surface | Where | Status |
|---|---|---|
| Checker page | https://3shamrocks.com/a11y/ (`a11y/index.html`) | ✅ |
| Statement | `a11y/accessibility-statement.html` | ✅ (no og:image: fine for a statement) |
| SEO guides (HE + EN) | `a11y/accessibility-statement-guide(-en).html`, `accessibility-widget(-en).html`, `free-accessibility-check(-en).html`, `website-accessibility-law-israel(-en).html` | ✅ same header, logo, favicon, OG; the two statement guides link Report Pro on Gumroad |
| Home footer | `index.html` footer: "Free accessibility check" + "Accessibility statement / הצהרת נגישות" | ✅ |
| Case-page footers | `work/*.html` `.sf3` | ✅ 14 Nov (statement link added to all 8) |
| Sitemap | `sitemap.xml` | ✅ |
| Gumroad · Report Pro | https://markodave.gumroad.com/l/accessibility-report-pro | ⚠️ cover is navy + yellow chip, no studio logo, no price; checker page is studio black + purple |
| Gumroad · Monitor | https://markodave.gumroad.com/l/accessibility-monitor | ⚠️ same cover style (navy/yellow, no studio logo); shows $12/month |
| Story / LinkedIn launch assets | `/mnt/user-data/outputs/store-launch-1114/` | 🔍 check against the page look before use |
| J8NIX badge / PCOL | `p-a11y` → studio badge, `['#8239EA','#B07CFF']` | ✅ |

## 9 · Digital store products (Gumroad, studio brand)
- **Owner seat:** CRO / CMO · **Last synced:** 14 Nov 2026
- **Source of truth:** `/mnt/user-data/outputs/digital-store/<product>/LISTING.md` + `cover-1600x1200.png` + `thumb-800.png`; studio 3SDS look.
- **Store:** https://markodave.gumroad.com (7 public products on 14 Nov)

| Product | Listing | Site links | Status |
|---|---|---|---|
| 3SDS Starter | https://markodave.gumroad.com/l/3sds-starter | — | 🔍 cover vs 3SDS v4 |
| The 5-Second Brand Check | https://markodave.gumroad.com/l/5-second-brand-check | — | 🔍 (`store-launch-1114` has a placeholder note) |
| AI Brand Rulebook Kit | https://markodave.gumroad.com/l/ai-brand-rulebook-kit | — | 🔍 |
| Founder Brand Audit | https://markodave.gumroad.com/l/founder-brand-audit | `audit/index.html` | 🔍 |
| AI Brand Kit | https://markodave.gumroad.com/l/ruaqk | `n/meetinq/index.html` | ⚠️ a studio product linked from a media account page (see 10) |
| Accessibility Report Pro / Monitor | see 8 | `a11y/` | ⚠️ covers |
| Home + Sprint "Shop" links | `index.html` (nav + footer), `sprint/index.html` | → store root | ✅ |

## 10 · Media IG accounts (brands in flux)
- **Owner seat:** CMO + CDO (Growth) · **Last synced:** 14 Nov 2026 (audit only) · **In flux:** Dave 14 Nov: each account gets its own original brand, product and content, with **no 3Shamrocks link**. Frozen in cash mode.
- **Source of truth (old, 2 Nov):** `/mnt/user-data/outputs/ds/meetinq.md`, `getfetch.md`, `dealxscout.md`, `echoxreels.md`; Mac `3S Projects/Media-Network/0x-*/Brand/brand-kit.md`.
- **Logo PNGs:** `n/meetinq/logo.png`, `n/dealxscout/logo.png`, `n/echoxreels/logo.png`, `n/getfetch/logo-word.png`, avatars `n/*/avatar.png`; J8NIX badge `j8/brand/media.png`; `assets/studio/logos/media-network.png` (unused).

| Account | Profile | Link page | Status |
|---|---|---|---|
| meetinq.ai (Inq) | https://www.instagram.com/meetinq.ai/ | `n/meetinq/` | ⚠️ page is on 3shamrocks.com, credits "3Shamrocks Studio" in the disclosure and links the studio's AI Brand Kit · 🔍 bio |
| getfetch.ai (Fetch) | https://www.instagram.com/getfetch.ai/ | `n/getfetch/` | ⚠️ on 3shamrocks.com + "3Shamrocks Studio" disclosure · 🔍 bio |
| dealxscout.ai (Scout) | https://www.instagram.com/dealxscout.ai/ | `n/dealxscout/` | ⚠️ same · 🔍 bio |
| echoxreels (Echo) | https://www.instagram.com/echoxreels/ | `n/echoxreels/` | ⚠️ same · 🔍 bio |
| Portfolio | must not appear (Dave) | `products/media-network.html` redirects home | ✅ |

## 11 · Milo (concept)
- **Owner seat:** CPO (Products lab) · **Last synced:** 14 Nov 2026
- **Source of truth:** `work/milo.html` (rebuilt 12 Nov; its header comment is the current rule: white pixel-art polar bear, no sunglasses, no popsicle) + art `assets/work/milo/milo-v2-*.webp`, faces `milo-face-*.webp`. ⚠️ `assets/brand-v3/milo/BRAND.md` + `palette.json` (v4 caramel bear with sunglasses) and `assets/studio/logos/milo.png` are **outdated**.
- **Logo:** `assets/work/milo/milo-wordmark.png`, faces `milo-face-calm.webp` (badge/OG source).
- **Colour / type:** night `#12012B` / `#1A033D`, pink `#FF2D95`, magenta `#E527C8`, violet `#6C31B5`, cyan `#1CBCF5`, fur `#F4F1FA`. Poppins.

| Surface | Where | Status |
|---|---|---|
| Portfolio case page | `work/milo.html` | ✅ |
| Home card | `index.html` (`#work`, row 2) | ⚠️ the hover screens (`milo-v2-panel-*.webp`) still show the popsicle; replacing home screens needs Dave's OK |
| OG image | `assets/og/og-milo-v3.jpg` | ✅ 14 Nov (new; v2 had popsicle and said "In development") |
| J8NIX badge | `j8/brand/milo.png` | ✅ 14 Nov (v2 face) |
| Brand file | `assets/brand-v3/milo/BRAND.md` | ⚠️ rewrite to v2 when Milo is next touched |
| OT review pack | `/mnt/user-data/outputs/milo/OT-REVIEW-PACK.md` | 🔍 art version |

## 12 · R&K (Rookie & King, concept)
- **Owner seat:** CPO (Products lab) · **Last synced:** 14 Nov 2026
- **Source of truth:** `assets/brand-v3/rk/BRAND.md` (v7.1 + 12 Nov logo update from Dave's `R&Klogo.svg`), `board.html`, `palette.json`, `tokens.css`.
- **Logo PNGs:** `assets/brand-v3/rk/logo.png`, `logo-on-light.png`, `logo-stacked.png`, `logo-stacked-on-light.png`, `logo-mark.png`, `mark-on-light.png`, `app-icon.png`, `favicon-16/32/180.png`, wordmarks `wordmark*.png`.
- **Colour / type:** Navy `#06133F`, Electric Blue `#1F5BFF`, white; Night `#020617`; Win Amber only for the win.

| Surface | Where | Status |
|---|---|---|
| Portfolio case page | `work/rk.html` | ✅ (favicon is `favicon.svg`; PNGs exist) |
| Home card ("Concept" ribbon) | `index.html` | ✅ |
| OG image | `assets/og/og-rk.jpg?v=rk72` | ✅ |
| J8NIX | no badge, no PCOL | — |

## 13 · WH33LZ
- **Owner seat:** CPO (Products lab) · **Last synced:** 14 Nov 2026 (audit only)
- **Source of truth:** `/mnt/user-data/outputs/wh33lz-brand-2026-11-11/` (`palette.json`, `tokens.css`, `wh33lz-brand-book.html`). Status: Dave reignited it (Nov); board earlier said retire.
- **Logo PNGs:** `/mnt/user-data/outputs/wh33lz-brand-2026-11-11/logo-png/` (`wh33lz-logo-1024.png`, `-reverse-1024.png`, `wh33lz-mark-1024.png`, app icons, favicon).
- **Colour / type:** Apex Red `#E5112D`, ink `#111317`, paper `#FFFFFF`, tarmac `#F2F3F5`, asphalt `#4A4F5A`; ride states blue `#1257D6` / amber `#A85800` / red `#B3122B`.

| Surface | Where | Status |
|---|---|---|
| Portfolio | none | — (add only when Dave puts it in) |
| App | React Native repo (not in this repo) | — |
| J8NIX | no badge, no PCOL | — |

---

## Audit log
- **14 Nov 2026, first audit.** Fixed on the site: הוגן removed (FaiRent case page + board); SH✡MER case-page wordmark SVG → PNG; "we" → "I" in Work with me; accessibility statement linked from all 8 case-page footers; new share images for Milo (no popsicle) and Chore Royale (brand v4, current tagline); LickPick landing share image → current "licks" card with an absolute URL; J8NIX Milo badge → v2 bear. Open items are the ⚠️ / 🔍 / 🔒 rows above; Dave's are in J8NIX (j8_tasks).
- Pre-existing axe issues on case pages (not caused by this pass): shomer, trashure-hunters, healthtech list/ARIA structure; fairent/shomer definition lists; chore-royale and milo colour contrast; chore-royale aria-hidden-focus.
