import { OptimisticOracleV3Interface } from "@uma/contracts-frontend/dist/typechain/core/ethers";
import { createOOV3ContractInstances } from "web3/contracts/createOOV3ContractInstances";

export async function getAssertionClaims() {
  const oov3ContractInstances = createOOV3ContractInstances();

  const assertionClaims = await Promise.all(
    oov3ContractInstances.map(async ({ chainId, instance }) => {
      const result = await getAssertionMadeEventsForContract(instance, chainId);
      return result;
    })
  );

  return assertionClaims;
}

async function getAssertionMadeEventsForContract(
  instance: OptimisticOracleV3Interface,
  chainId: number
) {
  const filter = instance.filters.AssertionMade();
  const result = await instance.queryFilter(filter);
  return result?.map(({ args: { assertionId, claim } }) => ({
    assertionId,
    claim,
    chainId,
  }));
}
