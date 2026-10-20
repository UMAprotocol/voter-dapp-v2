import { BigNumber } from "ethers";
import { SelectedVotesByKeyT, VoteT } from "types";
import { parseVoteStringWithPrecision } from "./formatVotes";

export function getVotesToCommit(
  votes: VoteT[],
  selectedVotes: SelectedVotesByKeyT,
  confirmedPrices: Record<string, string> = {}
) {
  return votes.filter((vote) => {
    const selectedVote = selectedVotes[vote.uniqueKey];
    if (!selectedVote) return false;

    const committedPrice =
      confirmedPrices[vote.uniqueKey] ??
      (vote.isCommitted && vote.canReveal
        ? vote.decryptedVote?.price
        : undefined);
    if (committedPrice === undefined) return true;

    try {
      const selectedPrice = parseVoteStringWithPrecision(
        selectedVote,
        vote.decodedIdentifier
      );
      return !BigNumber.from(committedPrice).eq(selectedPrice);
    } catch {
      // Leave invalid input to the existing commit validation path.
      return true;
    }
  });
}
