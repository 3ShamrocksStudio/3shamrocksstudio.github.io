# Brand OS demo: Plinkettle Health (fictional)

> **Fictional demo brand, not a real company.** Plinkettle Health, its palette, claims and "sources" are all invented. Staging/internal demo only, nothing here is public.

## What this is
P2 step 1 (first half): the Brand QA scorer run end to end on a brand that is not 3S. Plinkettle is a made-up HealthTech startup (water and tablet reminders for people over 65 and their families). It has its own genome, its own claims ledger, five assets in a "before" (with typical brand mistakes) and "after" (fixed) version, and its own planted-error tests.

## Files
- `genome-plinkettle.json`: palette (cream, ink, teal, mint, coral, sun), fonts (Fraunces, Atkinson Hyperlegible), contrast, voice (brand name or "you", never company "we"; no medical promises), approved claims C1-C4, logo rules, scoring. Same schema as `../scorer/genome-3s.json`.
- `claims-ledger.md`: the fictional source for every approved claim.
- `assets/`: 5 assets x before/after, plus `brand/plinkettle-logo.svg`.
- `reports/`: one JSON scorer report per asset (10).
- `fixtures/` + `run_demo_tests.py`: 13 planted-error files (one error type each) and 3 clean ones.

## Before / after scores (threshold 85)
| Asset | Before | What was wrong | After |
|---|---|---|---|
| LinkedIn post (.md) | **40** send back | "we/our" x3, "revolutionary", "clinically proven" (also a banned medical claim since v0.2), fake urgency x2, unsourced 82% and "10,000+ users" | **100** pass |
| Ad card (.svg) | **20** send back | off-palette orange #ff7a00, Montserrat, "Our", "miracle", unsourced "2x" | **100** pass |
| Landing hero (.html) | **4** send back | Poppins (loaded and used), sun-on-cream text 1.58:1, "We", unsourced "10,000+ users", logo with no alt | **100** pass |
| Email (.txt) | **40** send back | "Our/We/our", "cures" (also a banned medical claim since scorer v0.2), "game-changing", "Don't miss out", "Only 50 spots", "act now", unsourced "halved" | **100** pass |
| Deck page (.html) | **2** send back | off-palette blue #3b82f6, Inter, grey-on-teal 1.16:1, unsourced "#1" and "300%", unapproved logo file | **100** pass |

Penalties are capped per check, so the two text assets with only voice and claims errors bottom out at 40 (both 40 since v0.2 added the banned-claim check; reports regenerated 18 Nov). Any single error still sends an asset back.

## How to run
```
cd ops/brain/brandos
python3 scorer/scorer.py demo/assets/03-hero-before.html --genome demo/genome-plinkettle.json
python3 demo/run_demo_tests.py      # 13/13 planted caught, 0/3 false positives, 10/10 before/after verdicts
python3 scorer/tests/run_tests.py   # 3S tests, unchanged
```

## Limits
- The assets were written by hand for this demo, not yet produced by the production skills. That is the second half of P2 step 1. The Command view is staged (18 Nov) at https://3shamrocks.com/ops/brandos/ (noindex, not linked), built by `../command/build.py`, which re-scores every asset with the live scorer.
- Scorer v0.2 (P2 step 2) reads `claims-ledger.md` through the genome. A block that cites `#Cn` is flagged if Cn is not in the ledger (`unknown-claim-id`) or if a number in the block is not in that row's wording (`claim-mismatch`); "clinically proven", "doctor-approved", "FDA-approved" and cures/treats/prevents/diagnoses are flagged (`banned-claim`) unless negated. Only numbers are compared, not the full wording. Fixtures 11-13 plant these errors; clean-03 is the C4 disclaimer and must not be flagged. Fixtures 06 and 13 also trip the voice banned-word list, so the test allows that extra check.
- Claims with no number or keyword are missed: "setup takes 3 minutes" in the before email was not flagged.
- A font loaded by link and used in CSS counts twice (Poppins in the hero).
- All v0.1 limits in `../scorer/README.md` apply: source only, no rendered pixels, English regex, contrast only where text and background sit in one rule.
- The name "Plinkettle" was picked to look obviously invented; a web search on 15 Nov 2026 found no company or product of that name (only unrelated kettle shops). A formal name check is still NEEDS YOUR EYES before it appears in anything shown outside the studio.
