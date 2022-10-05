import { VotingV2Ethers } from "@uma/contracts-frontend";
import { decodeHexString, makeUniqueKeyForVote } from "helpers";
import { EncryptedVotesByKeyT } from "types";

export default async function getEncryptedVotes(votingContract: VotingV2Ethers, address: string, roundId: number) {
  const filter = votingContract.filters.EncryptedVote(address, roundId, null, null, null, null);
  const result = await votingContract.queryFilter(filter);

  const eventData = result?.map(({ args }) => args);
  const encryptedVotes: EncryptedVotesByKeyT = {};
  eventData?.forEach(({ encryptedVote, identifier, time, ancillaryData }) => {
    const decodedIdentifier = decodeHexString(identifier);
    encryptedVotes[makeUniqueKeyForVote(decodedIdentifier, time, ancillaryData)] = encryptedVote;
  });

  return encryptedVotes;
}
