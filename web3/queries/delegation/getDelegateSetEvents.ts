import { VotingV2Ethers } from "@uma/contracts-frontend";
import { onlyOneRequestPerAddress, zeroAddress } from "helpers";
import { config } from "helpers/config";
import { promiseAllWithConcurrency } from "helpers/util/promiseConcurrency";
import { getStakerDetails } from "../staking/getStakerDetails";

export async function getDelegateSetEvents(
  voting: VotingV2Ethers,
  address: string | undefined,
  queryFor: "delegate" | "delegator"
) {
  if (!address) return [];
  const args = queryFor === "delegate" ? [null, address] : [address, null];
  const filter = voting.filters.DelegateSet(...args);
  // events can't precede the contract, so don't ask the RPC to scan from genesis
  const events = await voting.queryFilter(filter, config.deployBlock);
  const parsedEvents = events
    .map((event) => ({
      delegate: event.args.delegate,
      delegator: event.args.delegator,
      transactionHash: event.transactionHash,
    }))
    .filter(({ delegate }) => delegate !== zeroAddress);

  // this onlyOne function returns the oldest event by default if collisions happen, so we reverse the list
  // to run newest requests first, ensuring we get the latest event.  previously this was not reversed
  // causing issues with accounts that are attempting to delegate to a new delegator
  const onlyOne = onlyOneRequestPerAddress(parsedEvents.reverse(), queryFor);
  return removeDanglingDelegateEvents(voting, onlyOne);
}

async function removeDanglingDelegateEvents(
  voting: VotingV2Ethers,
  events: {
    delegate: string;
    delegator: string;
    transactionHash: string;
  }[]
) {
  // one voterStakes read per event — run them concurrently instead of serially
  const stillWanted = await promiseAllWithConcurrency(
    events.map((event) => () => detectDanglingDelegate(voting, event.delegator))
  );
  return events.filter((_, i) => stillWanted[i]);
}

async function detectDanglingDelegate(
  voting: VotingV2Ethers,
  delegator: string
) {
  const { delegate } = await getStakerDetails(voting, delegator);
  if (delegate === zeroAddress) return false;
  return true;
}
