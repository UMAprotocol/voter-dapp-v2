import { VotingV2Ethers__factory } from "@uma/contracts-frontend";
import { utils } from "ethers";
import { zeroAddress } from "helpers";
import { config } from "helpers/config";
import { promiseAllWithConcurrency } from "helpers/util/promiseConcurrency";
import { NextApiRequest, NextApiResponse } from "next";
import * as ss from "superstruct";
import { DelegationEventT } from "types";
import { getProviderByChainId } from "./_common";
import { handleApiError } from "./_utils/errors";
import { validateQueryParams } from "./_utils/validation";

const RequestQuery = ss.object({
  address: ss.refine(ss.string(), "address", (value) =>
    utils.isAddress(value)
  ),
});

export type DelegationRequestsResponse = {
  // requests where `address` is the delegator waiting for their chosen
  // delegate to accept
  sent: DelegationEventT[];
  // requests where `address` is the proposed delegate and has not accepted
  received: DelegationEventT[];
};

/**
 * Pending delegation requests for an address, both directions.
 *
 * Pending state is defined by current contract state (a delegation is
 * effective only when voterStakes[delegator].delegate and
 * delegateToStaker[delegate] agree); the DelegateSet event history is only
 * needed to enumerate inbound candidates — the contract has no reverse index
 * from delegate to requesting delegators — and to attach transaction hashes.
 * That full-history topic-filtered scan is why this lives server-side: the
 * server provider has no block-range cap, while range-capped client
 * providers (e.g. QuickNode) would need hundreds of chunked calls.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DelegationRequestsResponse | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { address: rawAddress } = validateQueryParams(
      req.query,
      RequestQuery
    );
    const address = utils.getAddress(rawAddress);

    const voting = VotingV2Ethers__factory.connect(
      config.votingContractAddress,
      getProviderByChainId(config.chainId)
    );

    const [sentEvents, receivedEvents, ownStake, ownDelegateToStaker] =
      await Promise.all([
        voting.queryFilter(
          voting.filters.DelegateSet(address, null),
          config.deployBlock
        ),
        voting.queryFilter(
          voting.filters.DelegateSet(null, address),
          config.deployBlock
        ),
        voting.voterStakes(address),
        voting.delegateToStaker(address),
      ]);

    const sent: DelegationEventT[] = [];
    const ownDelegate = ownStake.delegate;
    if (ownDelegate !== zeroAddress) {
      const acceptedBy = await voting.delegateToStaker(ownDelegate);
      if (acceptedBy !== address) {
        // newest DelegateSet for the currently-set delegate carries the tx hash
        const requestEvent = [...sentEvents]
          .reverse()
          .find((event) => event.args.delegate === ownDelegate);
        sent.push({
          delegator: address,
          delegate: ownDelegate,
          transactionHash: requestEvent?.transactionHash ?? "",
        });
      }
    }

    // newest event per requesting delegator (events arrive oldest-first)
    const newestByDelegator = new Map<
      string,
      (typeof receivedEvents)[number]
    >();
    receivedEvents.forEach((event) =>
      newestByDelegator.set(event.args.delegator, event)
    );
    const candidates = [...newestByDelegator.values()];
    const candidateStakes = await promiseAllWithConcurrency(
      candidates.map((event) => () => voting.voterStakes(event.args.delegator))
    );
    const received: DelegationEventT[] = candidates
      .filter(
        (event, i) =>
          // the delegator still has us set as their delegate...
          candidateStakes[i].delegate === address &&
          // ...and we have not accepted them
          ownDelegateToStaker !== event.args.delegator
      )
      .map((event) => ({
        delegator: event.args.delegator,
        delegate: event.args.delegate,
        transactionHash: event.transactionHash,
      }));

    res.setHeader(
      "Cache-Control",
      "public, max-age=0, s-maxage=60, stale-while-revalidate=300"
    );
    return res.status(200).json({ sent, received });
  } catch (error) {
    return handleApiError(error, res);
  }
}
