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

// Nodes cap a gas estimate at what the sender's ETH covers at maxFeePerGas, so
// a wallet short of ETH fails with e.g. "gas required exceeds allowance", which
// ethers reports as "cannot estimate gas". If sending fails, estimate again
// without fees and check the balance so the error can say what's wrong.
export async function sendWithGasCheck<T>({
  signer,
  gasOverrides: { maxFeePerGas },
  estimateGas,
  send,
}: {
  signer: ethers.Signer;
  gasOverrides: { maxFeePerGas?: string };
  estimateGas: () => Promise<ethers.BigNumber>;
  send: () => Promise<T>;
}) {
  try {
    return await send();
  } catch (error) {
    if (!maxFeePerGas) throw error;

    const gasCost = await Promise.all([
      estimateGas(),
      signer.getBalance(),
    ]).then(
      ([gas, balance]) => {
        const cost = gas.mul(maxFeePerGas);
        return balance.lt(cost) ? cost : undefined;
      },
      // e.g. the call reverts, so ETH isn't the problem
      () => undefined
    );
    if (gasCost) throw new Error(insufficientEthForGasMessage(gasCost));
    throw error;
  }
}

export function insufficientEthForGasMessage(gasCost: ethers.BigNumber) {
  // Round up so the shown cost is never below what the wallet needs.
  const eth = Number(ethers.utils.formatEther(gasCost)).toLocaleString(
    "en-US",
    { maximumSignificantDigits: 2, roundingMode: "ceil" }
  );
  return `Connected wallet does not have enough ETH for gas; estimated gas cost = ${eth} ETH.`;
}
