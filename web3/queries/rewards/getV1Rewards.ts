import { BigNumber } from "ethers";
import { MainnetOrGoerli } from "types";

export async function getV1Rewards(address: string, chainId: MainnetOrGoerli) {
  console.log("getV1Rewards", address, chainId);
  const response = await fetch("/api/past-rewards", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address, chainId }),
  });

  if (!response.ok) {
    throw new Error("Error fetching past rewards");
  }

  const { multicallPayload, totalRewards } = (await response.json()) as {
    multicallPayload: string[];
    totalRewards: string;
  };

  return {
    multicallPayload,
    totalRewards: BigNumber.from(totalRewards),
  };
}
