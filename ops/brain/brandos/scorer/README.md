# 3S Brand QA scorer v0.5

Program #1 Brand OS, module 3 (Precision QA gate). Scores one asset (.html, .svg, .txt, .md) against a brand genome and returns a 0-100 Brand Consistency Score, pass/fail per check, and every violation with a reason and a fix hint. Python 3, stdlib only. Demonstrated on 3Shamrocks Studio's own brand.

## Run
```
python3 scorer.py path/to/asset.html [--genome genome-3s.json] [--out report.json] [--product-region '#work' ...]
python3 tests/run_tests.py
```
Exit code 0 = at or above threshold (goes on to Dave's taste gate), 1 = goes back automatically.

## Files
- `genome-3s.json`: palette, fonts, contrast, voice, claims, logo rules and scoring. Every token has a `sources` field pointing at the repo file it came from.
- Brand-specific hint text and logo detection also live in the genome (`contrast.fix_hint`, `voice.pronoun_rule/pronoun_reason/pronoun_fix`, `logo.alt_text/detect_src/detect_alt`), so `--genome` works for any brand. Missing fields fall back to neutral defaults. Demo on a fictional brand: `../demo/`.
- `scorer.py`: the scorer. `tests/fixtures/`: 14 planted-error assets and 5 clean ones. `reports/`: JSON reports on the live sprint and audit pages.

## Rubric
Score = 100 minus penalties. Each violation costs a fixed amount, capped per check. Threshold is 85, so a single violation of any kind sends the asset back. That is deliberate for a precision gate.

| Check | What it flags | Per violation | Cap |
|---|---|---|---|
| colour | Any colour (hex, rgb/rgba, basic names, in style blocks, style attributes, SVG fill/stroke) more than CIEDE2000 dE 6.0 from every palette colour. `#ffffff` is allowed as a neutral | 16 | 32 |
| font | Any named font-family, or Google Fonts family, outside Bricolage Grotesque, Instrument Sans, Heebo (generics and `var()` are skipped) | 18 | 30 |
| contrast | Text/background pairs found together in one inline style or one CSS rule, below 4.5:1 (3:1 at 24px and up) | 16 | 32 |
| voice | "we/our/us" (should be "I"), banned hype words, fake urgency phrases | 16 | 30 |
| claims | Percentages, multipliers, #1/No. 1, TIME, doubled/tripled/halved, "award-winning", customer counts, with no `data-source` attribute on the element or an ancestor and no `[source: ...]` tag in the same block/paragraph | 16 | 30 |
| claims (ledger, v0.2) | Only when the genome has `claims.ledger` (a claims-ledger.md next to the genome). A block citing `claims-ledger.md#Cn` (data-source or `[source: ...]`) is flagged `unknown-claim-id` if Cn is not in the ledger, and `claim-mismatch` for any number not in that row's approved wording ("1,200" and "1200" match). `banned-claim` for cures/treats/prevents/diagnoses, doctor-approved, FDA-approved, clinically proven in any block, unless negated ("does not diagnose or treat"). No ledger in the genome: none of this runs, results are the same as v0.1 | 16 | 30 (shared with claims) |
| logo | An `img`/`image` that looks like a logo with no alt text, or a file outside the approved logo list | 18 | 30 |

## Product-brand scope (v0.3, night 16 Nov)
A studio page shows products in their own brands (portfolio tiles, product screens). Those parts are not studio chrome, so the studio genome must not judge their colours, fonts or logos.
- Markup inside an element with `data-brand="<id>"` is scoped out when `<id>` is not in the genome's `scope.own_brand_ids` (`studio`, `3s`, `3shamrocks`). A page with no such attribute can name regions with `--product-region` (simple selectors: `tag`, `#id`, `.class`; repeatable) or `scope.product_regions` in the genome.
- Scoped out: inline styles, SVG colour attributes, font attributes, images (logo check) and font links inside the region; `<style>` rules whose every selector names a tag, class or id seen only inside regions; and a loaded font family used only by those rules. Contrast pairs from those rules go with them.
- Still checked everywhere: voice and claims (the studio publishes those words).
- Every scoped-out item is counted in the report's `scoped_out`, so nothing disappears silently.
- No region on the page: results are byte-identical to v0.2 (checked on index.html, sprint, audit and all fixtures). Pages that already mark the whole page `data-brand="shomer"` (shomer-pilot.html) are now scoped out as SH✡MER's own brand: score them with a SH✡MER genome instead.
- Homepage with `--product-region '#work' --product-region '#identity'`: 225 CSS rules, 104 inline styles, 92 SVG colour attributes, 52 images and 1 font link scoped out; what remains is studio chrome (shared phone frames, hero, buttons, client logos, stats) and is listed in `reports/home-scoped.json`. It still scores 0: those findings are real work for the studio site, not product noise.
- Tests: `tests/run_tests.py` adds 3 scope units (tile scoped out with studio chrome still judged, an off-palette colour next to a tile still caught, `--product-region`).

## Hebrew voice (v0.4, night 18 Nov)
- Runs only when the genome has `voice.he` (the 3S genome does; the Plinkettle demo genome does not, so its results are unchanged) and only on blocks that contain Hebrew letters.
- Plural voice: אנחנו, אנו, שלנו, לנו, אותנו, איתנו/אתנו, עבורנו, בשבילנו, אלינו, מאיתנו, עלינו, as whole Hebrew words with up to 2 glued prefix letters (ו ש ה כ ב ל מ), so "והצוות שלנו" and "כתבו אלינו" are caught, while longer words that only contain them ("לנוח", "אנונימיות") are not. Rule name and penalty are the same as English (`first-person-plural`).
- Hype words (מהפכני/ת, פורץ/ת דרך, משנה משחק, ברמה עולמית, חסר/ת תקדים, מובטח/ת …) with one optional prefix ("המהפכנית"), and fake urgency (נותרו רק N, לזמן מוגבל, מהרו, הזדמנות אחרונה, אל תפספס/ו, עד גמר המלאי, נגמר/נסגר/מסתיים היום/הלילה/בקרוב).
- Lists live in the genome (`voice.he`), NEEDS YOUR EYES like the English list.
- Tests: 2 planted Hebrew fixtures (11, 12), 1 clean Hebrew fixture (with "לנוח", "אנונימיות", "שלך"), 3 Hebrew urgency units, 3 prefix units. Before/after on sprint, audit, home, raise-ready and all 10 demo reports: byte-identical. Only change on the pages checked: shomer-beta (a SH✡MER product page) gains 2 findings, "ספרו לנו" x2. That page speaks as the SH✡MER team, a product brand, so it is not a studio defect and the page was not changed.
- Limits: verb forms in first person plural (בנינו, נבנה) are not checked (too many false hits: בנינו is also "our sons"); no niqqud handling beyond skipping the marks; gendered or slash forms (ספר/י) are fine and not checked.

## Hebrew claims (v0.5, night 19 Nov)
- Mirrors the English claim check. Runs only when the genome has `claims.he` (the 3S genome does; the Plinkettle demo genome does not, so its results are unchanged) and only on blocks that contain Hebrew letters. A hit with no `data-source` on the element or an ancestor and no `[source: ...]` tag in the same block is `unsourced-claim`, same rule, penalty and cap as English.
- Lists live in the genome (`claims.he`), not in the scorer: `phrases` (superlatives such as הכי טוב / הטוב ביותר, ranking such as מספר אחת / מקום ראשון, market leadership such as מוביל בשוק, risk-free such as ללא סיכון, guarantees, awards, doubled/tripled), `patterns` (regex: מספר 1, פי N multipliers, N לקוחות/משתמשים counts). Phrases take one optional glued prefix (ו ש ה כ ב ל מ) and must be whole Hebrew words. Percentages such as 100% are already caught by the shared number rule, and מובטח stays a voice hype word (v0.4), so neither is counted twice.
- Ledger genomes: `claims.he.banned_claims` (מרפא, מאבחן, הוכח קלינית ...) give `banned-claim` unless negated (`claims.he.negation`: לא, אין ... within 30 characters before). Not active for the 3S genome (no ledger).
- Lists are NEEDS YOUR EYES like the English ones.
- Tests: 4 planted Hebrew claim fixtures (13-16), 2 clean Hebrew claim fixtures (04, 05: near-misses such as "מוביל סדנה", "הכי קרוב", "מספר 10", plus a sourced claim), 5 caught-phrase units, 5 near-miss units, 2 ledger units.
- Before/after on every html page in the repo and all demo and test assets: English pages and all demo reports byte-identical. Four bilingual pages gain Hebrew findings (see the night log): a11y/free-accessibility-check.html (+2 "הטוב ביותר"), a11y/index.html (+1 "פי 1.5"), links/index.html (+1 "הכי טוב"), sprint/index.html (+1 "פי 5"). Pages were not changed. shomer-beta gains nothing.
- Noise: like English "50% deposit", a number-weight such as "פי 1.5" or a described test result ("הכלי הטוב ביותר מצא ...") is flagged because the scorer cannot tell a claim from a description.

## Limits (v0.2)
- Static analysis of source only. No rendered pixels: colours set by a stylesheet in another file, JS, images, or `var()` chains are not resolved.
- Contrast is checked only where text and background colours sit together in the same inline style or CSS rule. Inherited backgrounds are not known.
- Claim checks are phrase and regex lists; Hebrew claims are covered by the genome `claims.he` list since v0.5 (voice since v0.4), so a Hebrew claim phrase not on the list is not found. Claims in sentences with no number are not found.
- Claim sources must use the marker format. A plain "(Adobe, 2025)" in prose does not count, and payment terms such as "50% deposit" are flagged because the scorer cannot tell a term from a claim. Expect some noise on real pages.
- Ledger check compares numbers only, not the rest of the wording, and does not check the claim is used in a fitting context. "Negated" means not/never/n't within 30 characters before the word. Banned-claim words are English and built into the scorer (not read from the ledger text); plain uses such as "prevent missed doses" are flagged too. Expect some noise.
- Logo checks are by file name and alt text. Clear-space, size, and recolouring are not checked.
- Genome entries marked NEEDS YOUR EYES (the `#ffffff` allowance, the banned-word list) are not yet confirmed by Dave.

## Next steps
1. Rendered check: screenshot the asset, sample real pixel colours and computed contrast.
2. Logo clear-space and recolour detection from the image itself.
3. LLM voice check for tone and unsourced claims without numbers, behind a human gate (it advises, Dave decides).
4. Claim registry: approved claims with sources in the genome, matched instead of regexed.
5. Genome builder that produces the JSON from a client's brand files.
