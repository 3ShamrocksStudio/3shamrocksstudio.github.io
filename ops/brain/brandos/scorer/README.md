# 3S Brand QA scorer v0.1

Program #1 Brand OS, module 3 (Precision QA gate). Scores one asset (.html, .svg, .txt, .md) against a brand genome and returns a 0-100 Brand Consistency Score, pass/fail per check, and every violation with a reason and a fix hint. Python 3, stdlib only. Demonstrated on 3Shamrocks Studio's own brand.

## Run
```
python3 scorer.py path/to/asset.html [--genome genome-3s.json] [--out report.json]
python3 tests/run_tests.py
```
Exit code 0 = at or above threshold (goes on to Dave's taste gate), 1 = goes back automatically.

## Files
- `genome-3s.json`: palette, fonts, contrast, voice, claims, logo rules and scoring. Every token has a `sources` field pointing at the repo file it came from.
- `scorer.py`: the scorer. `tests/fixtures/`: 10 planted-error assets and 2 clean ones. `reports/`: JSON reports on the live sprint and audit pages.

## Rubric
Score = 100 minus penalties. Each violation costs a fixed amount, capped per check. Threshold is 85, so a single violation of any kind sends the asset back. That is deliberate for a precision gate.

| Check | What it flags | Per violation | Cap |
|---|---|---|---|
| colour | Any colour (hex, rgb/rgba, basic names, in style blocks, style attributes, SVG fill/stroke) more than CIEDE2000 dE 6.0 from every palette colour. `#ffffff` is allowed as a neutral | 16 | 32 |
| font | Any named font-family, or Google Fonts family, outside Bricolage Grotesque, Instrument Sans, Heebo (generics and `var()` are skipped) | 18 | 30 |
| contrast | Text/background pairs found together in one inline style or one CSS rule, below 4.5:1 (3:1 at 24px and up) | 16 | 32 |
| voice | "we/our/us" (should be "I"), banned hype words, fake urgency phrases | 16 | 30 |
| claims | Percentages, multipliers, #1/No. 1, TIME, doubled/tripled/halved, "award-winning", customer counts, with no `data-source` attribute on the element or an ancestor and no `[source: ...]` tag in the same block/paragraph | 16 | 30 |
| logo | An `img`/`image` that looks like a logo with no alt text, or a file outside the approved logo list | 18 | 30 |

## Limits (v0.1)
- Static analysis of source only. No rendered pixels: colours set by a stylesheet in another file, JS, images, or `var()` chains are not resolved.
- Contrast is checked only where text and background colours sit together in the same inline style or CSS rule. Inherited backgrounds are not known.
- Voice and claim checks are English regex. Hebrew text is scanned for numbers and percentages only. Claims in sentences with no number are not found.
- Claim sources must use the marker format. A plain "(Adobe, 2025)" in prose does not count, and payment terms such as "50% deposit" are flagged because the scorer cannot tell a term from a claim. Expect some noise on real pages.
- Logo checks are by file name and alt text. Clear-space, size, and recolouring are not checked.
- Genome entries marked NEEDS YOUR EYES (the `#ffffff` allowance, the banned-word list) are not yet confirmed by Dave.

## Next steps
1. Rendered check: screenshot the asset, sample real pixel colours and computed contrast.
2. Logo clear-space and recolour detection from the image itself.
3. LLM voice check for tone and unsourced claims without numbers, behind a human gate (it advises, Dave decides).
4. Claim registry: approved claims with sources in the genome, matched instead of regexed.
5. Genome builder that produces the JSON from a client's brand files.
