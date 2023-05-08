import { VotingTokenEthers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";

import { config } from "helpers/config";
const { votingContractAddress } = config;

export async function getTokenAllowance(
  votingTokenContract: VotingTokenEthers | undefined,
  address: string | undefined
) {
  if (!address || !votingTokenContract) return BigNumber.from(0);
  const result = await votingTokenContract.functions.allowance(
    address,
    votingContractAddress
  );
  return result?.[0];
}
