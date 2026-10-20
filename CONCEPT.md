# Keepers ($KEEP) · lore (20 Oct 2026)

A new lore on the same engine as Hang On, Capy Onsen and Take a Seat. Mechanics and tokenomics are unchanged; the name, ticker, characters, UI and words are new.

## Lore

A lighthouse coast, drawn as an Admiralty chart. Holding is keeping watch: you never leave your post.

The ten biggest holders are the ten charted lights on the coast. **No. 1 keeps the lamp** on the headland. Overtake someone and your light moves up the coast past them. **Sell once and you have left your post**: your light goes out, for good. The dev wallet is **the daymark**: a beacon on the coast that is never lit and never paid.

- Tagline: **"Keep the light."**
- Voice: short, dry, deadpan, in the plain language of charts and standing orders. Never yield, APY, passive income or promises of value.

| Word on the site | What it is in the engine |
|---|---|
| **the watch / the List of Lights** | the leaderboard |
| **the lamp** | No. 1 |
| **top watch / lower watch** | the two reward tiers (No. 1-5 share 0.014 ETH, No. 6-10 share 0.006 ETH of every 0.02 ETH reward) |
| **on the approach** | ranks 11-50 |
| **signing on** | holding, but the first buy is not old enough yet |
| **left the post** | sold: out forever |
| **the daymark** | the dev wallet |
| **your light / light card** | the wallet check |
| **painting your light** | setting a name, a light, or an X account (a signed message, no transaction) |
| **the tide / high water** | the fee escrow filling toward the next step's size |
| **the log** | every round, with its transaction |

Money always keeps its plain name: Reward, Treasury.

## The light (portrait)

One lighthouse drawn in flat SVG (`src/chart/Keeper.tsx`). Four traits, same counts as the engine validates (5, 5, 6, 6):

- Daymark: White tower, Black bands, Blue bands, Spiral, Checkered
- Lantern: Dome, Cone, Pennant, Twin lamp, Weathervane
- Extra: Nothing, Fog horn, Signal flag, Gull, Flag + gull, Horn + gull
- Weather: Clear day, Dawn, Dusk, Fog, Night, Chart paper

## Mechanics (unchanged)

1. Every 3 seconds the engine reads the Pons fee escrow. When it reaches the next step's size it claims it.
2. **Reward** (0.02 ETH) → ETH straight to the top 10 by balance, by tier and by balance inside each tier.
3. **Treasury** (0.025 ETH) → the treasury wallet.
4. Again from 2. Over a full loop that is 44% to the ten and 56% to the treasury, shown openly on the page.

No buyback and no burn: the engine never buys, sells or destroys $KEEP.

## Where things are

Name and ticker: `src/lib/brand.ts` (plus the engine logs in `bot/`, the signed text in `bot/byline.ts`, `index.html`, `public/favicon.svg`). The page: `src/chart/`. Styles: `src/styles/chart.css`. Design: `DESIGN.md`.
