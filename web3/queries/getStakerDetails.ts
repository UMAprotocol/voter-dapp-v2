import { VotingV2Ethers } from "@uma/contracts-frontend";

export default function getStakerDetails(votingContract: VotingV2Ethers, address: string | undefined) {
  if (!address) return undefined;
  return votingContract.voterStakes(address);
}
