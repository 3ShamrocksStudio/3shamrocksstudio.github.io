# J8NIX product discovery · pains, market, concepts, winner (22 Nov 2026)

> Product-discovery team, run of 2026-11-22. Dave's order: "Shape, refine and deepen J8NIX to actually become the next real product on the market that people actually need." We started from user pain, not from what J8NIX is today. Facts come from pages opened in this run (Sources at the end). Lines marked **[Inference]** are our reasoning, not sourced facts. Internal numbers come from `J8NIX-AUDIT-1119.md`. No 3S prices, no private names, no personal contact details (public repo). Nobody was contacted. Nothing was sent or spent.

## TL;DR (plain words)

1. **The pain is real and measured.** People now juggle several AIs. 46.5% switch between 2+ AI tools for one task (ClickUp). Workers spend 6.4 h a week "botsitting" AI output (Glean). 59% of executives see work stall inside one person's AI tool every week (Salesforce).
2. **Trust is the bottleneck, not ability.** Only 46% are willing to trust AI (KPMG). Trust in AI accuracy fell to 29% among developers (Stack Overflow). Reviewers who approve everything get tired and start rubber-stamping (TechTarget).
3. **Dave's own data shows the same thing:** 277 drafts, 37 sent. 116 of 220 runs did nothing. That is the pain, not a one-off.
4. **But "one cockpit for all your AIs" is a trap for a solo studio.** Microsoft (Agent 365, $15/user), OpenAI (Frontier) and Anthropic (Cowork) are all building their own "manage your agents" layer. We'd be fighting the platforms on their own ground.
5. **We tested 5 concepts.** Our pick is the narrowest one with a clear payer. It is a yes only if it passes its tests.
6. **Winner (working name "Runproof"): proof and control for small AI-automation agencies.** These are freelancers and small shops who build AI agents and automations for paying clients. They charge clients monthly, often $500–$5,000 (Vendasta).
7. **Their two real fears:** (a) a client's flow breaks silently and they lose the client. One agency lost a $2,500/month client after a lead flow was down 3 days unnoticed (Indie Hackers). (b) The client asks "what am I paying for?" Today the answer is "screenshots of execution logs pasted into an email" (n8n forum).
8. **v1 does 5 things.** It alerts when a flow runs less than it should or does nothing. It writes a plain-words weekly report to the client. It holds risky sends until the client taps OK. It shows all clients on one screen. It has a stop switch.
9. **About 70% of it already exists in J8NIX:** runs with "did nothing" status, the approve/edit/kill queue, multi-org tables with row security, the pause switch and the mobile app. Cut the rest: 31 projects, the $1M scoreboard, C-level pods, memory, the chat panel and the ranking engine.
10. **Brutal risks:** small rivals already exist (n8ops, DashLynk, Flowetic, LumaTrack), but none is winning. Agencies are small and churn a lot. n8n's own Insights dashboard covers part of it. And nobody in the forum confirmed that clients *ask* for reports.
11. **Do not build yet.** Run a 30-day test at ₪0. Gates: 15 agency interviews (≥8 report the pain), 3 concierge pilots (≥2 forward our report to their client), then ≥3 agencies pay for month 2. Fewer than 3 paying by day 30 means stop, and J8NIX stays an internal tool.
12. **Name: "J8NIX" is not usable on the market.** It is hard to say and hard to spell, and it tells nobody what the product does. Keep it as the internal name. Shortlist: Runproof, Clientlight, Proofday. A real trademark search is still needed. Focus-mode warning: this is not one of the two cash engines, so the test runs in the background without taking Dave's hours.

---

## 1. Real pains of people who work with many AIs (sourced)

| Pain | Evidence (source, date) |
|---|---|
| **Sprawl: too many AI tools and chats** | 46.5% bounce between 2+ AI tools for a single task; 9% use 5+ weekly; 44.8% of teams abandoned AI tools adopted in the past year; only 7.2% rate their AI strategy "super effective" (ClickUp survey, 1,000+ workers, Jun 2025, vendor survey). A solo founder pays "$200/month for 6 AI tools, probably only need 2… I spend half my time deciding which AI to open" (Indie Hackers, Mar 2026). |
| **Lost context, "where is my work?"** | Ethan Mollick: "It is now getting very hard to track where your work and conversations are in Claude and ChatGPT… The current UX is little help" (via Digg, 2026). A paying ChatGPT user: "I spend an enormous amount of my time on recovery" (OpenAI forum, Sep 2026). Another: "I have to remember where everything lives" (OpenAI forum, Jul 2026). |
| **Work trapped in one person's AI** | 68% of executives see AI outputs go unshared weekly; 66% see two people solve the same problem twice; 59% see work stall in one person's AI tool; 3.6 h/week lost toggling between AI tools and systems (Salesforce Pulse, 250 US execs, Sep 2026, vendor survey). |
| **Checking AI eats the gain ("botsitting")** | Workers think AI saves ~11 h/week, but spend 6.4 h/week checking and fixing it (37% of AI time); 35% clean up after AI weekly (Glean Work AI Institute, 6,000 workers, Jun 2026). 40% got "workslop" in the past month, ~1 h 56 min per incident (Stanford + BetterUp in HBR, via Axios, Sep 2025). |
| **Low trust, high stakes** | 46% willing to trust AI; 66% use AI output without checking it; 56% made work mistakes due to AI (KPMG + Univ. of Melbourne, 48,000 people, 2025). Developer trust in AI accuracy fell to 29%; top frustration (45%) is "almost right, but not quite" (Stack Overflow 2025). 86% of AI users treat output as a starting point and "stay responsible" (Microsoft Work Trend Index 2026). |
| **Agents acting in your name** | A Replit agent deleted a live database during a code freeze, ignored "wait for approval" instructions, then misreported whether recovery was possible (Fortune, Jul 2025). Small-business owners: only 10% would let AI handle their insurance; 86% want a human to talk to (Simply Business, 1,047 owners, Jun 2026). |
| **Approval fatigue** | "The more immediate risk is reviewer fatigue." When ~99% of AI output is fine, people approve on autopilot and the bad one slips through (TechTarget, Sep 2026). |
| **Unreliable or silent runs** | Agency owners say silent failures are the main time sink. One system was "silently not-confirming for months", and an "active" flag can be on while the trigger is dead (n8n forum, Aug–Sep 2026). Cowork scheduled tasks are skipped when the computer is asleep or the app is closed (TechRadar, Feb 2026). |
| **AI value not reaching scale** | Only ~2 in 10 organisations are scaling AI agents. Smaller companies are flat at 22%, and 37% see any EBIT impact (McKinsey State of AI 2026). |
| **Dave's month (one data point)** | 277 drafts, 37 sent (13%); 155 approved and not sent; 116 of 220 runs "nothing"; 149 of 155 replies were a canned line; "so many chat windows… I am lost" (`J8NIX-AUDIT-1119.md`). |

**What this means [Inference]:** the market's pain is no longer "AI can't do it". It is "I can't see what my AI did, I can't trust it to act, and checking it costs me the time it saved." The person who feels this most, *and has a budget line for it*, is whoever is paid to make AI work for someone else.

## 2. Who already solves which part

| Player | What it covers | Price (sourced) | Target | Gap for non-technical owners / small teams |
|---|---|---|---|---|
| Microsoft Agent 365 | Agent registry, shadow-agent discovery, run/error observability, governance | $15/user/mo standalone; in M365 E7 at $99/user/mo; GA 1 May 2026 (Rencore) | IT, security in M365 shops | Enterprise IT tool, not for a 1–10 person business |
| OpenAI Frontier | Build + manage agents, permissions, onboarding, manages third-party agents | Not disclosed; limited customers (TechCrunch, Feb 2026) | Enterprises (HP, Uber, State Farm) | Not available to small teams |
| Anthropic Claude Cowork | Desktop agent, scheduled recurring tasks, asks before big actions | Paid Claude plans (TechRadar, Feb 2026) | Knowledge workers | Single-user, tasks skip when the computer sleeps, no cross-tool view |
| Google Gemini Enterprise Business | Pre-built agents, no-code workflow builder, connectors | From $21/seat/mo, up to 300 people (Google) | SMB teams on Google | Builds agents; does not audit what other tools did |
| Salesforce Agentforce | CRM agents | $5/user + Flex Credits ($500 per 100k), $125/user add-ons, $2/conversation (Salesforce) | Salesforce customers | Expensive, CRM-bound |
| monday Agent Factory | Build/run agents in monday | Free / $49 / $299 per month, credit-metered (monday) | monday users | Inside one work tool |
| Asana AI Studio | AI rules/agents in Asana | Basic free; Plus/Pro credit packs (Asana) | Asana teams | Same |
| Notion AI, ClickUp Brain | AI inside docs/tasks; ClickUp Brain $9–$28/user/mo, all members billed (eesel) | — | Their users | AI sprawl *inside* each tool; no outside view |
| Lindy | No-code agents | $29.99–$199.99/user/mo, credits (Jet Admin, Sep 2026) | SMB, ops | Builder, not an auditor |
| Zapier Agents | Agents across 8k apps | Free 400 activities; Pro $33.33/mo (Zapier) | SMB automators | Builder; approval steps are beta |
| n8n | Workflow + agent builder; Insights dashboard (runs, failure rate, time saved) | Starter €20, Pro €50, Business €667/mo (Jet Admin); Insights dashboard only on Pro+ (n8n docs) | Technical builders, agencies | Shows the *builder* counts, not plain-words outcomes for the *client*; n8n only |
| LangSmith, AgentOps, Langfuse, Portkey, Braintrust | Developer tracing/evals | LangSmith Plus $39/seat; AgentOps Pro $40/mo; Portkey $49/mo; Braintrust Pro $249/mo (morphllm, inference.net) | Developers | Code-level; useless to a client or a non-technical owner. Helicone acquired, now in maintenance (morphllm) |
| HumanLayer (HITL API) | Started as approvals-over-Slack/SMS for agents | — | Developers | **Pivoted to coding agents, acquired by Factory** (YC page). [Inference: a generic horizontal "approval API" was not a business on its own.] |
| Agent Inbox (open source), handup | One inbox where agents ask humans for answers/approvals | Open source; no pricing (AIToolly Nov 2026; dev.to) | Developers running many agents | Dev-only; no client view |
| AI chief-of-staff startups (Huper) | Status from email/chat/CRM, flags decisions | Pre-seed $1.5M, alpha 2026 (Pulse 2.0) | Leaders | Early, horizontal |
| Agency portals: Vendasta, AgencyAnalytics | Branded client portals and reports | AgencyAnalytics $20–25 per client/mo (Coupler, Oct 2026) | Marketing agencies | Built for SEO/ads metrics, not agent runs |
| Small agent-agency tools: n8ops, DashLynk, Flowetic, LumaTrack | Monitoring, chatbot dashboards, ROI ledger for n8n/Make/Vapi | Free betas / free tiers; no public paid price found (Product Hunt, blog, G2, n8n forum) | AI automation agencies | Each covers one piece; tiny traction (n8ops: 6 upvotes, 1 review by its maker) |

**The gap that remains [Inference]:** big platforms govern *their own* agents for *IT departments*. Developer tools trace *code*. Nobody owns the plain-words layer between "the person who runs the AI" and "the person who pays for it". That layer answers three questions: *Did it run? What did it achieve? What needs my OK?* The small tools aimed at agencies prove the need is felt, and their weak traction proves nobody has nailed it yet. It may also mean the need is weaker than it looks. Section 4 tests that.

## 3. Five concepts J8NIX's assets could become

| # | Concept | Who exactly | The job | Moment they'd pay | Why now | Why incumbents miss it | Money (subscription) | Autonomy | Reusable from J8NIX |
|---|---|---|---|---|---|---|---|---|---|
| C1 | **Cockpit**: one inbox for all your AI agents and chats: what ran, what did nothing, what needs you | Solo founders, 1–10 person teams using 3+ AIs | See everything AI did in one place; approve before anything leaves | After a silent failure or a wrong send | Sprawl numbers above | Each vendor shows only its own agents | Per seat, monthly | High | Runs log, approvals, ranking, PWA |
| C2 | **Runproof**: proof and control for AI-automation agencies | Freelancers and 1–10 person agencies running n8n/Make/Zapier/AI agents for 3–30 paying clients | Never lose a client to a silent failure; prove value every week; get client OKs without email ping-pong | When they sign client #3–5 and can no longer watch every flow by hand, or right after a near-loss | Agent agencies are booming; retainers $500–$5k/mo (Vendasta); forum threads on exactly this (Jul–Sep 2026) | Platforms serve the builder, not the builder's client; agency portals are built for SEO metrics | Per client workspace, monthly; free heartbeat as the wedge | High (self-serve sign-up, connect by webhook/node) | Runs + "nothing" detection, approvals with comments, `j8_orgs` multi-org + RLS, pause switch, push, PWA |
| C3 | **Send-gate**: approve-before-send outbox for AI-written outreach | Solo consultants and recruiters using AI to draft outreach | One queue, one tap to send, no double pitch, replies tracked | After an embarrassing AI send | Outreach volume via AI is up [Inference] | Sequencers optimise volume, not owner control [Inference; not opened this run] | Per seat | Medium | Approvals, de-dupe rules, template approval with caps and hold window |
| C4 | **Chats → one plan**: AI chief of staff that merges scattered chats into one plan | Heavy ChatGPT/Claude users | Stop repeating yourself across chats; one plan, one memory | When they lose a week's thinking | "Where is my work" posts (2026) | Vendors are adding memory and projects natively | Per seat | Medium | Memory, tasks, morning plan |
| C5 | **Approve-before-apply job agent** for senior professionals (vertical) | Senior designers/PMs job-hunting | Find roles, tailor CV, apply only on OK, track replies | During a job search | The only J8NIX pipe that ships: 44 drafts → 22 sent by the Mac sender (audit) | Mass auto-apply tools optimise volume [Inference; not opened this run] | Monthly while searching | High | Sender, job hunter arm, approvals |

## 4. Kill test (3 strongest reasons each fails + cheapest 2-week test)

| # | 3 reasons it fails | Cheapest 2-week test (₪0) | Verdict |
|---|---|---|---|
| C1 Cockpit | (1) Microsoft, OpenAI and Anthropic are each building "manage your agents" and will bundle it free or cheap (Agent 365, Frontier, Cowork). (2) We can't read ChatGPT/Claude chat history from outside; the deepest data is locked inside each vendor [Inference]. (3) Horizontal solo-founder SaaS has no channel; our own cold funnel is 72 sent → 0 calls (OPPORTUNITY-SCAN). | Landing page + waitlist posted in 3 founder communities; gate ≥100 signups and ≥10 "I'd pay" | **Kill.** Fights the platforms on their own ground. |
| C2 Runproof | (1) Small rivals exist (n8ops, DashLynk, Flowetic, LumaTrack) and n8n Insights covers counts natively. (2) Agencies are tiny and churn, and many will build a Sheets/Softr dashboard themselves (n8n forum reply). (3) No forum reply confirmed that *clients* ask for reports. It may serve the builder's peace of mind more than the client. | 15 interviews from the agency communities + 3 concierge pilots (we write the weekly report by hand from their logs) | **Winner, conditional.** Clear payer, felt pain, J8NIX assets fit best. |
| C3 Send-gate | (1) Our own data: approving isn't sending. 91 LinkedIn items approved, 4 sent (audit), because LinkedIn can't be sent through safely. (2) LinkedIn bans automation tools [Inference]; email deliverability is a full product of its own. (3) A crowded sequencer market [Inference; not opened]. | 10 interviews with solo consultants; gate ≥5 would pay for "approve and send" alone | **Kill as a product.** Keep it as a C2 feature (client OK before sends). |
| C4 Chats → plan | (1) Vendor memory and projects close the gap every quarter. (2) No API access to chat history [Inference]; users must export by hand. (3) Funded "AI chief of staff" players already exist (Huper). | Concierge: merge 5 users' exported chats into one plan by hand; gate ≥3 use it a week later | **Kill.** No moat; platform feature. |
| C5 Job agent | (1) Crowded auto-apply market, and employers push back on AI applications [Inference; not opened]. (2) Built-in churn: users leave when hired. (3) Reputational risk for Dave's brand if applications look automated [Inference]. | 10 senior job seekers on a waitlist; gate ≥3 pay for month 1 | **Park.** It works for Dave; as a market product it's a churn machine. |

**Pick: C2 (Runproof).** It's the only concept where (a) the buyer already earns money from AI work and loses that money when the AI silently fails, (b) the platforms' own tools leave a gap (they serve the builder, not the builder's client), and (c) J8NIX's best real parts (runs that detect "did nothing", approve/edit/kill, multi-org with row security, pause switch, mobile) carry over almost as they are. It's a conditional yes: if the gates below fail, the honest answer is "none". In that case J8NIX stays Dave's internal tool and gets no more product hours.

## 5. The winner: Runproof (working name)

### Positioning (plain words)
**"Know your clients' AI is working, show them what it did, and let them OK anything risky, in one link."**
For freelancers and small agencies who build AI automations and agents for paying clients.

### The 5 must-have v1 features
1. **"Did it run?" watch:** for each client flow, set what normal looks like (e.g. "~20 runs a day", "at least 1 lead a day"). Alert by email or push when it runs less, does nothing, or fails. Connect it with one webhook URL, an n8n/Make/Zapier step or an email-in address. This is J8NIX's "nothing" run status turned into a product.
2. **Weekly client report in plain words:** auto-written and branded. It covers what ran, what it achieved, what went wrong and what was fixed, with evidence links. Outcomes, not "18 executions succeeded" (the n8n forum advice).
3. **Client OK inbox:** risky actions (outgoing messages, posts, refunds) wait for a one-tap OK / edit / kill on the client's phone. Approved templates can then send within daily caps and a hold window, so clients don't approve the same thing 50 times (the answer to approval fatigue).
4. **Agency home:** all clients on one screen, one short line each ("OK", "silent 2 days", "3 wait for client"). Tap to expand.
5. **Stop switch + audit log:** pause any client's sends at once. Every action and OK is stamped with who and when.

### Cut from current J8NIX (not in v1)
31-project board and stage XP lines; $1M money scoreboard; C-level units and pods (CRO/CMO/CTO…); the "unlocks" ranking engine; chat panel and canned replies; memory; calendar, files, later and todo tables; the ~109 KB rule pack; Instagram and LinkedIn drafting arms; the 74 old versioned files. **Keep:** `j8_orgs` + row-security helpers, `j8_runs` (with did-something / nothing / failed), `j8_approvals` with comments and the kill status, `j8_control` (pause), push triggers, PWA shell.

### First 20 target users and where to find them (profiles, not names)
| # | Profile | Where (public venues, posts only, no cold DMs without Dave's OK) |
|---|---|---|
| 1–6 | n8n builders running 5+ client accounts who posted about client reporting, monitoring or silent failures | n8n community forum threads "How do you show clients what your automations actually did?" and "managing automations for 5+ clients" (Jul–Sep 2026) |
| 7–11 | AI automation agency owners selling retainers | Skool "AI Automation Society" (n8ops recruited its early agencies there) |
| 12–14 | Make.com partner agencies | Make community forum (agency/white-label threads) |
| 15–17 | Freelance automators | r/n8n, r/automation, Indie Hackers posts on lost clients and broken flows |
| 18–20 | Israeli no-code / WhatsApp-bot builders (Hebrew market, Dave's home turf) | Israeli automation freelancers and builder agencies like those listed in OPPORTUNITY-SCAN (public sites); Hebrew no-code Facebook groups |

### Pricing benchmarks (market, sourced; the 3S price is Dave's call, not set here)
- Agency client reporting: AgencyAnalytics **$20–25 per client/month** (Coupler, Oct 2026).
- Agent observability for small teams: AgentOps Pro **$40/mo**, LangSmith Plus **$39/seat**, Portkey **$49/mo**, Langfuse cloud **$29+/mo** (morphllm, Jun 2026).
- Agent platforms: monday Agent Factory **$49 / $299 per month**; Zapier Agents Pro **$33.33/mo**; n8n **€20 / €50 / €667 per month**; Lindy **$29.99–$199.99 per user/month**.
- What the buyer earns per client: retainers **~$500 to $5,000/month** (Vendasta, Nov 2026). [Inference: a per-client fee inside the $20–49 band is a small share (about 1–10%) of a retainer it protects, and one saved client pays for years.]
- Model: per active client workspace, monthly; a free tier = heartbeat watch for 3 flows (the wedge); paid = reports + client OK inbox + branding.

### 30-day validation plan (₪0 spend; Claude does the work; Dave only approves public posts and any message in his name)
| Days | Step | Numeric gate |
|---|---|---|
| 1–3 | One-page site on staging + free "Is your client's flow still alive?" heartbeat (one URL per flow, email when silent). Reuse J8NIX runs table in a new, separate org. | Page and heartbeat work end to end (QA gate) |
| 2–14 | 15 problem interviews (text or call) from the venues above. Ask: last silent failure? How do you report to clients? What did it cost? | **≥8 of 15** describe a lost or near-lost client/retainer, or hours a week on reporting; **≥5** show a current workaround (screenshots, Sheets) |
| 7–21 | 3 concierge pilots: they send us run logs or a webhook; we hand-write their weekly client report and watch their flows | **≥2 of 3** forward our report to their client unchanged; **≥1** catches a real silent failure |
| 10–30 | Free heartbeat posted publicly (Dave-approved posts in the communities) | **≥40** sign-ups, **≥20** flows connected, **≥25%** still active on day 30 |
| 21–30 | Pre-sale: offer month 2 at a price inside the benchmark band | **≥3 agencies pay** (or put a card on file) |
| Day 30 | Decision | Pass all money gates → build v1 (2–3 weeks). Miss the payment gate → **stop**; J8NIX stays internal. Miss 2+ of the other gates → stop. |

### Naming note
- **"J8NIX": not usable on the market.** Searches show no product conflict, but it is hard to say ("J-eight-nix"? "Phoenix"?), hard to spell, and tells nobody what it does. Keep it as the internal name of Dave's control room.
- **Shortlist (quick web checks only, 22 Nov):**
  1. **Runproof**: "proof your runs happened." No product found with this exact name; nearest is RunSafe Security (a different name in embedded security).
  2. **Clientlight**: "a light your client can see." No exact product found; app stores have many "Client…" and "…light" apps, so the field is noisy.
  3. **Proofday**: "the weekly proof day." No exact product found; the "proofing software" category (GoProof, PageProof) is nearby and could confuse search.
  - Rejected after checks: *Tellback* (an existing speaking-practice app), *Steadyhand* (SteadyHands.AI exists).
- **NEEDS YOUR EYES:** a real trademark search (USPTO, EUIPO, Israel ILPO, classes 9 and 42) plus domain and handle checks is required before any public use.

### Honest fit with FOCUS MODE
This is not one of the two cash engines. It will not produce meaningful shekels in 30 days. Even at the gates, revenue is a few agencies at a small monthly fee. The test should run in the background. Claude builds the page and heartbeat and writes the reports. Dave only approves public posts and any message in his name. Building v1 should wait until the payment gate passes.

---

## Sources (pages opened in this run)
- ClickUp, AI sprawl survey (1,000 workers): https://clickup.com/blog/ai-sprawl-survey/
- IT Brief UK, Glean "botsitting" research: https://itbrief.co.uk/story/ai-saves-workers-11-hours-but-botsitting-eats-gains
- Salesforce, "Work stalls in isolated AI tools" (Oct 2026): https://www.salesforce.com/news/stories/work-stalls-isolated-ai-tools/
- Stack Overflow, 2025 Developer Survey results: https://stackoverflow.blog/2025/07/29/developers-remain-willing-but-reluctant-to-use-ai-the-2025-developer-survey-results-are-here/
- McKinsey, The state of AI in 2026: https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai
- Axios, Stanford/BetterUp "workslop" study: https://www.axios.com/2025/09/24/ai-workslop-workplace-efficiency-study
- Microsoft, 2026 Work Trend Index: https://microsoft.com/en-us/worklab/work-trend-index/agents-human-agency-and-the-opportunity-for-every-organization
- University of Melbourne / KPMG, global trust in AI study: https://fbe.unimelb.edu.au/newsroom/media-release-global-study-reveals-trust-of-ai-remains-a-critical-challenge-reflecting-tension-between-benefits-and-risks
- OpenAI community, "250+ hours of manual recovery": https://community.openai.com/t/250-hours-of-manual-recovery-just-to-preserve-continuity-in-chatgpt/1400716
- OpenAI community, "ChatGPT has outgrown the flat chat list": https://community.openai.com/t/chatgpt-has-outgrown-the-flat-chat-list-a-vision-for-the-future-of-long-term-projects/1388492
- Digg, Ethan Mollick on tracking work across Claude and ChatGPT: https://digg.com/ai/acuok89f
- Indie Hackers, "$200/month for 6 AI tools": https://www.indiehackers.com/post/paying-200-month-for-6-ai-tools-probably-only-need-2-building-a-free-quiz-to-help-solopreneurs-cut-their-ai-stack-worth-it-a8f0a45391
- TechTarget, "The human in the loop is falling asleep" (Sep 2026): https://www.techtarget.com/it-strategy/news/366649960/The-human-in-the-loop-is-falling-asleep
- Simply Business, 2026 Small Business AI Outlook: https://www.simplybusiness.com/small-businesses-are-using-ai-but-theyre-not-letting-it-run-the-show-2026-outlook/
- FreshBooks, The Era of the Solopreneur: https://www.freshbooks.com/press/data-research/solopreneur
- Fortune, Replit agent wiped a database: https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/
- Rencore, Microsoft Agent 365 pricing: https://rencore.com/en/blog/understanding-microsoft-agent-365-pricing
- TechCrunch, OpenAI Frontier: https://techcrunch.com/2026/02/05/openai-launches-a-way-for-enterprises-to-build-and-manage-ai-agents
- TechRadar, Claude Cowork scheduled tasks: https://www.techradar.com/pro/claude-cowork-can-now-handle-all-your-recurring-work-tasks
- Google, Gemini Enterprise Business: https://cloud.google.com/gemini-enterprise/business
- Salesforce, Agentforce pricing: https://www.salesforce.com/agentforce/pricing/
- monday.com, Agent Factory pricing: https://monday.com/w/agentfactory/pricing
- Asana, AI Studio pricing: https://help.asana.com/s/article/ai-studio-pricing
- eesel, ClickUp AI pricing: https://www.eesel.ai/blog/clickup-ai-pricing
- Jet Admin, Lindy pricing (Sep 2026): https://www.jetadmin.io/blog/lindy-pricing/
- Zapier, Agents pricing: https://zapier.com/l/agents-pricing
- Jet Admin, n8n pricing (Sep 2026): https://www.jetadmin.io/blog/n8n-pricing/
- n8n docs, Insights: https://docs.n8n.io/insights
- Inference.net, LangSmith pricing: https://inference.net/content/langsmith-pricing/
- Morph, AI agent observability tools compared (2026): https://www.morphllm.com/ai-agent-observability-tools
- Y Combinator, HumanLayer company page: https://ycombinator.com/companies/humanlayer
- AIToolly, Agent Inbox launch (Nov 2026): https://aitoolly.com/ai-news/article/2026-11-03-agent-inbox-launches-on-product-hunt-to-provide-dedicated-email-slack-and-telegram-channels-for-ai-a
- dev.to, "One inbox for all my agents": https://dev.to/arielf/one-inbox-for-all-my-agents-42lk
- Pulse 2.0, Huper AI chief of staff: https://pulse2.com/huper-1-5-million-raised-for-security-first-ai-chief-of-staff-platform
- Vendasta, AI agent agency (Nov 2026): https://www.vendasta.com/blog/ai-agent-agency/
- n8n community, "How do you show clients what your automations actually did?": https://community.n8n.io/t/how-do-you-show-clients-what-your-automations-actually-did/303361?tl=en
- n8n community, "Managing automations for 5+ clients: where does the time go?": https://community.n8n.io/t/for-those-managing-automations-for-5-clients-where-does-the-actual-time-go/309201
- n8n community, LumaTrack node: https://community.n8n.io/t/verified-community-node-n8n-nodes-lumatrack-report-what-your-workflows-are-worth-in-dollars-pounds-euros-per-client-across-every-tool-you-run/304025
- Indie Hackers, lost a $2,500/month client: https://www.indiehackers.com/post/lost-a-2-500-month-client-in-my-ai-automation-agency-in-the-worst-way-possible-T1lcOPJFmIvuMLkkSbmT
- Product Hunt, n8ops: https://www.producthunt.com/products/n8ops
- n8n Chronicles, DashLynk: https://n8nchronicles.blogspot.com/2026/02/dashlynk-for-n8n-agencies-white-label.html
- G2, Getflowetic: https://www.g2.com/sellers/getflowetic
- Coupler.io, AgencyAnalytics pricing (Oct 2026): https://blog.coupler.io/agencyanalytics-pricing/
- Internal: `ops/brain/J8NIX-AUDIT-1119.md`, `J8NIX-V6-PLAN.md`, `OPPORTUNITY-SCAN.md`, `N1-PRESSURE-TEST.md`
