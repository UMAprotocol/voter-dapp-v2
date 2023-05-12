import { VotingV2Ethers } from "@uma/contracts-frontend";
import { zeroAddress } from "helpers";

export function getVoterFromDelegate(
  voting: VotingV2Ethers,
  address: string | undefined
) {
  if (!address) return zeroAddress;
  return voting.getVoterFromDelegate(address);
}
