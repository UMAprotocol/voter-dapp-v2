import { BigNumber } from "ethers";

export function makeUniqueKeyForVote(identifier: string, time: number | BigNumber, ancillaryData: string) {
  if (typeof time !== "number") {
    time = time.toNumber();
  }
  return `${identifier}-${time}-${ancillaryData}`;
}

export function makeUniqueKeysForVotes<
  VoteType extends { identifier: string; time: number | BigNumber; ancillaryData: string }
>(votes: VoteType[] | undefined) {
  if (!votes) {
    return [];
  }
  return votes.map((vote) => makeUniqueKeyForVote(vote.identifier, vote.time, vote.ancillaryData));
}
