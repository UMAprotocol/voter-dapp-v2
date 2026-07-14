import { BigNumber } from "ethers";
import { ResolvedVoteRequestT } from "helpers/util/deeplink";
import { VoteT } from "types";
import { getVoteMetaData } from "./getVoteMetaData";
import { formatPriceRequest } from "./makePriceRequestsByKey";

// A renderable vote built from the deeplink resolver's entity alone — what a
// logged-out user sees. The deeplink handler opens the panel with this while
// the app's vote lists are still loading, then swaps in the canonical vote
// (prev/next arrows, user data, contentful) once they arrive. Same pipeline
// helpers as the lists use, so the provisional and final renders agree.
//
// uniqueKey comes from the resolver (it IS the subgraph id), not from
// re-deriving it locally: an identifier that doesn't round-trip through the
// hex encoding would otherwise yield a key that never matches the URL's.
export function makeProvisionalVote(
  request: ResolvedVoteRequestT,
  uniqueKey: string
): VoteT {
  const priceRequest = formatPriceRequest(request);
  return {
    ...priceRequest,
    ...getVoteMetaData(
      priceRequest.decodedIdentifier,
      priceRequest.decodedAncillaryData,
      undefined
    ),
    uniqueKey,
    isCommitted: undefined,
    commitHash: undefined,
    isRevealed: undefined,
    revealHash: undefined,
    canReveal: undefined,
    encryptedVote: undefined,
    decryptedVote: undefined,
    contentfulData: undefined,
    decodedAdminTransactions: undefined,
    voteHistory: {
      uniqueKey,
      voted: false,
      correctness: false,
      staking: false,
      slashAmount: BigNumber.from(0),
    },
  };
}
