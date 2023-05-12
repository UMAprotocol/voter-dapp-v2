import { VotingEthers, VotingV2Ethers } from "@uma/contracts-frontend";
import { decodeHexString, makeUniqueKeyForVote } from "helpers";
import { EncryptedVotesByKeyT } from "types";

export async function getEncryptedVotes(
  votingContract: VotingV2Ethers,
  votingV1Contract: VotingEthers,
  address: string | undefined,
  findRoundId?: number
) {
  const v1Filter = votingV1Contract.filters.EncryptedVote(address);
  const v1Result = await votingV1Contract.queryFilter(v1Filter);

  const v2Filter = votingContract.filters.EncryptedVote(address);
  const v2Result = await votingContract.queryFilter(v2Filter);

  const v1EventData = v1Result?.map(({ args }) => args);
  const v2EventData = v2Result
    ?.map(({ args }) => args)
    .filter(({ roundId }) => (findRoundId ? roundId === findRoundId : true));

  const encryptedVotes: EncryptedVotesByKeyT = {};
  // disable v1 events if a round id is specified, this means we are only looking for current rounds
  if (findRoundId === undefined) {
    v1EventData?.forEach(
      ({ encryptedVote, identifier, time, ancillaryData }) => {
        const decodedIdentifier = decodeHexString(identifier);
        encryptedVotes[
          makeUniqueKeyForVote(decodedIdentifier, time, ancillaryData)
        ] = encryptedVote;
      }
    );
  }
  v2EventData?.forEach(({ encryptedVote, identifier, time, ancillaryData }) => {
    const decodedIdentifier = decodeHexString(identifier);
    encryptedVotes[
      makeUniqueKeyForVote(decodedIdentifier, time, ancillaryData)
    ] = encryptedVote;
  });

  return encryptedVotes;
}
