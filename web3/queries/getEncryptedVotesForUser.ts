import { VotingV2Ethers } from "@uma/contracts-frontend";
import { makeUniqueKeyForVote } from "helpers/votes";
import { EncryptedVotesByKeyT } from "types/global";

export default async function getEncryptedVotesForUser(
  votingContract: VotingV2Ethers,
  address: string,
  roundId: number
) {
  if (!address) return {};

  const filter = votingContract.filters.EncryptedVote(address, roundId, null, null, null, null);
  const result = await votingContract.queryFilter(filter);

  const eventData = result?.map(({ args }) => args);
  const encryptedVotes: EncryptedVotesByKeyT = {};
  eventData?.forEach(({ encryptedVote, identifier, time, ancillaryData }) => {
    encryptedVotes[makeUniqueKeyForVote(identifier, time, ancillaryData)] = encryptedVote;
  });

  return encryptedVotes;
}
