import { MainnetOrGoerli } from "types";

export async function getV1RewardsMulticallPayloads(
  address: string,
  chainId: MainnetOrGoerli
) {
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

  const result = (await response.json()) as string[];

  return result;
}
