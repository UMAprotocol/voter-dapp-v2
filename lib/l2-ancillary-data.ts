import { RequestAddedEvent } from "@uma/contracts-frontend/dist/typechain/core/ethers/VotingV2";
import { Contract } from "ethers";
import {
  BytesLike,
  defaultAbiCoder,
  hexlify,
  Interface,
  keccak256,
} from "ethers/lib/utils";
import { getProvider } from "helpers/config";
import { decodeHexString, encodeHexString } from "helpers/web3/decodeHexString";
// moved to lib/deeplink-matching so pure consumers can import it without the
// provider config this module needs; re-exported for existing callers
import { extractMaybeAncillaryDataFields } from "lib/deeplink-matching";
export { extractMaybeAncillaryDataFields };

// ABI for OracleSpoke contract events
export const PRICE_REQUEST_BRIDGED_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "requester",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "identifier",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "time",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "ancillaryData",
        type: "bytes",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "childRequestId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "parentRequestId",
        type: "bytes32",
      },
    ],
    name: "PriceRequestBridged",
    type: "event",
  },
];

export interface ResolveAncillaryDataRequest {
  identifier: string;
  time: string;
  ancillaryData: string;
}

export interface ResolveAncillaryDataResult {
  resolvedAncillaryData: string;
}

function mergeAncillaryData(
  decodedL1Data: string,
  decodedL2Data: string
): string {
  const pattern =
    /^ancillaryDataHash:\w+,childBlockNumber:\d+,childOracle:\w+,/;
  const merged = decodedL1Data.replace(pattern, `${decodedL2Data},`);
  return encodeHexString(merged);
}

// All PriceRequestBridged events an oracle spoke emitted at a given block.
// Unfiltered on purpose: requests bridged in the same batch share (chain,
// oracle, block), so one fetch serves every one of them — callers matching
// several candidates memoize on exactly these arguments.
export async function fetchBridgedEventsAt(args: {
  childOracle: string;
  childChainId: number;
  childBlockNumber: number;
}) {
  const provider = getProvider(args.childChainId);
  const OracleSpoke = new Contract(
    args.childOracle,
    new Interface(PRICE_REQUEST_BRIDGED_ABI),
    provider
  );

  return OracleSpoke.queryFilter(
    OracleSpoke.filters.PriceRequestBridged(),
    args.childBlockNumber - 1,
    args.childBlockNumber
  );
}

export async function fetchAncillaryDataFromSpoke(args: {
  parentRequestId: BytesLike;
  childOracle: string;
  childChainId: number;
  childBlockNumber: number;
}): Promise<string> {
  const parentRequestId = hexlify(args.parentRequestId).toLowerCase();
  const events = await fetchBridgedEventsAt(args);
  const event = events.find(
    (e) =>
      (e.args?.parentRequestId as string | undefined)?.toLowerCase() ===
      parentRequestId
  );

  if (!event) {
    throw new Error(
      `Unable to find event with request Id: ${parentRequestId} on chain ${args.childChainId}`
    );
  }

  return event.args?.ancillaryData as string;
}

export function createRequestHash(
  request: ResolveAncillaryDataRequest
): string {
  return keccak256(
    defaultAbiCoder.encode(
      ["bytes32", "uint256", "bytes"],
      [request.identifier, request.time, request.ancillaryData]
    )
  );
}

export async function resolveAncillaryData(
  args: Pick<RequestAddedEvent["args"], "ancillaryData" | "time" | "identifier">
): Promise<ResolveAncillaryDataResult> {
  const decodedAncillaryData = decodeHexString(args.ancillaryData);
  const { ancillaryDataHash, childOracle, childChainId, childBlockNumber } =
    extractMaybeAncillaryDataFields(decodedAncillaryData);

  // If not all L2 fields are present, this is not an L2 ancillary data
  // Return the original ancillary data unchanged
  if (
    !ancillaryDataHash ||
    !childOracle ||
    !childChainId ||
    !childBlockNumber
  ) {
    return {
      resolvedAncillaryData: args.ancillaryData,
    };
  }

  try {
    // if decoded ancillary data contains these fields, then we must extract from spoke
    const _childOracle = `0x${childOracle}`;
    const _childChainId = Number(childChainId);
    const _childBlockNumber = Number(childBlockNumber);

    const parentRequestId = keccak256(
      defaultAbiCoder.encode(
        ["bytes32", "uint256", "bytes"],
        [args.identifier, args.time, args.ancillaryData]
      )
    );

    const resolved = await fetchAncillaryDataFromSpoke({
      parentRequestId,
      childOracle: _childOracle,
      childChainId: _childChainId,
      childBlockNumber: _childBlockNumber,
    });

    const resolvedAncillaryData = mergeAncillaryData(
      decodedAncillaryData,
      decodeHexString(resolved)
    );

    return {
      resolvedAncillaryData,
    };
  } catch (error) {
    console.error("Unable to resolve original ancillary data", {
      at: "resolveAncillaryData()",
      data: args,
      cause: error,
    });

    // If L2 resolution fails, return the original ancillary data as fallback
    return {
      resolvedAncillaryData: args.ancillaryData,
    };
  }
}
