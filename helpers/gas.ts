import { ethers, BigNumber } from "ethers";

const MIN_PRIORITY_FEE = ethers.utils.parseUnits("0.001", "gwei");

export async function getVotingGasOverrides(
  provider: ethers.providers.Provider
): Promise<{ maxPriorityFeePerGas: BigNumber }> {
  const feeData = await provider.getFeeData();

  const baseFee = feeData.lastBaseFeePerGas;
  const networkPriorityFee = feeData.maxPriorityFeePerGas;

  if (!baseFee) {
    return {
      maxPriorityFeePerGas: networkPriorityFee ?? MIN_PRIORITY_FEE,
    };
  }

  const calculatedCap = baseFee.div(1000);
  const cappedPriorityFee = calculatedCap.lt(MIN_PRIORITY_FEE)
    ? MIN_PRIORITY_FEE
    : calculatedCap;

  if (networkPriorityFee && networkPriorityFee.lt(cappedPriorityFee)) {
    return { maxPriorityFeePerGas: networkPriorityFee };
  }

  return { maxPriorityFeePerGas: cappedPriorityFee };
}
