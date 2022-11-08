import { VotingV2Ethers } from "@uma/contracts-frontend";
import { goerliDeployBlock } from "constant";
import { PriceRequestByKeyT, TransactionHashT, UniqueKeyT } from "types";

export async function getVoteTransactionHashes(
  voting: VotingV2Ethers,
  allVotesByKey: PriceRequestByKeyT
) {
  const filter = voting.filters.PriceRequestAdded(null, null, null);
  const events = await voting.queryFilter(filter, goerliDeployBlock);

  const voteTransactionHashesByKey: Record<UniqueKeyT, TransactionHashT> = {};

  for (const [uniqueKey, vote] of Object.entries(allVotesByKey)) {
    // vote number does not exist on the v1 contract so we cannot find the transaction hash
    if (vote.voteNumber === undefined) {
      voteTransactionHashesByKey[uniqueKey] = "v1";
    } else {
      const eventForVote = events.find((event) =>
        event?.args?.priceRequestIndex?.eq(vote.voteNumber ?? NaN)
      );

      voteTransactionHashesByKey[uniqueKey] =
        eventForVote?.transactionHash ?? "rolled";
    }
  }

  return voteTransactionHashesByKey;
}
