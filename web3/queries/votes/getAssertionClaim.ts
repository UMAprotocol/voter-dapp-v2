import { OptimisticOracleV3InterfaceEthers } from "@uma/contracts-frontend";
import { getInstance } from "web3/contracts/createOOV3ContractInstances";

export async function getAssertionMadeEvents(
  instance: OptimisticOracleV3InterfaceEthers,
  assertionId: string
) {
  const filter = instance.filters.AssertionMade(assertionId);
  const currentBlock = await instance.provider.getBlockNumber();
  return instance.queryFilter(filter, currentBlock - 10000);
}

export async function getAssertionClaim(
  chainId: number | undefined,
  assertionId: string | undefined
) {
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
