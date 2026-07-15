# Voter dApp — Data-Fetching Architecture & Efficiency Audit

_Audit date: 2026-06-29. Scope: subgraph (The Graph), on-chain RPC, internal API routes, React Query hooks, and the React context/data-flow layer. Findings are ranked by severity with concrete solutions._

---

## TL;DR

The app feels slow and brittle and spams the console for a small number of compounding, structural reasons:

1. **The "paginated" Past Votes page isn't actually paginated at the fetch layer.** The root `VotesProvider` pulls the _entire_ resolved-vote history into the browser on every page load, then fires **one HTTP request per historical vote** to resolve L2 ancillary data, and **repeats the whole thing every 60 seconds**.
2. **The global `QueryClient` has no defaults** (`staleTime: 0`, `refetchOnWindowFocus: true`, `retry: 3`), so every query refires on tab focus / remount — multiplying everything above.
3. **Heavy on-chain queries scan enormous block ranges client-side** (up to 1,000,000 blocks) with no caching; many public RPCs reject these ranges, which is the bulk of the "errors even when it works" noise.
4. **The root provider fetches ~13 query families on every route** regardless of which page the user is on, many without `enabled` guards so they fire with `address === undefined` before the wallet connects.

Fixing items in the **Critical** and **High** sections below should produce the largest, most immediate improvement in both speed and console cleanliness.

---

## Architecture overview (as built)

```
_app.tsx
  ErrorProvider > NotificationsProvider > VoteTimingProvider
    > QueryClientProvider (new QueryClient() — NO defaults)
      > WalletProvider > ContractsProvider > DelegationProvider
        > VotesProvider  ← fetches ~13 query families on mount, every route
          > PanelProvider > <App/>
```

Data sources:

- **Single voting subgraph** (`NEXT_PUBLIC_GRAPH_ENDPOINT`, mainnet) — client-side via React Query.
- **On-chain RPC** (mainnet + L2 spokes via `NEXT_PUBLIC_PROVIDER_V3_*`) — client-side `queryFilter`/`eth_call`.
- **Internal API routes** (`/pages/api/*`) — server-side, augment requests, resolve L2 ancillary data, Discord/OpenAI summaries; warmed by crons every 10 min; Redis (Upstash) + 30-day CDN cache headers.
- **Contentful, IPFS, Polymarket** — auxiliary.

The server/API + cron + Redis layer is the **healthiest** part of the system (good cache headers, cache warming, structured validation). Most problems live on the **client**: the React Query layer, the root context, and client-side chain scanning.

---

## CRITICAL

### C1. The Past Votes flow loads the entire vote history + an N+1 ancillary-data fan-out, on every load, every 60s

**This is the single biggest issue and ties together slowness + console errors.**

Chain of calls:

- [`usePastVotes`](hooks/queries/votes/usePastVotes.ts) lives in the root `VotesProvider`, so it runs on **every route** (home, stake, etc.), not just `/past-votes`.
- It calls `getPastVotesAllVersions()` → `getPastVotesV2Lightweight()` → [`fetchAllDocuments`](helpers/util/fetchAllDocuments.ts), which **loops the subgraph 200 records at a time until the entire resolved-vote history is in browser memory** (potentially thousands of records).
- That result is passed to [`resolveAncillaryDataForRequests`](helpers/voting/resolveAncillaryData.ts), which fires **one `fetch('/api/resolve-l2-ancillary-data')` per vote**, 15 concurrent (`promiseAllWithConcurrency`).
- [`usePastVotes.ts:15`](hooks/queries/votes/usePastVotes.ts#L15) sets `refetchInterval: oneMinute`, so the **full history + full ancillary fan-out re-runs every 60 seconds**.
- The page-level "pagination" in [`PastVotes.tsx:31`](components/pages/PastVotes.tsx#L31) is purely a client-side `Array.slice()` over the already-fully-loaded list. Only [`useUserPastVotes(entriesToShow)`](hooks/queries/votes/useUserPastVotes.ts) is genuinely on-demand.

**Impact:** Huge initial payload, hundreds of internal HTTP requests on cold cache, sustained background load every minute, and the per-request `console.warn`/`console.error` in `resolveAncillaryData` is a primary source of console spam.

**Solution:**

- **Make the list fetch genuinely server-paginated.** Drive `getPastVotesV2Lightweight` with `first`/`skip` from the page state (page size 20–50) instead of `fetchAllDocuments`. Use React Query `keepPreviousData` (or `useInfiniteQuery`) keyed by page. The subgraph already supports `orderBy: resolvedPriceRequestIndex desc`.
- **Move `usePastVotes` out of the root `VotesProvider`** and into the Past Votes page (or gate with route). The home/active flow does not need historical votes.
- **Stop resolving ancillary data for the whole list.** Resolve it lazily per visible row / on detail open (you already have `getPastVoteDetails`). Or resolve it server-side once and store the resolved value on the subgraph/Redis so the client never fans out.
- **Drop the 60s `refetchInterval`** on past votes — historical resolved votes are immutable. Use a long `staleTime` instead.

---

### C2. Global `QueryClient` has no defaults — refetch storms on every focus/remount

[`pages/_app.tsx:19`](pages/_app.tsx#L19): `const queryClient = new QueryClient();`

Inherits React Query v4 defaults: `staleTime: 0`, `refetchOnWindowFocus: true`, `refetchOnMount: true`, `retry: 3`. Combined with the many `refetchInterval: oneMinute` hooks and C1, **every tab focus triggers a full refetch of everything**, including the bulk past-votes load and the chain scans (C3).

**Solution:** Set sane global defaults and override per-query only where needed:

```ts
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // most data tolerates 30s
      refetchOnWindowFocus: false, // opt back in for the few live queries
      retry: 1, // RPC range errors won't succeed on retry #2/#3
    },
  },
});
```

Then keep `refetchInterval` only on truly live data (active votes near phase end, live results) and give immutable data (past votes, past vote details) a long `staleTime` with no interval.

---

### C3. Client-side event-log scans over enormous block ranges, uncached, on every load

All run in the browser, refetch on focus, and many public RPC endpoints reject ranges this large (→ console errors):

| Query                                            | Range                           | File                                                                                   |
| ------------------------------------------------ | ------------------------------- | -------------------------------------------------------------------------------------- |
| `getAssertionClaim`                              | **1,000,000 blocks**            | [getAssertionClaim.ts:10](web3/queries/votes/getAssertionClaim.ts#L10)                 |
| `getEncryptedVotes`                              | 100,000                         | [getEncryptedVotes.ts:17](web3/queries/votes/getEncryptedVotes.ts#L17)                 |
| `getRevealedVotes`                               | 100,000                         | [getRevealedVotes.ts:24](web3/queries/votes/getRevealedVotes.ts#L24)                   |
| `getCommittedVotes`                              | 100,000                         | [getCommittedVotes.ts:23](web3/queries/votes/getCommittedVotes.ts#L23)                 |
| `getCommittedVotesByCaller`                      | 100,000                         | [getCommittedVotesByCaller.ts:24](web3/queries/votes/getCommittedVotesByCaller.ts#L24) |
| `getUpcomingVotes`                               | 30,000                          | [getUpcomingVotes.ts:12](web3/queries/votes/getUpcomingVotes.ts#L12)                   |
| `getDelegateSetEvents` / `getDelegatorSetEvents` | **from genesis (no fromBlock)** | [getDelegateSetEvents.ts:13](web3/queries/delegation/getDelegateSetEvents.ts#L13)      |

**Impact:** Slow first paint, RPC rate-limit/range errors, repeated on every focus.

**Solution:**

- **Prefer the subgraph over `queryFilter` for historical reads.** Committed/revealed/encrypted votes and delegation events are exactly what a subgraph indexes well; the voting subgraph likely already has these entities. Move these off RPC.
- For anything that must stay on RPC, **chunk the range and cache aggressively** (long `staleTime`, no focus refetch). Anchor `fromBlock` to `config.deployBlock` or a per-round block rather than "current − N".
- Add explicit `fromBlock` to the delegation scans (genesis scans are the worst offenders).

---

### C4. Console-error noise even on success

The user explicitly flagged this. Sources found:

- `resolveAncillaryData` logs `console.warn` on every API miss **and** `console.error` on fallback failure — multiplied by C1's per-vote fan-out ([resolveAncillaryData.ts](helpers/voting/resolveAncillaryData.ts)).
- Direct `console.error` in hooks regardless of severity: [useVoteDiscussion.ts:10](hooks/queries/votes/useVoteDiscussion.ts), [useIpfs.ts](hooks/queries/votes/useIpfs.ts), [useDiscussionSummary.ts:82](hooks/queries/votes/useDiscussionSummary.ts), [useGlobals.ts:12](hooks/queries/rewards/useGlobals.ts), [getUserVotesForRequests](graph/queries/getPastVotes.ts#L431).
- Errors are **not deduped** — a single failing endpoint logs once per item / per refetch.

**Solution:**

- Route all data-fetch logging through one helper with a severity threshold and dedup (you already have `useHandleError`/`ErrorContext` — extend it to cover the warn-level cases instead of raw `console.*`).
- Treat "expected" misses (no ancillary data, no discord thread, no polymarket link) as normal control flow, not errors. Return a typed empty result and don't log.
- Once C1/C3 are fixed, the _volume_ of these drops dramatically because the failing calls largely stop firing.

---

## HIGH

### H1. N+1 in delegation event resolution (sequential)

[`getDelegateSetEvents.ts:29-55`](web3/queries/delegation/getDelegateSetEvents.ts#L29): for each delegate event, `detectDanglingDelegate` awaits a separate `voterStakes(delegator)` call **in a sequential `for` loop**. N events → N round-trips, serialized.

**Solution:** Batch the `voterStakes` reads with Multicall3 (one `eth_call`), or parallelize with `promiseAllWithConcurrency`, or fold this validation into the subgraph query.

### H2. Root `VotesProvider` fetches ~13 query families on every route

[`VotesContext.tsx:116-147`](contexts/VotesContext.tsx#L116) unconditionally runs active, upcoming, past, contentful, committed (×3 variants), revealed, encrypted, decrypted, active-results, user staking details, and decoded admin transactions — on the home page, the stake page, everywhere.

**Solution:** Split the provider, or gate queries by route / `enabled`. Past votes, active-vote-results, and decoded-admin only matter on their respective views. This is the architectural root cause that makes C1/C3 fire everywhere.

### H3. Hooks fire before the wallet connects (missing `address` guards)

~15 account-scoped hooks only guard on `!isWrongChain`, not on address presence, so they execute `queryFn` with `address === undefined`: e.g. [useCommittedVotes](hooks/queries/votes/useCommittedVotes.ts), [useEncryptedVotes](hooks/queries/votes/useEncryptedVotes.ts), [useStakedBalance](hooks/queries/staking/useStakedBalance.ts), [useTokenAllowance](hooks/queries/staking/useTokenAllowance.ts), [useStakerDetails](hooks/queries/staking/useStakerDetails.ts), most of `delegation/*`.

**Impact:** Wasted/failed RPC calls and console errors on every cold load before connect.

**Solution:** Add `enabled: !!address && !isWrongChain` (and equivalent for delegator address) to all account-scoped hooks. Cheap, high-value cleanup.

### H4. `refetchInterval` silently defeats `staleTime` on immutable data

[`usePastVoteDetails.ts`](hooks/queries/votes/usePastVoteDetails.ts) and [`useUserPastVotes.ts`](hooks/queries/votes/useUserPastVotes.ts) both set `staleTime: 5 * oneMinute` **and** `refetchInterval: oneMinute` — the interval wins, so they poll every minute for data that never changes (resolved past votes).

**Solution:** Remove `refetchInterval` on past/immutable data; keep the long `staleTime`.

### H5. Single subgraph = single point of failure, no retry/fallback

All voting queries hit one `graphEndpoint`. If it's down or slow, the entire vote UI fails hard (queries throw, generic error shown). No circuit breaker, no stale-while-error.

**Solution:** Add a retry-with-backoff + timeout wrapper around `graphql-request`; serve last-good cache on error (React Query `placeholderData`/persisted cache); consider a fallback gateway URL.

---

## MEDIUM

### M1. `VotesContext` recomputes the full vote transform 3× per render, unmemoized

[`VotesContext.tsx:264-266`](contexts/VotesContext.tsx#L264): `getVotesWithData()` is called for active, upcoming, and past lists **on every render, before** the `useMemo` at line 295. The function maps every vote, does 8+ lookups each, and calls `getVoteMetaData()` (identifier + ancillary decoding) — over the _entire_ past list (see C1). The context value `useMemo` has 25+ dependencies, so it re-runs often, and 13 underlying queries each trigger re-renders.

**Solution:** Wrap each `getVotesWithData(...)` call in its own `useMemo` keyed on its inputs. Once C1 shrinks `pastVotesByKey` to a page, this cost largely disappears too.

### M2. No read multicall — many individual `eth_call`s

E.g. [`getRewardsCalculationInputs`](web3/queries/rewards/getRewardsCalculationInputs.ts) makes 4 separate calls via `Promise.all`; balances/allowances/staker-details are all individual calls per address. `multicall` is used for writes (commit/reveal) but not reads.

**Solution:** Batch read calls through Multicall3 (`@uma/contracts` or a small helper). Fewer round-trips, fewer rate-limit errors.

### M3. Contentful & decoded-admin waterfalls with oversized query keys

[`useContentfulData`](hooks/queries/votes/useContentfulData.ts) and [`useDecodedAdminTransactions`](hooks/queries/votes/useDecodedAdminTransactions.ts) both wait on active+upcoming+past, and **embed the entire vote objects in their query keys**. Any change to any vote object invalidates and refires them; they also can't start until all three upstream queries resolve.

**Solution:** Key these queries on a stable derived value (sorted list of identifiers/round ids), not the full objects. Start them per-section as data arrives rather than waiting on all three.

### M4. Nested subgraph collections are truncated, not paginated

[`getPastVotes.ts`](graph/queries/getPastVotes.ts): `groups`, `committedVotes`, `revealedVotes` are capped at `first: 100` (V2 list) / `1000` (details). [`getActiveVoteResults`](graph/queries/getActiveVoteResults.ts) fetches `groups` with **no limit at all**. Rounds with more participants silently lose data (correctness/participation bugs), and the unbounded `groups` is a latent payload risk.

**Solution:** Add explicit bounded limits everywhere (including `groups`), and where the cap is reachable, paginate the nested field or aggregate it in the subgraph rather than client-side.

### M5. Duplicate `stakedBalanceKey` across two hooks

[`useStakedBalance`](hooks/queries/staking/useStakedBalance.ts) and [`useDelegatorStakedBalance`](hooks/queries/staking/useDelegatorStakedBalance.ts) both use `[stakedBalanceKey, <address>]`. They're disambiguated by the address element, so collision only occurs when user address == delegator address — but that's a real edge case for delegates.

**Solution:** Give the delegator variant its own key constant.

### M6. `getProvider` creates a new `JsonRpcProvider` per call

[`config.ts`](helpers/config.ts) caches `primaryProvider` at module load, but `getProvider(chainId)` mints a fresh provider on each invocation for non-primary chains.

**Solution:** Memoize providers per chainId in a small registry.

---

## LOW

- **L1. Sequential subgraph pagination for user history.** [`getUserVotingAndStakingDetails`](graph/queries/getUserVotingAndStakingDetails.ts) loops `while(true)` 1000-at-a-time, serialized. Fine for small histories; for heavy voters it's several sequential round-trips. Consider parallelizing after the first page returns a count.
- **L2. No prefetch on pagination.** `useUserPastVotes` fetches only the current page on demand; prefetching the next page on hover/idle would smooth navigation.
- **L3. Bespoke 500ms polling loop** in [`useDiscussionSummary`](hooks/queries/votes/useDiscussionSummary.ts) using refs + `setInterval` outside React Query. Works, but is hard to reason about; could be expressed as a React Query `refetchInterval` that stops on success.
- **L4. Warnings bypass `ErrorContext`.** Decryption, polymarket, committed-vote-validation warnings only hit the console, so they're invisible to the in-app error UI and to monitoring.
- **L5. `fetch-summary` / `discord-thread` cache headers.** `fetch-summary` sets no HTTP cache header (Redis-backed but no CDN reuse); `discord-thread` uses a short `s-maxage=600`. Minor CDN-efficiency wins available.

---

## Suggested sequencing (biggest bang first)

1. **C2** — set `QueryClient` defaults (1 line, immediately calms refetch storms).
2. **C1** — true server-pagination for past votes + move `usePastVotes` off the root + lazy ancillary resolution. Biggest single win.
3. **H3** — add `enabled` address guards (mechanical, kills a swathe of cold-load errors).
4. **C3 / H5** — move historical chain scans to the subgraph; add subgraph retry/backoff.
5. **C4 / L4** — consolidate logging, demote expected misses (mostly self-resolves after 1–3).
6. **H1, M1, M2, M3, M4** — efficiency/refactor cleanups.

Items 1–3 are low-risk and should be felt immediately by users and in the console; 4 is the larger architectural piece that removes the brittleness against RPC providers.
