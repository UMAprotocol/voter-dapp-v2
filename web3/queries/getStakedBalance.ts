import { VotingV2Ethers } from "@uma/contracts-frontend";

export default async function getStakedBalance(votingContract: VotingV2Ethers, address: string) {
  const result = await votingContract.functions.getVoterStake(address);
  return result?.[0];
}
