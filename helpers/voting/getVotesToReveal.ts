import { VoteT } from "types";

export function getVotesToReveal(votes: VoteT[], batchSize?: number) {
  return votes
    .filter(
      (vote) =>
        vote.isCommitted &&
        !!vote.decryptedVote &&
        vote.isRevealed === false &&
        vote.canReveal
    )
    .slice(0, batchSize);
}
