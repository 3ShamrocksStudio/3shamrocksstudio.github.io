# Chore Royale · Concept v2: The Royal Court

> Night Product Lab, 3–4 Nov 2026 · seats CPO + CDO · status: **staging concept, NEEDS YOUR EYES**
> Answers Dave's 3 Nov critique: *"a miss between the core game idea, the value, the concept and the brand… a wheel, a character with a spoon: is it a war? Do they gain or lose, and how? Users should earn 'pass' cards to counter a chore."*
> Playable prototype (staging): https://3shamrocksstudio.github.io/lab/chore-royale-v2/

---

## 0. What was wrong (diagnosis of the current build)

The test build (`/chore-wars/royale/`) has **five currencies** (⭐ stars, 🪙 coins, 🎟️ spins, ❄️ shields, 🔥 streak), **twelve wheel tile types** (Chore, 2×, Jackpot, Escape, Mystery, Steal, Freeze, Season, Trade…), **four ways to dodge a chore** (Splat Showdown battle, Beat the clock, Buy-off, Escape token), a family meter and a season meter. The crest shows a knight with a giant spoon, the app shows an emoji crown, and the name still swings between "Royale" (a court) and "Wars" (a fight). A kid can't say in one sentence how you win, and a parent can't say why it's better than a sticker chart.

**v2 fix in one line:** one fantasy (a royal court), two numbers (XP and Crowns), one way to counter a chore (cards), one weekly winner (the Monarch).

---

## 1. Core value proposition

- **For parents:** *Chores get done without nagging, because the game assigns them fairly and you only confirm and deliver prizes.*
- **For kids:** *Spin the royal wheel, finish your chores to earn Crowns for real prizes, play cards to dodge the ones you hate, and take the throne as this week's Monarch.*

---

## 2. Fantasy and setting: the Royal Court

The family is a **royal household**. Everything on screen belongs to that one world.

| Thing | What it is in the fantasy | Replaces |
|---|---|---|
| **Kids** | **Royals** of the court. Each wears the crest armour in their own colour. Rank rises with XP: Page → Squire → Knight → Duke/Duchess → Grand Duke/Duchess. | "Champions" |
| **Parent** | **The Regent**: rules the court while the young royals compete for the throne. Confirms chores, delivers prizes, issues Royal Decrees. Never hands out points. | "Referee" |
| **The knight on the crest** | The **Royal Champion**: the armour every royal wears. Your avatar is the crest knight in your colour. | emoji avatars |
| **The spoon** | **The Spoon-Sceptre**: the symbol of the throne. Whoever is Monarch this week holds it (shown on their profile and on the family screen). Chores are "the work of the realm", so the sceptre is a spoon. That is the joke and the meaning. | nothing (was unexplained) |
| **The wheel** | **The Wheel of the Realm**: the court's fair lot. Same wheel, same odds for every royal; not even the Regent can rig it. | "Chore Roulette" |
| **Prizes** | **The Treasury**: real rewards the Regent sets, bought with Crowns. | "Rewards shop" |
| **Family goal** | **The Royal Feast**: a shared goal everyone fills together (pizza night, day out). | family meter + season meter |

**It is not a war.** Siblings compete for the throne, but nobody attacks anybody. The Splat Showdown battle, Steal and Buy-off leave the core game (see §9).

**Name:** "Royale" fits this fantasy; "Wars" contradicts it. **NEEDS YOUR EYES:** the open name question (Chore Royale vs Chore Wars, trademark check 3SHMRX-132) should be answered with the fantasy in mind.

---

## 3. The core loop

```
 ┌───────────┐   ┌────────────┐   ┌─────────────────────┐   ┌───────────────┐
 │ 1. SPIN   │──▶│ 2. CHORE   │──▶│ 3. DO IT  or COUNTER │──▶│ 4. REWARD     │
 │ daily free│   │ lands on   │   │ Done ✓ → Regent     │   │ +Crowns +XP   │
 │ spin      │   │ your list  │   │ confirms             │   │ streak +1     │
 └───────────┘   └────────────┘   │ or play a card ♠     │   │ card every 3  │
       ▲                          └─────────────────────┘   │ days          │
       └──────────────────── next day ◀────────────────────┴───────────────┘
                     Sunday night: the week's Monarch is crowned
```

1. **Spin.** One free spin a day; finishing a chore earns another (daily cap 4 chores, unchanged from the current build).
2. **Chore.** Most tiles are chores. The other tiles are only **Bonus Quest** (an optional extra chore worth a card) and **Crown Cache** (a few Crowns). Nothing else.
3. **Do it or counter it.** Tap **Done ✓** (the Regent confirms), or play a **card** (§5).
4. **Reward.** Confirmed chore → Crowns (spendable) + the same amount of XP (never spent). Streak +1.

---

## 4. Winning and losing

| Number | How you get it | What it does | Can you lose it? |
|---|---|---|---|
| **👑 Crowns** | Each confirmed chore pays its value (set by the Regent, e.g. 10–20) | Buy prizes from the Treasury | Only by spending. Earned Crowns are never taken away. |
| **✦ XP** | Same number as Crowns earned; never spent | Rank (Page → Grand Duke). Lifetime, so it only goes up. | No |
| **🔥 Streak** | +1 for each day with at least one confirmed chore | Every 3 days = 1 card | Yes: miss a day and it resets |
| **Monarch** | Weekly, see below | Holds the Spoon-Sceptre for a week; Monarch crest on profile; picks the Royal Feast menu | Yes: re-decided every Sunday |

**Weekly Monarch rule (fair across ages):** the Monarch is the royal with the highest **completion rate** this week (chores confirmed ÷ chores landed on them), with at least 5 chores landed. Ties go to the longer streak, then to whoever finished first. A 7-year-old with 6 of 6 beats a 14-year-old with 9 of 12. Volume does not win; reliability does.

**What "losing" means:** you never go into debt and never lose earned Crowns (punishing kids with negative balances makes them quit). You lose your **streak**, your **chance at the throne**, and a chore you skip **does not disappear**: it stays on your list, and a chore left undone at midnight counts as "landed, not done" in the Monarch rate.

---

## 5. The PASS-CARD system

### 5.1 How you earn cards
| Trigger | Card |
|---|---|
| Every 3-day streak (day 3, 6, 9…) | 1 random card from Pass / Trade / Delay |
| Finish a **Bonus Quest** (optional chore from the wheel) | 1 card of your choice from Pass / Trade / Delay |
| Monarch of the week | 1 **Royal Decree** card |

Cards are **never sold** for money and never bought with Crowns. Hand limit: **3 cards**.

### 5.2 Card types
| Card | What happens to the chore | Rule |
|---|---|---|
| **🂠 Pass** | Goes back to the Wheel of the Realm. The **next royal** whose spin lands on a chore tile gets it first. | It returns to the wheel **sealed**: nobody can counter it again that day. |
| **⇄ Trade** | Proposes a swap: your chore for one of a sibling's chores. | The sibling must **accept on their own profile**; they can decline for free and the card comes back to you. One trade received per royal per day. |
| **📜 Royal Decree** | The chore goes to the **Regent**, who reassigns it: to another royal, to themselves, or back to you. | The Regent decides; the card is spent either way. Earned only by being Monarch. |
| **⏳ Delay** | Pushes the chore to tomorrow. | **Only works on chores the Regent marked *flexible*.** Time-critical chores (walk the dog, feed the pet, take out the bins on bin night) can't be delayed. Once per chore. |

### 5.3 Limits and parent overrides
- **2 cards played per royal per week** (the Regent can set 0–3). Resets Monday.
- **One card per chore.** A chore that was passed, traded or decreed is sealed for the day.
- Each chore has two Regent flags: **flexible** (can be delayed) and **no cards** (e.g. homework, medicine for the pet).
- **Regent veto:** any card played can be undone by the Regent the same day; the card goes back to the royal's hand.
- **Court Log:** every card played is shown to the Regent with who, what, when.

---

## 6. Fairness rules (so it can't be gamed)

| Exploit | Rule that stops it |
|---|---|
| Passing a chore in circles between siblings | A passed chore is **sealed** for the day: no card can be played on it. |
| An older sibling pressuring a younger one to accept trades | Trades are accepted **privately** on the receiver's own profile; max 1 trade received per day; declining costs nothing; the Regent sees every trade in the Court Log. |
| Tapping Done without doing it | Regent confirmation is on by default; Crowns and XP arrive only on confirm. A rejected chore goes back on the list. |
| Spinning again and again to fish for good tiles | Daily chore cap (4) and spins earned only by finished chores. |
| Delaying everything forever | Delay only on *flexible* chores, once per chore, inside the 2-per-week card limit. |
| Winning the throne by volume (older kids, more chores) | Monarch = completion **rate**, minimum 5 chores. |
| Paying to win | Money never buys cards, Crowns, XP, spins or a better wheel. The paid plan sells convenience and content for the **parent** (§7). |
| A parent playing favourites | Values are set per chore, not per child; the wheel odds are shown in the Regent screen; the Court Log is visible to all royals. |
| Hoarding cards for one big week | Hand limit 3; weekly play limit 2. |

---

## 7. Monetization (recurring first)

**Principle:** kids never see a price and never buy anything. The parent buys a household subscription. This replaces the current build's coin packs sold to top up a child's coins, which sit badly with the fairness promise and with app-store kids' rules.

| | **Free Court** | **Royal Household** (subscription) |
|---|---|---|
| Royals | up to 2 | up to 6 |
| Chores | 10 in the pool, starter packs | unlimited, custom chores with photo proof |
| Cards | Pass + Delay | + Trade, Royal Decree, seasonal card packs (new card *types*, e.g. *Squire's Help*: a sibling helps and you split the Crowns) |
| Themes | Royal Court | extra court themes (Ice Palace, Desert Sultanate, Space Empire) |
| Regent tools | confirm, prizes | Court Log history, weekly report email, chore rotation, two Regents (both parents) |
| Ads | none to kids, ever | none |

**Price (PROPOSAL, Dave decides):** ₪19.90 / month or ₪149 / year per household (US: $4.99 / month or $39.99 / year). 14-day free trial, no card at signup.

Anchors, prices seen on vendor pages on 3 Nov 2026: S'moresUp Premium $4.99/mo or $49.99/yr ([S'moresUp help page](https://smoresup.zendesk.com/hc/en-us/articles/360052790033-S-moresUp-Subscription-Plans-and-Options)); Greenlight app plans "start at $5.99/mo… up to five kids" ([Greenlight](https://greenlight.com/best-chore-apps-for-families)). A third-party roundup lists Joon Premium at $12.99/mo ([Nori blog](https://heynori.com/article/family-operations-system/best-family-chore-apps), written by a competitor; not verified on Joon's own site). ₪19.90 is the Plus price already written in the current build's `store-config.js`.

No revenue forecast is given here: there are no users or conversion data yet. **First test:** 10 families on the prototype for 2 weeks; measure day-7 retention and "would you pay ₪19.90?" answers before any build of payments.

---

## 8. Onboarding (3 steps)

1. **Name your court.** Family name + each royal's name and colour (the crest knight recolours live). The Regent is whoever is setting up.
2. **Pick the realm's chores.** Tick from a starter list; each chore shows its Crown value and two switches: *flexible* (can be delayed) and *no cards*. Walk the dog and feed the pet come pre-marked time-critical.
3. **Stock the Treasury.** 3 starter prizes with Crown prices (editable), then **"Hand the phone to a royal: first spin!"**

---

## 9. What leaves the core game (and why)

| Removed from core | Why |
|---|---|
| Splat Showdown battles | Reads as "war"; a second game inside the game. Could return later as an optional *Tournament* card. |
| Coins 🪙, power-ups, coin store | A second currency nobody could explain; selling coins for a kid's balance clashes with "fair". |
| Steal, Mystery, Freeze, Jackpot, 2×, Season tiles | Twelve tile types → three (Chore, Bonus Quest, Crown Cache). |
| Buy-off, Beat the clock, Escape tokens | Replaced by one system: cards. |
| Season meter | Merged into the single Royal Feast goal. |

---

## 10. Wireframes (5 key screens)

### 10.1 The Court (who's playing)
```
┌──────────────────────────────┐
│        [ CREST LOGO ]        │
│   THE MARKOVICH COURT        │
│                              │
│  ┌────────┐   ┌────────┐     │
│  │ knight │   │ knight │     │
│  │ (gold  │   │(violet)│     │
│  │sceptre)│   │        │     │
│  │ JAKOB  │   │ DEAN   │     │
│  │MONARCH │   │ Squire │     │
│  │ 🔥 5   │   │ 🔥 3   │     │
│  └────────┘   └────────┘     │
│        ┌────────────┐        │
│        │   DAD      │        │
│        │   Regent   │        │
│        └────────────┘        │
│  Royal Feast ▓▓▓▓░░ pizza    │
└──────────────────────────────┘
```

### 10.2 The Royal's Wheel (kid home)
```
┌──────────────────────────────┐
│ [crest] Jakob · Knight  [⇄]  │
│ 👑 120 Crowns  ✦ 340 XP  🔥5 │
│ Hand: [🂠 Pass][⏳ Delay][ + ]│
│ Cards played this week 1/2   │
│ ┌──────────────────────────┐ │
│ │      ▼ (crown pointer)    │ │
│ │   ( WHEEL OF THE REALM )  │ │
│ │  Chore·Chore·Bonus·Cache  │ │
│ └──────────────────────────┘ │
│     [   FREE DAILY SPIN   ]  │
│ MY CHORES                    │
│ 🐕 Walk the dog  +20 👑      │
│   time-critical  [Done ✓][♠] │
│ 🧺 Sort laundry  +15 👑      │
│   flexible       [Done ✓][♠] │
│ THRONE RACE  Jakob 100%·Dean 80%
└──────────────────────────────┘
```

### 10.3 Counter a chore (card sheet)
```
┌──────────────────────────────┐
│  Counter "Wash the dishes"?  │
│  You can play 1 more card    │
│  this week.                  │
│ ┌────────┐┌────────┐┌───────┐│
│ │ 🂠 PASS ││ ⇄TRADE ││⏳DELAY││
│ │back to ││swap w/ ││to tmrw││
│ │ wheel  ││ Dean   ││       ││
│ └────────┘└────────┘└───────┘│
│  📜 Decree (greyed: earn it  │
│     by being Monarch)        │
│  ⏳ greyed on time-critical  │
│     chores, with the reason  │
│          [ Keep it, I'll do it ]
└──────────────────────────────┘
```

### 10.4 The Regent's desk (parent)
```
┌──────────────────────────────┐
│ [crest] Regent · Dad         │
│ [Confirm][Decrees][Chores][Log]
│ JAKOB SAYS DONE              │
│ 🧽 Wipe counters   [✕] [✓]   │
│ DECREES WAITING              │
│ 🍽️ Dishes (from Dean)        │
│   give to: [Jakob][Me][Dean] │
│ COURT LOG (today)            │
│ 18:02 Dean ⇄ Jakob  accepted │
│ 17:40 Jakob 🂠 Pass  [undo]   │
└──────────────────────────────┘
```

### 10.5 The Throne Room (week result + Treasury)
```
┌──────────────────────────────┐
│  THIS WEEK'S MONARCH         │
│   [ knight with spoon-       │
│     sceptre, gold crown ]    │
│        JAKOB · 6 of 6        │
│  Dean 8 of 10 · 80%          │
│  Resets Sunday 20:00         │
│ THE TREASURY      👑 120     │
│ 🕹️ 30 min screen   40 [Buy]  │
│ 🍦 Ice-cream trip  80 [Buy]  │
│ 🎬 Movie pick      60 [Buy]  │
└──────────────────────────────┘
```

---

## 11. Brand alignment

- **Keep the crest logo** (knight, spoon, crown, gold CHORE ROYALE nameplate). It is now the story: the knight is every royal's armour, the spoon is the sceptre. Don't redraw it; use the existing cut-out (`assets/chore/crest-cutout.webp`).
- **One palette across the studio page and the app:** the crest-sampled night/amethyst/gold already used on `work/chore-royale.html` (night `#080114`, amethyst `#4d2876`/`#7844a9`, gold leaf `#f9c85d`/`#edb345`, bronze `#b07730`, magic teal `#1eddc3`). The current app uses a brighter violet `#6a21c4` with emoji crowns: move the hero, wheel rim and Throne Room to the crest palette; keep the brighter violet for buttons where contrast needs it.
- **Type:** Cinzel only for titles that are royal names (rank, Monarch, "The Treasury"); Nunito for everything else. Fredoka can stay inside the app for numbers on the wheel, but not for titles.
- **Icons:** card faces in the gold-rimmed nameplate shape from the crest; Crowns use the crest crown, not 👑 emoji, in the final art. (The prototype still uses emoji.)
- **Voice:** the court herald: warm, a little grand, never mean. "Dean passes the dishes back to the Wheel." "Jakob takes the throne, 6 of 6!"
- **Never:** photos, ads to kids, "war" language, gold as a warning colour.

---

## 12. Open items (NEEDS YOUR EYES)
1. **Name:** Chore Royale (fits the court) or Chore Wars?
2. **Price proposal** ₪19.90/mo · ₪149/yr: OK to test with 10 families?
3. **Remove battles/coins from the app**: OK? (The prototype hides them; the main build is untouched.)
4. The app source is in the `chore-wars` repo / Mac folder, which this night run could not open; the prototype is a copy of the live test build at a staging path. Porting into the real repo is a build step for a run that has access.
