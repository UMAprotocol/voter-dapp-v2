import { VotingEthers, VotingV2Ethers } from "@uma/contracts-frontend";
import { decodeHexString, makeUniqueKeyForVote } from "helpers";
import { EncryptedVotesByKeyT } from "types";

export async function getEncryptedVotes(
  votingContract: VotingV2Ethers,
  votingV1Contract: VotingEthers,
  address: string | undefined,
  findRoundId?: number
) {
  if (!address) return {};

  const v2Filter = votingContract.filters.EncryptedVote(address);
  const v2Result = await votingContract.queryFilter(v2Filter);

  const v2EventData = v2Result
    ?.map(({ args }) => args)
    .filter(({ roundId }) => (findRoundId ? roundId === findRoundId : true));

  const encryptedVotes: EncryptedVotesByKeyT = {};

  v2EventData?.forEach(({ encryptedVote, identifier, time, ancillaryData }) => {
    const decodedIdentifier = decodeHexString(identifier);
    encryptedVotes[
      makeUniqueKeyForVote(decodedIdentifier, time, ancillaryData)
    ] = encryptedVote;
  });

  return encryptedVotes;
}
