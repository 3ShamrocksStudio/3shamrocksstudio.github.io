# Brand OS genome builder (P2 MVP)

Reads local HTML/CSS files and writes a DRAFT brand genome JSON in the schema `scorer/scorer.py` accepts. Python 3, stdlib only, no network, deterministic.

## Run
```
python3 builder/genome_build.py sprint/index.html --brand "3Shamrocks Studio" --out builder/out/genome-3s-draft.json
python3 builder/test_builder.py
```
Several files can be passed; tokens are merged by value.

## What it extracts (every token has `sources` = `<file>:<line>`)
- `palette`: opaque colours declared as CSS custom properties (`--token`), hex/rgb/hsl normalised to 6-digit hex, with `usage_count` (literals + `var(--token)` uses).
- `palette_candidates`: literal colours used but not declared as an opaque token (with counts). `palette_alpha_tokens`: tokens with alpha. Neither enters the palette; a human decides.
- `fonts`: families from `font-family`, `font:` shorthand, font custom properties and Google Fonts links; generics split out; `roles` only inferred from token names.
- `radii` (border-radius values and counts), `locale` (html `lang`/`dir`), `logo` (img/svg whose src, alt, class or id says logo; alt text and src recorded), `scope.seen_data_brand`.
- Output carries `"draft": true` and a `needs_review` list.

## What stays for a human
Voice (pronouns, banned words, urgency) and claims are left empty, never invented. Also palette roles, neutral allowances, approved logo list and rules, contrast policy and fix hints, scope brand ids. Tolerance and scoring are scorer defaults, not brand data.

## Test results (3Shamrocks Studio, sprint/index.html)
- Recall vs `scorer/genome-3s.json`: palette 9/9 of the hex values sourced from sprint, fonts 3/3. `#d9c4ff` (violet-3) comes only from `index.html`, not given to the builder, so it is not counted. No extra palette entries or fonts. 5 literal colours and 3 alpha tokens are flagged for review, not palette.
- Scorer loads the draft without error: sprint/index.html scores 38 (SEND BACK; colour 2, claims 11) against the draft, versus 8 with the hand genome. The draft has empty voice rules (no voice penalties), so it scores higher; the claims check still runs on scorer built-ins. Expected for an unreviewed draft.
- Existing suites unchanged: `scorer/tests/run_tests.py` 16/16 planted, 0/5 false positives, urgency 6/6, scope 3/3, Hebrew 3/3, Hebrew claims 15/15; `demo/run_demo_tests.py` PASS (13/13 planted, 0/3 false positives, 10/10 before/after).

## Limits
Static source only: no JS-set styles, no external stylesheets, no `var()` chains resolved. Colours are read from `<style>` blocks, style attributes and SVG paint attributes. Logo detection is heuristic. The sprint draft was checked only on this one page.
