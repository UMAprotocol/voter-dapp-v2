import { OptimisticOracleV3InterfaceEthers } from "@uma/contracts-frontend";
import { getInstance } from "web3/contracts/createOOV3ContractInstances";
import {
  rangeStart,
  rangeSuccessDescending,
  rangeFailureDescending,
} from "helpers";

export async function getAssertionMadeEvents(
  instance: OptimisticOracleV3InterfaceEthers,
  assertionId: string
) {
  const currentBlock = await instance.provider.getBlockNumber();
  const filter = instance.filters.AssertionMade(assertionId);

  let state = rangeStart({
    startBlock: currentBlock - 100000000,
    endBlock: currentBlock,
    multiplier: 2,
  });

  let allEvents;
  while (!state.done) {
    try {
      const events = await instance.queryFilter(
        filter,
        state.currentStart,
        state.currentEnd
      );
      if (!allEvents) {
        allEvents = events;
      } else {
        allEvents = allEvents.concat(events);
      }
      state = rangeSuccessDescending(state);
    } catch (error) {
      state = rangeFailureDescending(state);
    }
  }
  allEvents = allEvents || [];

  return allEvents;
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
