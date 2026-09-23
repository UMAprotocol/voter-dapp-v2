# Polymarket V2 voter support

V1 requests keep the existing adapter and bulletin-board flow. V2 JSON requests
are tagged as Polymarket V2 using the canonical Polygon OOReporter and Managed OO
bridge suffix. Both addresses are fixed constants in `lib/polymarket-v2.ts`, not
environment variables. JSON title, description, resolution mappings and product specifications
are displayed without changing the original bytes used for commit/reveal.
Early request remains a valid DVM vote, even though event-based OO proposals
cannot propose it. Atomic outcome labels are deferred until their schema is confirmed.

## Originally proposed outcome

Polymarket V1 and V2 vote details show the originally proposed outcome above the
description, using the existing OO subgraph proposal lookup. Outcomes use the
request's resolution mapping, such as `P1 (No)`, `P2 (Over)`, or `P3 (50/50)`; numerical requests show the value until
atomic outcome labels are defined. Missing proposal data displays `Unavailable`.
This is contextual information and does not preselect a vote.

## Market links

The server queries public Gamma by the numeric `market_id` in the JSON rules.
V1 continues to query by `question_ids`, including closed markets. Missing or
hidden markets produce no link and are not negatively cached; the V2 client
retries periodically. Gamma metadata is not needed to display or vote on a request.

## Rule updates

The browser posts the resolved ancillary data and identifier to
`/api/polymarket-v2-rule-updates`. The server reads Managed OO's
`getRequestRulesUpdates(OOReporter, identifier, originalRules)` at a finalized
Polygon block using the existing `NEXT_PUBLIC_PROVIDER_V3_137` configuration.

OOReporter forwards updates to Managed OO and emits its own update event.
Managed OO stores the full history against `(requester, identifier, original
rules)`, without a timestamp. The getter therefore includes updates across
re-requests and linked reporter IDs sharing that identity; no event scanning
or separate alias lookup is needed. Original rules must not be replaced with
updated text when constructing this key or the DVM commit/reveal payload.

The original description remains visible alongside the ordered updates, whose
full text is preserved. Failed reads produce a visible warning, never a
successful empty history. Responses are not cached.

No OTB database dependency, service token, deployment start block, or additional
environment variable is required. The only prerequisite is a working Polygon
RPC supporting finalized-block reads. No new service, wallet, transaction, or
HSM key is required by these voter-dapp changes.
