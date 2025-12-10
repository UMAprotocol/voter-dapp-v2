import { ethers } from "ethers";

export async function getGasFeeOverrides(provider: ethers.providers.Provider) {
  const [block, feeData] = await Promise.all([
    provider.getBlock("latest"),
    provider.getFeeData(),
  ]);

  const baseFee = block?.baseFeePerGas || feeData.lastBaseFeePerGas;

  if (!baseFee) {
    return {};
  }

  const maxPriorityFeePerGas = ethers.utils.parseUnits("0.001", "gwei"); // low, non-zero tip
  const maxFeePerGas = baseFee.mul(150).div(100).add(maxPriorityFeePerGas); // moderate 50% buffer on base fee

  const gasOverrides = {
    maxFeePerGas: maxFeePerGas?.toString(),
    maxPriorityFeePerGas: maxPriorityFeePerGas?.toString(),
  };

  return gasOverrides;
}
