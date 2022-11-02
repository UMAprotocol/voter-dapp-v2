import { BigNumber } from "ethers";
import { DecryptedVoteT, EncryptedVoteT, VoteHistoryByKeyT } from "types";

export type UserDataT = {
  apr: BigNumber;
  countReveals: BigNumber;
  countNoVotes: BigNumber;
  countWrongVotes: BigNumber;
  countCorrectVotes: BigNumber;
  cumulativeCalculatedSlash: BigNumber;
  cumulativeCalculatedSlashPercentage: BigNumber;
  voteHistoryByKey: VoteHistoryByKeyT;
};

export type UserVoteDataT = {
  isCommitted: boolean;
  isRevealed: boolean;
  encryptedVote: EncryptedVoteT | undefined;
  decryptedVote: DecryptedVoteT | undefined;
};
