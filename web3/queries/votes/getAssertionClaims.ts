import { OptimisticOracleV3Interface } from "@uma/contracts-frontend/dist/typechain/core/ethers";

export async function getAssertionMadeEvents(
  instance: OptimisticOracleV3Interface,
  assertionId: string
) {
  const filter = instance.filters.AssertionMade(assertionId);
  return instance.queryFilter(filter);
}

export async function getAssertionClaim(
  instance: OptimisticOracleV3Interface,
  assertionId: string
) {
  const events = await getAssertionMadeEvents(instance, assertionId);
  if (events.length === 0)
    throw new Error(`Unable to find assertion claim for: ${assertionId}`);
  if (events.length > 1)
    throw new Error(`Multiple assertion claims for: ${assertionId}`);
  const [event] = events;
  return event.args?.claim;
}
