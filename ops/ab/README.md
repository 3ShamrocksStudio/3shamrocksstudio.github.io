# A/B tests and outreach attribution (3shamrocks.com)

Results page: https://3shamrocks.com/ops/ab/ (noindex, aggregate numbers only).

## How it works
- `js/hits.js` (already on every site page) loads `js/ab.js`. Visitors with Do-Not-Track or GPC load neither: they see variant A and nothing is counted.
- `js/ab.js` gives each browser a random variant per experiment (A or B, 50/50), kept only in that browser's `localStorage` (`ab:<experiment>`). No cookies, IDs, IP or user agent.
- Events go to the Supabase RPC `ab_event(experiment, variant, event, page)` (project `otkvebgrdiayjnqrytrn`), which adds +1 to a daily counter row in `public.ab_counts`. RLS is on with no policies; anon cannot read the table. Daily caps: 20,000 increments, 500 rows.
- Events, each counted at most once per tab session:
  - `exposure`: the test button was at least half on screen.
  - `click`: the test button was clicked.
  - `reach`: work-with-me.html was opened after the button had been seen.
  - `land`: someone arrived through a UTM link (see below).
- Results: RPC `ab_results(days)` returns per experiment and variant: exposures, clicks, reaches, click_rate %, reach_rate %. The results page calls it.

## Running experiments
| Experiment | Where | A (control) | B |
|---|---|---|---|
| `home-hero-cta` | index.html, hero primary button | See the work | See the brand systems I build |
| `ht-case-cta` | work/healthtech.html, end CTA | Let's talk | Tell me what you're building |

Main metric is the click rate. Reach rate is secondary. Wait for about 100 seen per variant and a gap that holds for a week before deciding.

## Start an experiment
1. On the element, add `data-ab="<name>"` and `data-ab-b="<variant B label>"`. Optional: `data-ab-b-href="<B link>"`. The element's current text is variant A.
2. In `js/ab.js`, add `'<name>':{on:1}` to `EXP`. Names: lowercase letters, digits, `-`, `.`, `_`, `:` (max 48 chars).
3. Preview without counting: open the page with `?ab=a` or `?ab=b`.

## Stop or pick a winner
In `EXP` in `js/ab.js`:
- `{on:0}`: stopped. Everyone sees A, nothing is counted.
- `{on:1,win:'b'}`: everyone sees B, nothing is counted. Later, move the B text into the HTML and remove the `data-ab*` attributes and the `EXP` entry.

## Outreach attribution (UTM)
Links in outreach messages carry `utm_source` (linkedin or email), `utm_campaign` (the batch, for example `marketing-1112`) and `utm_content` (the message: a post doc id, or the email group such as `email-1116`; never a person's name). `ab.js` counts a `land` for `utm:<campaign>` / `<source>:<content>`, plus `click` (any CTA) and `reach` (work-with-me.html) in the same tab session, then removes the utm parameters from the address bar. They show under "Outreach links" on the results page.

## Note on 12 Nov data
Pre-launch QA on 12 Nov 2026 added 32 test increments (both experiments, A and B equally, plus 2 `utm:marketing-1112` lands). Judge results from 13 Nov on, or subtract them.

## SQL
```sql
select * from public.ab_results(30);
select day, experiment, variant, event, page, n from public.ab_counts order by day desc;
```
