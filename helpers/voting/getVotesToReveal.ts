import { VoteExistsByKeyT, VoteT } from "types";

export function getVotesToReveal(
  votes: VoteT[],
  revealedVotes: VoteExistsByKeyT = {}
) {
  return votes.filter(
    (vote) =>
      vote.isCommitted &&
      !!vote.decryptedVote &&
      vote.isRevealed === false &&
      vote.canReveal &&
      !revealedVotes[vote.uniqueKey]
  );
}
