import { VotingV2Ethers } from "@uma/contracts-frontend";
import { onlyOneRequestPerAddress, zeroAddress } from "helpers";
import { getStakerDetails } from "../staking/getStakerDetails";

export async function getDelegateSetEvents(
  voting: VotingV2Ethers,
  address: string | undefined,
  queryFor: "delegate" | "delegator"
) {
  if (!address) return [];
  const args = queryFor === "delegate" ? [null, address] : [address, null];
  const filter = voting.filters.DelegateSet(...args);
  const events = await voting.queryFilter(filter);
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
  const result = [];
  for (const event of events) {
    const stillWantToBeDelegator = await detectDanglingDelegate(
      voting,
      event.delegator
    );
    if (stillWantToBeDelegator) result.push(event);
  }
  return result;
}

async function detectDanglingDelegate(
  voting: VotingV2Ethers,
  delegator: string
) {
  const { delegate } = await getStakerDetails(voting, delegator);
  if (delegate === zeroAddress) return false;
  return true;
}
