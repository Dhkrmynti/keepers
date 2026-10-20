# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Memecoin traders on Robinhood Chain (4663) who find the token on Pons and decide in a few seconds whether to buy and hold. Holders come back to check their rank, their payouts, and the proof of every transfer.

## Product Purpose
Keepers ($KEEP) is a memecoin site plus a fee engine. Creator fees from trading run a fixed two-step loop: a Reward (0.02 ETH) paid in ETH straight to the 10 biggest wallets that never sold, then a Treasury step (0.025 ETH), then again. Success: a visitor understands the rule (hold, never sell, be top 10) and buys; a holder trusts the live board and the transaction log.

## Positioning
Not a burn and not a buyback token. Holding is the whole mechanic: the ten biggest wallets that never sold are paid in ETH, and one sale removes a wallet forever. The dev wallet is shown openly and is never ranked or paid.

## Operating Context
Live data from the engine API (`/api/status`, `/api/pond`, `/api/wallet/:addr`, `/api/rounds`, SSE `/api/stream`). Wallet connect is an injected EIP-1193 wallet used only for personal_sign (name, portrait, X link); the site never asks for a transaction. Demo data mode exists for dev and preview and is always labelled.

## Capabilities and Constraints
- Backend, engine, tokenomics and API contracts are frozen. Only UI and lore change.
- Rules: min 100,000 tokens, never sold, min hold time from server; top 10 split by tier (No. 1-5 share 70%, No. 6-10 share 30%), by balance inside each tier.
- Portrait traits must keep counts 5, 5, 6, 6 (engine validates them).
- Admin page at `/lotnok` stays.
- No yield, APY, passive income, or promise-of-value language.
- The site does not add explanatory "product truth" blurbs beyond what the current page already says.

## Brand Commitments
- Name: Keepers. Ticker: $KEEP. Chain: Robinhood Chain. Launched on Pons.
- Lore: a lighthouse. The ten biggest holders are the keepers on watch; No. 1 holds the lamp. Selling once means you left your post and the light is out for you, forever. The dev wallet watches but never keeps watch and is never paid.
- Copy in English. Voice: short, dry, deadpan.

## Evidence on Hand
No token, domain, or X account exists yet. All numbers before launch are demo data and must be labelled as such. No testimonials, partners, or price claims.

## Product Principles
1. The rule is the product: hold, never sell, be in the ten.
2. Every payout is provable by its transaction.
3. Live state beats description.
4. Money keeps its plain names: Reward, Treasury.
