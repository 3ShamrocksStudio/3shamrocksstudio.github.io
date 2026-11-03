# R&K · Rookie & King · Concept v2

> Night Product Lab, 3–4 Nov 2026 · seats CPO + CDO · status: **concept only, NEEDS YOUR EYES**
> **Read first:** the 4 Nov portfolio review marks R&K **KILL (score 0), pending Dave's OK** ([memo](https://github.com/3ShamrocksStudio/3s-status/blob/main/memos/2026-11-04-portfolio-review.md)). This doc is the best case for reviving it, so Dave can decide with a real concept in front of him. Nothing here is built.

## 0. What R&K is today (sources)

| Source | What it says |
|---|---|
| `ops/brain/brain.json` (portfolio review) | "R&K = Rookie & King, LinkedIn chess ice-breaker prototype (22 Oct); Linear 3SHMRX-133 backlog only; no live page, no Mac folder" |
| Linear [3SHMRX-133](https://linear.app/3shamrocksstudio/issue/3SHMRX-133) (Dave, 22 Oct) | "Rookie & King: 'Chess Networking Lounge' at one Tel Aviv conference, $1.5–5k/event; no real-money escrow (gambling/payment rules). Ads between duels OK." |
| Ops dashboard | "Prototype on staging, 22 Oct"; milestone "Monetization" open |
| Repo assets | one game screen `assets/real/scr-rk.png` (isometric navy-marble board, gold vs dark pieces, two round player portraits, a gold bar, bottom icons king / handshake / undo / more) and an icon `assets/real/rk-icon.png` (gold shield with a dark plus and dot) |
| Not reachable tonight | Dave's Mac folder (access prompt could not be shown) and the org repo `gambit-app`, which may be the code (not in this session's scope; unconfirmed) |

So the idea exists (chess as a networking ice-breaker, sold to events) but there is no defined user loop, no money path beyond one pitch line, and no brand system.

---

## 1. Upgraded concept

**One game instead of a cold message.** Rookie & King turns "can I pick your brain?" into "one game of chess?". A game of 10 minutes at most (5 minutes on each clock) gives two strangers something to do together, a reason to talk that isn't a pitch, and a natural end: the **Handshake**, where both can choose to swap a one-line intro and connect.

**The name is the promise:** at the board, a rookie can beat a king. A junior founder can play a CEO as an equal for ten minutes.

Two modes, one product:
1. **Challenge link (free, viral):** a person sends their own link ("Rookie & King: one game?") in a LinkedIn message, email or WhatsApp. The other side plays in the browser with no account. Game → Handshake.
2. **Lounge (paid, events and communities):** an organizer opens a Lounge for a conference, meetup, accelerator or co-working space. Guests scan a QR, get paired by level, play on their phones (or on a physical board using the app as clock and pairing), and a big screen shows the live leaderboard and "King of the Lounge".

### Core value proposition
- **For guests:** *Meet someone worth knowing in ten minutes, without pitching.*
- **For organizers (the buyer):** *Turn the dead networking hour into the part of the event people talk about, with real numbers to show sponsors: games played and handshakes made.*

---

## 2. Target user

| | Who | Why they care |
|---|---|---|
| **Buyer** | Organizers of tech conferences, founder meetups, accelerator demo days, alumni networks and co-working community managers. Israel first (Tel Aviv), per Dave's pitch. | Networking is the stated reason people attend, and the hardest part to make work. A lounge is a sponsorable asset. |
| **User** | Founders, investors and professionals, 25–50, who play casually. | An easy opener; a fair, short format; no pressure to sell. |

Demand signal (existence, not size): chess-and-networking events already run on their own, e.g. the [ICML Chess Club](https://luma.com/h4amvhk8), a [Founder's Chess Club](https://luma.com/6rbeybx7) and [Checkmate & Connect](https://www.eventbrite.fr/e/checkmate-connect-chess-and-networking-for-entrepreneurs-tickets-745411494847). These organizers run them with plain boards; none of the listings shows pairing, a leaderboard or a contact exchange. That gap is the product. No market size is claimed here.

---

## 3. Business model and monetization (recurring first)

| Line | What | Price (**PROPOSAL**, Dave decides) | Type |
|---|---|---|---|
| **Lounge · Community plan** | Unlimited Lounges for one co-working space, accelerator or community; branded boards; monthly report of games and handshakes | ₪490 / month or ₪4,900 / year | **Recurring** (primary) |
| **Lounge · Event pass** | One conference, up to 3 days, big-screen leaderboard, setup help | $1.5–5k per event (Dave's 3SHMRX-133 range) | One-off; the door opener that converts to a Community plan |
| **Sponsor: "The King's Table"** | A sponsor's logo on the boards, the leaderboard and the Handshake card | Bundled into the event price at first | Add-on |
| **Players** | Challenge links, games, Handshakes | Free | Growth loop |

Why two prices: the Event pass is a one-off, high-touch setup for one big conference (Dave's own 3SHMRX-133 range); the Community plan is for a space that runs small Lounges every week with no setup, so it is cheaper per month but recurs. Both are proposals to test, not market data.

Rules: **no real-money stakes or prizes in cash** (gambling and payment rules, per Dave's note). Ads between games were allowed in the pitch; recommend **no ads for players** at first, because the Lounge is sold as a premium experience and ads cheapen it.

No revenue forecast: zero customers and zero events so far. The cheapest test is one free pilot Lounge (§7, step 3).

---

## 4. Branding direction

- **Keep the existing look from the screen:** navy marble, gold and deep-plum pieces, thin gold rules. It already reads "private members' club", which is the right price signal for organizers.
- **Logo (NEEDS YOUR EYES):** the current icon (gold shield with a plus and dot) doesn't say chess or "rookie & king". Direction: a monogram where a **pawn and a king stand side by side**, joined by the ampersand, in gold on navy. Wordmark in a serif (e.g. Cinzel or Cormorant) to match the club feel.
- **Voice:** a calm club host. "Your move." "Good game. Want to shake hands?" Never "crush your opponent".
- **Imagery:** no stock or AI portraits of people who look like real users. The current screen shows two realistic AI portraits; in the product, players see their own photo or initials.
- **Palette proposal:** navy `#0f1a33`, marble `#22304f`, gold `#d4af37`, plum piece `#2a1420`, ivory text `#f4efe4`. Check AA contrast before use.

---

## 5. Product design: layout and UX improvements

What to change from the current screen:

| Today | Problem | Change |
|---|---|---|
| Isometric 3D board | Beautiful but hard to play on a phone: pieces hide squares, taps miss | Top-down 2D board while playing; keep the isometric board for the lobby, invites and the big screen |
| Players in a right side panel (~30% width) | Steals width the board needs on a phone | Opponent strip above the board, you below (name, one-line role, clock) |
| Unlabelled gold bar with dots | Reads as nothing | A real clock per player: 5 minutes each (5+0) by default, so a game never runs past 10 minutes |
| Bottom icons: king, handshake, undo, more | "Handshake" is used for draw offers in chess apps and would clash with the Handshake card; undo doesn't belong in a fair game | Bottom bar: Resign · Offer draw · Chat emoji · Menu. The Handshake is a screen after the game, not a button. |
| No account, no flow defined | No loop | Challenge link → game → Handshake → "challenge someone else" |

**Handshake rules (privacy):** both players must tap "Shake hands" before either sees the other's details. Only a name, a one-line intro and a profile link the player typed in. Nothing is pulled from LinkedIn; R&K never posts or messages on anyone's behalf: the person pastes their own link. (LinkedIn's User Agreement §8.2 forbids bots and automated messaging: https://www.linkedin.com/legal/user-agreement.)

**Guests who don't play chess:** a **Rookie mode** shows the legal moves and a "good move" hint, so a first-timer can finish a game; and the Lounge is always optional, beside the normal networking, never instead of it.

### Wireframes

**A. Challenge link landing (no account)**
```
┌──────────────────────────────┐
│     [ ♟ & ♚ monogram ]       │
│      ROOKIE & KING           │
│                              │
│  Dana challenged you to      │
│  one game of chess.          │
│  10 min max · no sign-up     │
│                              │
│  Your name [__________]      │
│  I play: (•) Rarely          │
│  ( ) Sometimes ( ) A lot     │
│     [   ACCEPT · PLAY   ]    │
│  Not now                     │
└──────────────────────────────┘
```

**B. Game**
```
┌──────────────────────────────┐
│ (DK) Dana · founder   09:41  │
│ ┌──────────────────────────┐ │
│ │  top-down 8×8 board      │ │
│ │  gold vs plum pieces     │ │
│ │  last move highlighted   │ │
│ └──────────────────────────┘ │
│ (YOU) You             09:58  │
│ [Resign] [Draw?] [😊] [≡]    │
└──────────────────────────────┘
```

**C. The Handshake (after the game)**
```
┌──────────────────────────────┐
│   Good game.                 │
│   Dana won in 31 moves.      │
│                              │
│   Shake hands?               │
│   You both see each other's  │
│   intro only if you both say │
│   yes.                       │
│   Your line [ I design apps ]│
│   [ 🤝 SHAKE HANDS ] [ Skip ]│
│ ──────────────────────────── │
│   [ Rematch ] [ New player ] │
└──────────────────────────────┘
```

**D. Lounge lobby (at an event, after the QR scan)**
```
┌──────────────────────────────┐
│ [sponsor logo] TLV Founders  │
│ LOUNGE · 38 playing now      │
│                              │
│  [  FIND ME A GAME  ]        │
│  pairing by level · ~1 min   │
│                              │
│ KING OF THE LOUNGE           │
│ 1. Noa     4 wins            │
│ 2. Amir    3 wins            │
│ 🤝 61 handshakes so far      │
└──────────────────────────────┘
```

**E. Organizer screen (big screen + report)**
```
┌─────────────────────────────────────────┐
│ ROOKIE & KING LOUNGE · TLV Founders     │
│ ┌─────────────┐  LIVE                   │
│ │ isometric   │  Games played     112   │
│ │ hero board  │  Handshakes        61   │
│ └─────────────┘  King: Noa (4 wins)     │
│ Scan to play [QR]     The King's Table: │
│                       [sponsor]         │
│ [Download report CSV]                   │
└─────────────────────────────────────────┘
```
(Numbers in the wireframes are layout placeholders, not data.)

---

## 6. Kill-test (3 ways this fails, cheapest disproof)
1. **Organizers won't pay**, because a stack of boards is free. Disproof: one pilot; ask the organizer afterwards whether they would pay for the next event, and how much.
2. **Guests won't play** in a 90-minute networking slot. Disproof: count games per guest at the pilot. Set the pass mark with the organizer before the event (for example, one game for every four guests); it is a judgment call, not a benchmark.
3. **Handshakes don't happen**, so no value to show sponsors. Disproof: handshake rate per finished game at the pilot.

---

## 7. First 3 build steps (only if Dave revives R&K)
1. **Challenge-link MVP (1 run).** A single-page web game: open-source `chess.js` (BSD-2) for rules plus a top-down board, a link per game, a clock, then the Handshake screen. Peer-to-peer or free-tier sync, zero spend. Staging page only. Before building, check whether the org repo `gambit-app` already holds this code and reuse it.
2. **Lounge mode (1–2 runs).** QR room, pairing queue by how often you play (rarely / sometimes / a lot; it only avoids hopeless mismatches, and anyone can still challenge anyone), leaderboard, a big-screen view, CSV report of games and handshakes (counts only; no personal data in the report).
3. **One free pilot Lounge** at a Tel Aviv founder meetup (Dave picks the organizer and sends the ask himself). Measure the three kill-test numbers; only then price the Community plan.

## 8. NEEDS YOUR EYES
1. **Revive or kill?** The portfolio review says KILL. This concept is the case for a small revive (steps 1–3, zero spend). Your call.
2. If revived: is `gambit-app` the R&K code?
3. Logo direction (pawn + king monogram) and prices are proposals.
