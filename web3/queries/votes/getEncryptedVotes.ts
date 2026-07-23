import { VotingEthers, VotingV2Ethers } from "@uma/contracts-frontend";
import { voteEventsBlockLookback } from "constant";
import { decodeHexString, makeUniqueKeyForVote } from "helpers";
import { queryFilterInChunks } from "helpers/web3/queryFilterInChunks";
import { EncryptedVotesByKeyT } from "types";

export async function getEncryptedVotes(
  votingContract: VotingV2Ethers,
  votingV1Contract: VotingEthers,
  address: string | undefined,
  findRoundId?: number
) {
  if (!address) return {};

  const currentBlock = await votingContract.provider.getBlockNumber();
  const v2Filter = votingContract.filters.EncryptedVote(address, findRoundId);
  const v2Result = await queryFilterInChunks(
    votingContract,
    v2Filter,
    currentBlock - voteEventsBlockLookback,
    currentBlock
  );

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
