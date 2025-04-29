import { OptimisticOracleV3InterfaceEthers } from "@uma/contracts-frontend";
import { getInstance } from "web3/contracts/createOOV3ContractInstances";

export async function getAssertionMadeEvents(
  instance: OptimisticOracleV3InterfaceEthers,
  assertionId: string
) {
  const currentBlock = await instance.provider.getBlockNumber();
  const filter = instance.filters.AssertionMade(assertionId);
  return instance.queryFilter(filter, currentBlock - 1000000);
}

export async function getAssertionClaim(
  chainId: number | undefined,
  assertionId: string | undefined
) {
  console.log("getclaim", { chainId, assertionId });
  if (!chainId || !assertionId) return undefined;
  const instance = getInstance(chainId);
  const events = await getAssertionMadeEvents(instance, assertionId);
  if (events.length === 0)
    throw new Error(`Unable to find assertion claim for: ${assertionId}`);
  if (events.length > 1)
    throw new Error(`Multiple assertion claims for: ${assertionId}`);
  const [event] = events;
  return event.args?.claim;
}
