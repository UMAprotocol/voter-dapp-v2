import { VotingV2Ethers } from "@uma/contracts-frontend";
import { goerliDeployBlock } from "constant/web3/deployBlocks";
import { PriceRequestByKeyT, UniqueKeyT } from "types";

export async function getVoteTransactionHashes(voting: VotingV2Ethers, allVotesByKey: PriceRequestByKeyT) {
  const filter = voting.filters.PriceRequestAdded(null, null, null);
  const events = await voting.queryFilter(filter, goerliDeployBlock);

  const voteTransactionHashesByKey: Record<UniqueKeyT, string> = {};

  for (const [uniqueKey, vote] of Object.entries(allVotesByKey)) {
    const eventForVote = events.find((event) => event?.args?.priceRequestIndex?.eq(vote.voteNumber));
    const transactionHash = eventForVote?.transactionHash || "rolled";

    voteTransactionHashesByKey[uniqueKey] = transactionHash;
  }

  return voteTransactionHashesByKey;
}
