# J8NIX: positioning vs competitors + Apple-grade design language from the logo (23 Nov 2026)

> Research + design-direction run, 23 Nov 2026. Follows `DESIGN-RULES.md`: research first, no Claude-default looks, originality, built from Dave's inputs. Dave's inputs for this run: the 12.0 "Pit Wall" look (yellow/orange/black, chopped corners) is rejected; the new look must be Apple-style (clean, futuristic, minimal, clear UX and clear goal progress) and grow out of the J8NIX logo ("clean, minimal, futuristic, soft lines"). Facts come from pages opened in this run (Sources at the end). Lines marked **[Inference]** are our reasoning. Review sites that sell a rival product are flagged **(rival source)**. No 3S prices, no private names, no contact details. Nothing was sent or spent.

## TL;DR (plain words)

1. **Category:** J8NIX is an *autonomous management system*: a mentor, an assistant manager and a secretary in one calm app.
2. **Promise:** "You set the goal. J8NIX runs the work, shows the proof, and asks you only when it really matters."
3. **The market splits in two.** Calm planners (Sunsama, Akiflow) are manual. Autonomous tools (Motion, Reclaim) act alone but users call them messy or unreliable. Nobody is both calm and autonomous.
4. **Big suites (Asana, monday, ClickUp, Notion, Microsoft) add agents inside their own boards.** They help with tasks. They don't own the outcome. They charge per seat plus credits.
5. **Differentiator 1: it runs the work, it doesn't just track it.** Every step ends with proof: a link, a count, a screenshot. "Did nothing" shows as failed.
6. **Differentiator 2: it's a mentor with one next move.** Each morning you get one move, ranked by value to the goal, not by deadline.
7. **Differentiator 3: one loop at any size.** The same five screens and the same loop (Goal, Plan, Run, Proof, Decide) work for one project or many departments.
8. **Proof we can measure:** how many decisions it asks you a week, minutes of your attention a day, % of steps with proof, and days from idea to first payment.
9. **Design idea: "Through-line".** Everything is drawn like the logo: one soft line with round ends, open gaps and a band of light through the middle.
10. **Colours come from the logo:** Midnight `#060833` (text), Royal `#3043BF` (action), Glint `#5BB6F9` (the light, used only for progress and "running"). The background is cool white `#F4F6FB`, never cream.
11. **Font:** Inter (free, SIL OFL 1.1), with SF Pro used on Apple devices through the system font. Soft radii 6/10/14/20/28 and capsule buttons. Glass is used only on the navigation layer, as Apple does.
12. **Home screen:** one goal ring (open until done), the one next move, up to 3 decisions, then running missions. That's all.

---

## 1. The logo, read precisely (the system grows from this)

Files examined (repo `j8/`): `brand/j8nix-mark-8-2026-11-17.svg`, `brand/j8nix-wordmark-2026-11-17.svg`, `icons/mark-8.svg` (flat white outline version), `icons/icon.svg`, `icons/j8-icon-2026-11-17.svg`, `icons/j8-512-2026-11-17.png`, `icons/wm-sky.svg`, `icons/wm-slate.svg`, `manifest.webmanifest`. Measurements are taken from the path coordinates in `mark-8.svg` and `wm-sky.svg`.

### 1.1 Shapes
- **The mark is an "8" drawn as an hourglass.** It is one mono-line form: two bowls joined by an S-shaped diagonal through a narrow waist. Bounding box 19.35 × 44.07 units, so **width:height ≈ 0.44 (about 4:9)**. It's tall and slender, not a round 8.
- **Open terminals.** Neither bowl closes. The upper bowl's left stroke stops short of the diagonal (end near x 136.7, y 269.4), and the lower bowl's right stroke stops short from the other side (end near x 147.0, y 275.7). The two gaps sit **diagonally opposite, giving 180° rotational symmetry**. Negative space flows through the mark, so it reads as "8", "S", "hourglass" and "infinity" at once.
- **Bowed caps.** The top and bottom bars aren't flat. They're shallow arcs: the bar centre sits about 1.9 units higher than its ends, a sagitta of about 4% of the mark's height. The mark is subtly lens-shaped and soft.
- **Wordmark (J·8·N·I·X):** the same mono-line. The J and N have **large rounded corners** (outer radius 7.94 units). The I is a stem with a hooked top. The X is an S-diagonal plus two short fins. Cap height is 40.4 units.

### 1.2 Stroke and radii (the numbers the system inherits)
| Measure | Value (logo units) | Ratio |
|---|---|---|
| Stroke width | 2.36 | 5.4% of mark height; 5.85% of wordmark cap height |
| Corner radius (J, N, I hooks) | 7.94 | **radius ≈ 3.4 × stroke** |
| Terminals | round caps, radius = stroke ÷ 2 (1.18) | every end is soft, no sharp ends anywhere |
| Joins | smooth tangent curves | no mitres, no chopped corners |

**Rule taken into the UI:** soft radius ≈ 3.4 × line weight, round caps everywhere, and continuous curves only. This is the opposite of the 12.0 chopped rectangles.

### 1.3 Colours (exact hex from the SVG gradients)
| Role in logo | Hex | Where |
|---|---|---|
| Light core ("glint") | `#5BB6F9`, `#57ADF4` | centre of the 8's radial gradient: light running through the waist |
| Mid blue | `#4075D8`, `#3F73D7`, `#437DD5` | J and N gradient highlights |
| Royal (dominant) | `#3043BF` (repeated stops 0.775–0.975), `#3249C2` | the body of the 8 |
| Deep band | `#263080`, `#273286` | shadow band inside the 8 |
| Midnight | `#060833` | solid fill of N·I·X |
| Night fades | `#101640`, `#0B0F2B`, `#000000` | J and N gradients fading to black |
| Flat app tile (old) | `#2A44C6` | `icons/icon.svg` background |
| Legacy wordmark tints | `#2AB9FF` (sky), `#F2C194` (peach) | `wm-sky.svg`, `wm-slate.svg`: **not** part of the new system |

**Reading:** the logo is a **cool, deep blue-to-midnight** identity with **one point of light** (`#5BB6F9`) where the line crosses the waist. Light passes through the middle. That light is the brand's signature, so it must stay rare.

### 1.4 Motion potential
- **Draw-on:** the 8 can be drawn as one stroke path (it's a single outline in `mark-8.svg`). This gives a natural `stroke-dashoffset` draw for the splash.
- **Glint travel:** the radial highlight can slide along the diagonal (top-right to bottom-left). This is the "running" signal.
- **Hourglass turn:** a 180° rotation maps the mark onto itself (rotational symmetry). Use it once per cycle, for "new day / new cycle". Never loop it.
- **Gap closing:** the open bowls can close as a metaphor for "done". Rings and paths in the UI stay open while work is in progress and close when it's complete.

---

## 2. Competitors (2025–2026)

### 2.1 Table
| Product | Who for | Core promise | Autonomy | Price (public, per user/month unless noted) | Weaknesses (sourced) |
|---|---|---|---|---|---|
| **Motion** | Individuals → teams | AI PM + task manager that auto-schedules, assigns, rebalances, flags delays | Acts on its own (reschedules, assigns); the site doesn't describe approval steps | Pro AI $29 annual / $49 monthly (individual); Business AI $39 / $69; usage credits on top; no free plan | Tasks placed over busy events; billing complaints; "no human support"; mobile apps last updated Nov 2025 (rival source) |
| **Reclaim** | Calendar-heavy individuals and teams | Auto-schedules tasks, habits and focus time around meetings | Autopilot on the calendar | Lite free; Starter $10; Business $15; Enterprise $22 | No mobile app (top G2 complaint); autopilot "can feel overwhelming"; rigid after setup (rival source) |
| **Sunsama** | Individuals | "A calm, human-controlled alternative to aggressive auto-schedulers" | Manual by design: it drafts, you decide | $17 annual / $22 monthly; no free plan | No team plan; limited AI; ~2-week horizon (rival source) |
| **Akiflow** (Aki) | Individual power users | Inbox for all tasks + time blocking; Aki assistant via chat, WhatsApp, Siri | Manual by design ("does not silently rearrange the calendar") | Pro $19 annual / $34 monthly; no free plan | Billing and renewal complaints; laggy mobile; desktop-first; "too manual" (rival source) |
| **Asana AI Teammates** | Mid-size and enterprise teams | Prebuilt agents you assign work to, like colleagues | "Checkpoints": agents show their steps and take feedback; no explicit sign-off gate described | Contact sales; separate credit pool; preview, GA slated early 2026 | Industry worry about "agent sprawl" (cost, security, duplication) |
| **monday agents / sidekick** | Teams on monday boards | Agents organise projects, update workflows, report; agents can even sign up as "users" | Same permissions as humans; no extra approval step described | Seats + monthly credits (Basic 1,000 … Pro 3,000); agent runs cost ~10 to 250+ credits each | Usage cost hard to predict (per-action credit table) **[Inference]** |
| **ClickUp Brain** | ClickUp workspaces | AI across tasks/docs/chat; Autopilot rules; AI stand-ups | Rule-triggered automation | Add-on $9 (Brain AI) or $28 (Everything AI), billed for every member | Add-on can cost more than the core seat; "performance lag, clunky interface" (rival source) |
| **Notion Agents (3.0)** | Notion teams | Multi-step work across pages and tools | Up to 20 minutes of autonomous work at a time; scheduled/trigger agents announced as "coming soon" | Real AI only on Business, $20 annual / $24 monthly | AI locks after a 20-response trial on Free/Plus; mixed early feedback (rival source) |
| **Linear Agent** | Software product teams | Agent that understands roadmap, issues and code; Skills; triage automations | Creates and assigns issues; automations run on triage | Free during beta; plans Free / $10 / $16 | Built for software teams only **[Inference]** |
| **Height** | Product teams | "Autonomous project collaboration tool" | Built-in AI for groundwork | n/a | **Shut down 24 Sep 2025.** An "autonomous PM" promise alone did not survive |
| **Microsoft Planner Agent** | Microsoft 365 orgs | Executes assigned tasks, writes status reports, builds task lists from a goal | Works alone, flags missing info, marks work "Ready for review" | Requires a Microsoft Copilot licence; premium features need Planner plans | Locked to the M365 stack; reports only on request |
| **Lindy** | Individuals, small teams | Proactive "AI employee" over email, SMS, meetings | High: reaches out on its own, "ambient behaviour" | $29.99 / $99.99 / $199.99 with credits; no free plan | ~90 s per reply in tests; credits drain fast; young company with several pivots (rival source) |
| **Taskade** | Small teams, makers | AI agents + "Genesis" apps built from a prompt | Agents and automations with triggers | $6 / $10 / $25 / $100 per month (annual), credit-based | Breadth over depth **[Inference]** |
| **AI executive assistants** (Howie, Read AI's Ada) | Executives | Scheduling, email replies, answers from company data | Howie escalates ambiguous cases to human reviewers; Ada adds confirmation "sidebars" for sensitive messages | n/a in source | Struggle with multi-person scheduling and missing data; occasional hallucinations; "narrow works, broad judgment struggles" (GeekWire) |

### 2.2 What the market tells us
1. **Calm and autonomous have not been combined.** Sunsama and Akiflow sell calm by staying manual. Motion and Reclaim sell autonomy, and users complain about chaos and reliability. Sunsama even markets itself *against* "aggressive auto-schedulers".
2. **Suites put agents inside their boards.** Asana, monday, ClickUp, Notion, Linear and Microsoft agents help move *tasks in their tool*. None takes ownership of an outcome like "first paid customer" across email, social, code and payments.
3. **Approval models are vague.** The wording is "checkpoints", "ready for review" or "same permissions as humans". Nobody publishes a **decision budget** (how often it will interrupt you) or a **list of gates declared up front**.
4. **Nobody ranks by money-to-goal.** Motion ranks by deadline, priority and dependencies. Sunsama ranks by your intention. Planner ranks by assignment.
5. **Pricing is seat + credits everywhere.** Users experience this as unpredictable (Motion, monday, Lindy).
6. **The trust gap is the real pain.** Per `J8NIX-PRODUCT.md` (its sources): people spend about 6.4 h a week "botsitting" AI output, and only 46% are willing to trust AI. EA tools that work (Howie, Ada) all add a human-confirm step for sensitive actions.

---

## 3. Positioning

### 3.1 Category
**Autonomous management system.** It isn't a task manager, a calendar scheduler or a chatbot. It manages work for you like a senior operator: it **mentors** (what matters next), **manages** (runs and checks the work) and **handles admin** (drafts, follow-ups, logs).

### 3.2 One-line promise
> **You set the goal. J8NIX runs the work, shows the proof, and asks you only when it really matters.**

Short form for the splash and app stores: **"Goals in. Proof out."**

### 3.3 Three differentiators, each with a kill test

**D1: It runs the work end to end and proves every step.**
*What it is:* every mission step ends with **evidence** (a link, a count, test output or a screenshot). No evidence means the step isn't done, and "did nothing" is shown as failed, not hidden. J8NIX stops only at **gates declared in the plan up front**: irreversible, money, first contact with a person, public claims. Everything reversible runs, with an undo.
*Kill test:* Asana Teammates show "step-by-step approach" (checkpoints); Planner marks "Ready for review"; Lindy acts proactively. **Survives, narrowly.** Their agents report *activity inside their own tool*. J8NIX's proof is *outcome-level across channels* (sent, replied, shipped, paid), failures are shown, and the gate list is published before work starts. *Provable by* the Proof screen's weekly line: "N steps · N with proof · N failed, shown".

**D2: A mentor that gives the one next move toward the money.**
*What it is:* each morning, exactly **one move**, ranked by (value × chance) ÷ days to result. The day stays silent, and the night brings a 3-line review. A **pace line** says whether you're ahead of or behind the goal date. When a mission stalls for 3 runs, J8NIX proposes a re-plan or a kill.
*Kill test:* Motion's AI PM "predicts completion dates, flags delays" (time, not revenue). Sunsama's ritual is planning, not mentoring. Linear flags "at-risk work". **Survives.** No competitor found ranks work by expected value toward a stated money goal, or limits itself to one move.

**D3: One simple loop from one project to many departments.**
*What it is:* the same loop (**Goal → Plan → Run → Proof → Decide**) and the same five screens at any scale. A department is just a group of missions with an owner. No new boards, views or settings appear as you grow.
*Kill test:* monday, ClickUp and Asana scale through more configuration (boards, add-ons, credit pools). Sunsama and Akiflow don't scale to teams at all. **Weakest of the three:** today it is proven only at one-studio scale. It's honest to claim "same five screens at any size" now, and claim "multi-department" only after a multi-team pilot.

### 3.4 Real-life value (measured, not claimed)
J8NIX shows these four numbers about itself (on the Proof screen and in the weekly review):
| Metric | What it proves | Target for v1 **[Inference]** |
|---|---|---|
| Decisions asked of you per week | it asks only at real decisions | ≤ 10, each with a recommendation |
| Minutes of your attention per day | hands-free operation | ≤ 15 |
| % of finished steps with evidence | runs, not tracks | 100% |
| Days from idea → first payment, per mission | idea → paid product | trend down mission over mission |

Hours saved are **not** claimed as a headline number until measured against a baseline week.

### 3.5 What J8NIX is not
- Not another board, Gantt or kanban (the suites own that).
- Not a calendar auto-scheduler (Motion and Reclaim own that, with known pain).
- Not a chat window with a to-do list attached.
- Not "one cockpit for all your AIs" (the platforms are building that; see `J8NIX-PRODUCT.md`).
- Not a credit meter: never show credits or tokens in the main UI.
- Not gamified neon, not a racing dashboard (12.0 "Pit Wall" is retired), and not the Claude/Anthropic look (see 4.11).

---

## 4. Design language: "Through-line"

**Idea:** the logo is one soft line with light running through its waist. The interface is built the same way: thin soft lines, round ends, open shapes that close when work is done, and one point of light that marks what is alive right now. Everything else is quiet white space, in Apple's manner.

### 4.1 Principles
1. **One line, round ends.** Rules, rings, progress, timelines and icons share one stroke logic (from 1.2).
2. **Light means life.** Glint `#5BB6F9` appears only where something is running or progressing. Nowhere else.
3. **Open until done.** Progress shapes keep a gap (like the 8's open bowls) and close at 100%.
4. **Content first, controls float.** Following Apple's Liquid Glass rule, glass is for the navigation and controls layer only, never for content.
5. **One thing per screen leads.** Each screen has a single primary action.

### 4.2 Colour tokens. Light first
| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--bg` | `#F4F6FB` | app canvas: cool white with a trace of Midnight | n/a |
| `--surface` | `#FFFFFF` | cards, sheets | n/a |
| `--surface-2` | `#EDF0F7` | grouped rows, inputs | n/a |
| `--ink` | `#060833` (Midnight, from NIX) | primary text, mark | 19.3:1 on white |
| `--ink-2` | `#4A5075` | secondary text | 7.8:1 on white |
| `--ink-3` | `#687090` | tertiary text, metadata | 4.9:1 on white, 4.5:1 on bg |
| `--line` | `rgba(6,8,51,0.08)` | hairlines, 0.5–1 px | n/a |
| `--royal` | `#3043BF` (logo body) | primary buttons, links, selected tab | 7.8:1 on white; white on royal 7.8:1 |
| `--royal-tint` | `rgba(48,67,191,0.10)` | selected row, user chat bubble | n/a |
| `--glint` | `#5BB6F9` (logo core) | running state, ring gradient, splash; **never text** | 2.2:1 on white (decorative only) |
| `--ring-gradient` | `#5BB6F9 → #4075D8 → #3043BF` | goal ring stroke, the 8 | n/a |

**Semantic states (calm: a small dot, line or label colour, never a full-card flood)**
| State | Mark (dot/line) | Text | Behaviour |
|---|---|---|---|
| Running | `--glint` `#5BB6F9` | `#3043BF` | a glint slowly travels along its line (see motion) |
| Needs you | `#E08A00` (marigold) | `#9A5800` (5.6:1) | static; the only warm colour in the app |
| Done | `#14A37A` (calm teal-green; small marks only) | `#0E7A58` (5.3:1) | the line closes, with one soft check |
| Blocked | `#E5484D` | `#C02A33` (5.8:1) | static, with a "why" and a "what unblocks it" line |
| Paused / idle | `#A3A8BE` | `#687090` | no motion |

### 4.3 Colour tokens. Dark variant (deep midnight, never pure black, never green-toned)
| Token | Hex |
|---|---|
| `--bg` | `#05071C` |
| `--surface` | `#0E1233` |
| `--surface-2` | `#161B42` |
| `--ink` | `#EEF1FA` (17.7:1) |
| `--ink-2` | `#A6ACCB` (8.9:1) |
| `--ink-3` | `#7D83A6` (5.4:1) |
| `--line` | `rgba(238,241,250,0.10)` |
| `--royal` (actions) | `#8A9CFF` text/links (7.9:1); button fill stays `#3043BF` with white text |
| `--glint` | `#5BB6F9` (9.0:1, so it can carry text in dark) |
| Running / Needs you / Done / Blocked | `#5BB6F9` / `#FFB547` / `#3DD39B` / `#FF6B70` |

Following Liquid Glass guidance, each custom colour also needs an increased-contrast option. In that mode, `--ink-2` becomes `--ink` and hairlines go to 0.16 alpha.

### 4.4 Typography
- **Font:** **Inter** (variable), licence **SIL Open Font License 1.1**, confirmed on the official repo. It's free for commercial use, but the font itself can't be sold. On Apple devices the stack puts the **system font first**, so users get real SF Pro without the file being distributed:
  `font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", system-ui, sans-serif;`
  Numbers use `font-variant-numeric: tabular-nums` (Inter supports tabular numbers).
- **Never** set "J8NIX" in type. Always use the logo SVG.
- **Weights:** 400 / 500 / 600 / 700 only. Apple advises avoiding Ultralight, Thin and Light.
- **Scale** (px, phone, mirrors iOS Dynamic Type "Large" defaults; desktop the same, with Large Title at 40):

| Token | Size / line | Weight | Use |
|---|---|---|---|
| `large-title` | 34 / 41 | 700 | screen title (Now, Missions…) |
| `title-1` | 28 / 34 | 700 | ring centre value |
| `title-2` | 22 / 28 | 600 | the One Move sentence |
| `title-3` | 20 / 25 | 600 | mission title |
| `headline` | 17 / 22 | 600 | card titles, buttons |
| `body` | 17 / 22 | 400 | default text |
| `callout` | 16 / 21 | 400 | decision "why" lines |
| `subhead` | 15 / 20 | 500 | row labels, chips |
| `footnote` | 13 / 18 | 400 | proof metadata |
| `caption` | 12 / 16 | 500 | timestamps; 11 px is the floor |

Letter-spacing: −0.4px at 28+, −0.2px at 20–22, 0 below that. Text scales with the user's text size (rem-based).

### 4.5 Spacing and layout
- **4 pt base, 8 pt grid:** `4, 8, 12, 16, 20, 24, 32, 40, 56, 80`.
- Phone side margin **20**, card padding **20**, gap between cards **12**, between sections **32**.
- Touch targets at least **44 × 44** (HIG).
- Desktop: glass sidebar 260 + list 380 + detail (max 720). Home content is centred at a maximum of 640.

### 4.6 Radii (soft, concentric, from the logo's 3.4 × stroke rule)
| Token | px | Use |
|---|---|---|
| `r-xs` | 6 | tags, small chips |
| `r-sm` | 10 | inputs, segmented control inner |
| `r-md` | 14 | list groups, icon tiles (matches the existing icon's 14/64 tile) |
| `r-lg` | 20 | cards |
| `r-xl` | 28 | sheets, decision cards, desktop panels |
| `r-full` | 999 | **all buttons** (capsules), pills, tab-bar container |

- **Concentric rule** (Apple): inner radius = outer radius − padding. A 20 card with 8 padding holds a 12 inner element.
- Where supported, use continuous corners: `corner-shape: squircle` as a progressive enhancement, with plain `border-radius` as the fallback.
- **No** sharp or chopped corners anywhere.

### 4.7 Materials, depth and blur
- **Content layer:** solid `--surface` on `--bg`. Depth comes from soft shadows only:
  - `e1`: `0 1px 2px rgba(6,8,51,.05)`
  - `e2`: `0 1px 2px rgba(6,8,51,.05), 0 8px 24px rgba(6,8,51,.07)` (cards)
  - `e3`: `0 2px 6px rgba(6,8,51,.06), 0 24px 48px rgba(6,8,51,.12)` (sheets)
- **Navigation layer (glass):** tab bar, top bar on scroll, decision sheet, composer.
  `background: rgba(255,255,255,.72); backdrop-filter: blur(24px) saturate(180%); border: 0.5px solid rgba(255,255,255,.6); box-shadow: inset 0 0.5px 0 rgba(255,255,255,.8), e2`.
  Dark: `rgba(14,18,51,.66)` with border `rgba(238,241,250,.08)`.
- Use glass sparingly, never inside content, and never glass on glass (Apple's rule).
- `@media (prefers-reduced-transparency: reduce)` switches glass to solid `--surface`.
- Scroll edge: content fades under the glass bars, as Apple's "scroll edge effect" does.

### 4.8 Iconography
- A custom set of about 18 icons on a **24 grid**, **1.5 px stroke** (6.25% of the box, close to the logo's 5.4%), **round caps and joins**, corners at 3.4 × stroke, and **one open gap per icon** where it reads naturally (as in the 8).
- The selected tab gets a 10% Royal tint fill behind the line icon. No fully filled icon set.
- Core icons: now, missions, decisions, proof, talk, go, not-now, undo, pause, stop, steer, evidence-link, evidence-shot, money, person, department, voice, settings.
- Until the custom set exists, an open-source line set (redrawn at 1.5 px with round caps) is an acceptable stand-in. SF Symbols can't be used on the web (Apple licence).

### 4.9 Motion
Apple's rules: motion with a purpose, brief and precise, never blocking, optional, and avoid motion on frequent interactions.
| Token | Duration | Curve | Use |
|---|---|---|---|
| `m-press` | 120 ms | ease-out | button press: scale 0.97 |
| `m-quick` | 200 ms | `cubic-bezier(.2,.8,.2,1)` | chips, toggles, state change |
| `m-move` | 320 ms | `cubic-bezier(.32,.72,0,1)` (iOS-like sheet curve) | sheets, screen pushes, card dismiss |
| `m-fill` | 700 ms | ease-in-out | goal ring and progress line filling |
| `m-splash` | ≤ 1200 ms total | see splash | first open only |
| `m-glint` | 1.6 s loop | linear | "running": a soft highlight travels along a line once per loop |

- "Done" = the open gap closes (200 ms), then one light haptic on mobile. No confetti.
- `prefers-reduced-motion`: no glint travel, no ring sweep, and cross-fades only. Meaning never depends on motion: every state also has a text label.

### 4.10 Splash (from the logo)
1. Canvas `--bg`. The 8 **draws itself as one line** (stroke-dashoffset on the outline path, 600 ms, `m-move` curve), in Midnight.
2. The **glint passes through the waist** (radial `#5BB6F9`, 300 ms) and the line settles into the Royal gradient. This is the logo's own colouring.
3. "NIX" fades in beside it (200 ms) and the lockup holds for 100 ms, then cross-fades to Now.
4. Shown on cold start only. Returning sessions within 12 h see a static mark. Reduce Motion gets a static lockup. The tagline under it reads "Goals in. Proof out."

### 4.11 How this differs from Claude/Anthropic visuals and from 12.0
| | Claude/Anthropic (public tokens) | 12.0 "Pit Wall" (retired) | J8NIX "Through-line" |
|---|---|---|---|
| Canvas | warm cream `#FAF9F5` | black | cool white `#F4F6FB` / deep midnight `#05071C` |
| Accent | coral `#CC785C` | yellow/orange | Royal `#3043BF` + Glint `#5BB6F9` (from the logo) |
| Type | serif display (Copernicus/Tiempos) + Styrene | condensed, loud | one neutral sans (system SF Pro / Inter), no serif |
| Shape | 8/12 px radii, colour blocks | chopped sharp rectangles | capsules, 14–28 px concentric soft radii, round-cap lines |
| Depth | flat colour blocks | flat contrast | Apple layering: solid content + glass navigation |
| Signature | warm editorial | race telemetry | one line with light through its waist |

### 4.12 Key screens (phone first; desktop uses the same screens in sidebar + list + detail)
Bottom glass tab bar: **Now · Missions · Decisions · Proof · Talk**. Only Decisions carries a badge. **Stop all** sits behind the pause glyph at top right on every screen (a long press confirms).

**Now (Home)**
1. Top row: small 8 mark (24 px), today's date (`subhead`, ink-2), pause glyph.
2. **Goal ring**, 220 px. A single ring with 10 px stroke on a `--line` track, drawn with the ring gradient. It keeps a **12° gap at the top until the goal is reached**, then closes. Centre: the current value (`title-1`, tabular), "of [goal]" (`footnote`), and a **pace chip** below it ("On pace", "4 days behind" in needs-you colour, "Ahead"). **[Inference]** A single ring rather than three, on a light background, so it isn't a copy of Activity rings: Apple's HIG forbids replicating them for other data.
3. **The One Move** card (`r-lg`, e2): label "Your one move", the move in one sentence (`title-2`), why it matters in one line (`callout`, ink-2), estimated minutes, and **one capsule button** ("Do it", or "Let J8 do it" when J8NIX can run it itself).
4. **Needs you**: up to 3 compact decision rows (title + J8NIX's recommendation + "Go"). "See all" leads to Decisions.
5. **Running**: one row per mission with a status dot/line, name, a one-phrase state ("Drafting 3 replies"), and a hairline progress line with the glint if running. Tap opens the Mission.
Nothing else goes on Home: no stats grid, no feed.

**Mission**
- Header: mission name (`title-3`), goal and date (`subhead`), and an **autonomy control**, a 3-step segmented control: *Ask me · Ask at gates · Run*.
- **Step line:** a horizontal round-cap line with a node per step. Done nodes are closed and solid Royal. The current node carries the glint. Future nodes are hairline and open. A gate node shows a small marigold ring.
- **Next** card: what runs next, when, and what it needs.
- **Plan:** a list of 3–7 steps, each tagged *reversible* or *irreversible*, with its gates listed.
- **Proof:** the evidence timeline for this mission (see Proof).
- Glass toolbar: **Pause · Steer · Stop and keep work**.

**Decisions**
- One card per decision, oldest-value first, full width, `r-xl`. Each card shows: **What** (`headline`), **Why it matters** (money or time, `callout`), **J8NIX recommends** (highlighted in a `royal-tint` row), an evidence thumbnail or link, and buttons **Approve** (Royal capsule), **Change**, **Not now**.
- Swipe right approves and swipe left means not now, each with a 5 s undo toast.
- Template sends inside a hold window show a **depleting line** (the line motif) plus a "Stop this send" button.

**Proof**
- At the top, the week line: "38 steps · 36 with proof · 2 failed, shown". These are the four value metrics from 3.4.
- A vertical timeline drawn as **one continuous line** on the left, with a node per event: what happened, the evidence (link, count or thumbnail), the mission tag, and an "Undo" or "Can't undo" label.
- Filter chips by mission and state. Day dividers in `caption`.

**Talk**
- One thread with J8NIX. Your messages sit in `royal-tint` bubbles on the right. J8NIX writes plain text on the canvas (no bubble) with the small 8 at the first line, and a **state chip** on any message that started work ("Running", "Done · proof", "Needs you").
- Glass composer with voice. You can create a mission ("Goal, number, date") from one sentence, and J8NIX answers with a plan preview card.
- Settings, connections and voice live behind the avatar here, not in the tab bar.

### 4.13 Build notes
- Tokens go in CSS custom properties on `:root`, with the dark set under `prefers-color-scheme: dark` and `[data-theme="dark"]`.
- Logo assets: use `brand/j8nix-mark-8-2026-11-17.svg` (gradient) and `icons/mark-8.svg` (single-colour outline, recolourable). Retire the `wm-slate` (peach) and `wm-sky` tints from the UI.
- App icon: white tile with the gradient 8 (current `j8-icon-2026-11-17.svg`). It matches this system, so keep it.
- Next step under `DESIGN-RULES.md` process (c): build Now in this language as a static mock for Dave's review before touching the live app. **NEEDS YOUR EYES.**

---

## Sources (pages opened in this run)

**Logo:** repo files listed in section 1 (this repository, `j8/brand/`, `j8/icons/`, `j8/manifest.webmanifest`).

**Competitors**
- Motion features and positioning: https://usemotion.com/llms.txt
- Motion pricing, features and complaints (rival source, Carly): https://www.usecarly.com/blog/motion-ai-review/
- Sunsama pricing and weaknesses (rival source, Morgen): https://www.morgen.so/blog-posts/sunsama-pricing
- Sunsama self-description: https://www.sunsama.com/llms.txt
- Reclaim pricing and weaknesses (rival source, Morgen): https://morgen.so/blog-posts/reclaim-pricing
- Akiflow review (rival source, Carly): https://www.usecarly.com/blog/akiflow-review/
- Asana AI Teammates (Computerworld): https://www.computerworld.com/article/4063082/asana-puts-ai-teammate-agents-to-work.html
- Asana AI Teammates press release: https://asana.com/press/releases/pr/asana-announces-new-ai-teammates-collaborative-agents-that-deliver-results
- monday.com agents press release (11 Mar 2026): https://ir.monday.com/news-and-events/news-releases/news-details/2026/monday-com-Welcomes-AI-Agents-to-Its-Platform-Marking-a-Shift-in-How-Work-Gets-Done/
- monday AI credit pricing: https://support.monday.com/hc/en-us/articles/35277848309394-The-pricing-model-for-monday-AI-portfolio
- ClickUp Brain review (rival source, eesel): https://www.eesel.ai/en/blog/clickup-brain
- Notion 3.0 Agents: https://www.notion.com/blog/introducing-notion-3-0
- Notion AI agents review (rival source, Gmelius): https://gmelius.com/ja/blog/notion-ai-agents-review?f930bb38_page=1
- Linear Agent: https://linear.app/changelog/2026-03-24-introducing-linear-agent
- Linear pricing: https://linear.app/pricing.md
- Height shutdown: https://alternativeto.net/news/2025/3/height-project-management-tool-to-shut-down-by-september-2025
- Microsoft Planner Agent: https://support.microsoft.com/planner/copilot/access-planner-agent
- Planner AI in basic plans (page body not returned): https://techcommunity.microsoft.com/blog/plannerblog/bringing-ai-assistance-to-basic-plans-in-microsoft-planner/4500074
- Lindy review (rival source, Zapier): https://zapier.com/blog/lindy-review/
- Taskade pricing: https://www.taskade.com/pricing
- AI executive assistants (GeekWire): https://www.geekwire.com/2025/the-new-ai-executive-assistants-smarter-faster-still-not-as-good-as-the-real-thing/
- AI chief-of-staff roundup (rival source, Saner.AI): https://blog.saner.ai/best-ai-chief-of-staff/

**Design**
- Apple HIG, Materials: https://developer.apple.com/design/human-interface-guidelines/materials.md
- Apple, Adopting Liquid Glass: https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass.md
- Apple HIG, Typography (Dynamic Type table, weights): https://developer.apple.com/design/human-interface-guidelines/typography.md
- Apple HIG, Motion: https://developer.apple.com/design/human-interface-guidelines/motion.md
- Apple HIG, Activity rings: https://developer.apple.com/design/human-interface-guidelines/activity-rings.md
- Inter licence and features: https://github.com/rsms/inter
- Linear, Behind the latest design refresh: https://linear.app/blog/behind-the-latest-design-refresh
- Things (Cultured Code), awards and design praise: https://culturedcode.com/
- Arc design study: https://blakecrosley.com/guides/design/arc
- Claude/Anthropic public design tokens (for the "do not look like" check): https://www.shadcn.io/design/claude

**Internal:** `ops/brain/J8NIX-PRODUCT.md` (pain statistics and their sources), `ops/brain/J8NIX-V2-RESEARCH.md` (mission loop, 5 screens), `ops/brain/DESIGN-RULES.md`.
