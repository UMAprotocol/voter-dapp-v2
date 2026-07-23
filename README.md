This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

**Getting your environment variables**
You can only do this if you have access to UMA's vercel projects.

You need to install [vercel-cli](https://vercel.com/docs/cli).

Then run `vercel link`, and follow the prompts to link the UMA->voter-dapp-v2 project.

Once linked run `vercel env pull .env.local`. This will pull a file down which has development environment variables.

Next, run the development server:

```bash
npm run dev
# or
yarn dev
```

## How the app fetches data

All client-side fetching goes through react-query. Global defaults ([pages/\_app.tsx](pages/_app.tsx)): data is considered fresh for 30 seconds, queries do not refetch on window focus, and failed requests retry once. Individual hooks override these where the data demands it.

### Sources

**Mainnet voting contract (RPC via ethers)** — the source of truth for the current round: active and upcoming votes are contract calls keyed by `roundId`, and per-user commit/reveal/encrypted-vote state comes from event scans bounded to roughly two rounds of blocks (`voteEventsBlockLookback`). Delegation state is also scanned from events, anchored at the contract's deploy block. These stay on RPC because the voting-v2 subgraph has no delegation handlers and drops the caller from commit/reveal events.

**The voting-v2 subgraph (The Graph)** — queried directly from the client (`NEXT_PUBLIC_GRAPH_ENDPOINT`) for anything historical or aggregate: the full past-vote list (fetched *without* resolving L2 ancillary data), per-user voting/staking details and vote history, and active vote results.

**L2 oracle spokes (RPC, server-side)** — requests bridged from an L2 carry a stamp in their ancillary data instead of the real payload. `/api/resolve-l2-ancillary-data` reads the original request from the child chain's OracleSpoke. The client only resolves votes that are actually rendered (see below).

**Next API routes** — `/api/contentful-umips` proxies Contentful server-side for UMIP titles/descriptions on governance ("Admin N") votes (the access token is server-only; responses are CDN-cached for 10 minutes). `/api/resolve-deeplink` turns a `?vote=` link into a renderable entity before the vote lists load. Discord threads and AI summaries are served from Redis, warmed by the cron jobs described below.

### On-screen enrichment

Vote lists come out of the subgraph cheap and incomplete on purpose. Every rendered slice of votes is wrapped in `useVotesWithOnScreenData`, which lazily attaches the two expensive pieces — resolved L2 ancillary data and UMIP metadata — only for the votes actually on screen, then recomputes titles/descriptions. Both are immutable once fetched, so they cache forever (`staleTime: Infinity`). New UI that renders votes should use the same wrapper.

### Refetch cadence

- **Once per round**: active votes, upcoming votes, and past votes are keyed by `roundId`, so a round rolling naturally refetches them. Past votes additionally poll once a minute for the first 15 minutes after a roll to absorb subgraph indexing lag, and active votes poll every second for the first 30 seconds of the commit phase to pick up just-activated requests.
- **Every minute**: active vote results, user voting/staking details, rewards inputs, and (for delegates) the delegator's commit lookups.
- **On window focus**: the user's round-scoped commit/reveal/encrypted-vote state, so a commit made in another tab or device is picked up on return. Commit and reveal mutations also write their results straight into the query cache, so same-tab state is correct without a refetch.
- **Never** (cache forever): anything immutable — resolved ancillary data, past vote details and participation, decoded admin transactions, IPFS content, UMIP metadata.

## Generating the Approved Identifiers Table

We use a JSON file to look up titles, descriptions and URLs for approved price identifiers for display in the UI. The list of approved identifiers can be found [in our docs](https://docs.uma.xyz/resources/approved-price-identifiers).

These approved identifiers are updated periodically in the docs, and when this happens, the JSON file will need to be re-generated.

To generate the JSON file, run the following command in the root directory of the project:

`yarn update-approved-identifiers`

This will download the raw file of the approved identifiers from the UMA docs (on GitHub), and then re-generate a JSON file.

## Cron Jobs & Discord Integration

The app uses cron jobs (every 10 min) to pre-fetch Discord threads and generate AI summaries.

### 1. Discord Thread Caching

`/api/cron/warm-discord-threads` fetches and caches Discord discussions for active votes.

```mermaid
flowchart LR
    Cron[warm-discord-threads] --> Chain[Voting Contract]
    Chain -->|active votes| Cron
    Cron --> Discord[Discord API]
    Discord -->|thread messages| Cron
    Cron -->|cache| Redis[(Redis)]
    Redis --> API["/api/discord-thread"]
    API --> FE[Frontend]
```

#### Thread ID Map

To find Discord threads for votes, we maintain a **thread ID map** that maps vote request keys to Discord thread IDs. This map is cached in Redis and refreshed using two strategies:

1. **Incremental updates**: On each cron run, we fetch only new messages (using Discord's `after` parameter) and merge them into the existing map. This is fast and avoids rate limits.

2. **Full rebuilds**: Every **2 hours**, we do a full rebuild to catch any threads that may have been missed due to race conditions or API issues. Full rebuilds only look back **7 days** to avoid fetching ancient history.

The request key format is `{title}-{timestamp}` with spaces removed, e.g., `U.S.strikeonSomaliabyFebruary7?-1770699603`. This key is generated both when looking up threads (from vote metadata) and when parsing Discord thread names.

### 2. AI Summary Generation

`/api/cron/warm-summaries` generates AI summaries from cached thread data (batches of 3).

```mermaid
flowchart LR
    Cron[warm-summaries] --> Redis[(Redis)]
    Redis -->|cached threads| Cron
    Cron --> OpenAI[OpenAI API]
    OpenAI -->|summary| Cron
    Cron -->|cache| Redis
    Redis --> API["/api/update-summary"]
    API --> FE[Frontend]
```

## Disabling Discord Summaries

To disable specific Discord summaries, set `DISABLED_DISCORD_SUMMARY` with semicolon-separated entries in the format `time:identifier:title`.

**Important**: If titles contain dollar signs (`$`), escape them with backslashes or use single quotes to prevent shell variable expansion.

Examples:

```bash
# Using escaped dollar signs (recommended)
DISABLED_DISCORD_SUMMARY="1756831090:0x5945535F4F525F4E4F5F51554552590000000000000000000000000000000000:WLFI >\$35B market cap (FDV) one day after launch?;1756823752:0x5945535F4F525F4E4F5F51554552590000000000000000000000000000000000:MicroStrategy purchases >4000 BTC September 2-8?"
```
