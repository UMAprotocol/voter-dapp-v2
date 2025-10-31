import { RequestAddedEvent } from "@uma/contracts-frontend/dist/typechain/core/ethers/VotingV2";
import { Contract } from "ethers";
import {
  BytesLike,
  defaultAbiCoder,
  Interface,
  keccak256,
} from "ethers/lib/utils";
import { getProvider } from "helpers/config";
import { decodeHexString, encodeHexString } from "helpers/web3/decodeHexString";

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

function extractMaybeAncillaryDataFields(decodedAncillaryData: string) {
  const pattern = new RegExp(
    "^" +
      "ancillaryDataHash:(\\w+),\\s*" +
      "childBlockNumber:(\\d+),\\s*" +
      "childOracle:(\\w+),\\s*" +
      "childRequester:(\\w+),\\s*" +
      "childChainId:(\\d+)" +
      "$"
  );

  const match = decodedAncillaryData.match(pattern);
  if (!match) return {};

  return {
    ancillaryDataHash: match[1],
    childBlockNumber: match[2],
    childOracle: match[3],
    childRequester: match[4],
    childChainId: match[5],
  };
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

async function fetchAncillaryDataFromSpoke(args: {
  parentRequestId: BytesLike;
  childOracle: string;
  childChainId: number;
  childBlockNumber: number;
}): Promise<string> {
  const provider = getProvider(args.childChainId);
  const OracleSpoke = new Contract(
    args.childOracle,
    new Interface(PRICE_REQUEST_BRIDGED_ABI),
    provider
  );

  const filter = OracleSpoke.filters.PriceRequestBridged(
    null,
    null,
    null,
    null,
    null,
    args.parentRequestId
  );

  const events = await OracleSpoke.queryFilter(
    filter,
    args.childBlockNumber - 1,
    args.childBlockNumber
  );

  if (!events.length) {
    throw new Error(
      `Unable to find event with request Id: ${String(
        args.parentRequestId
      )} on chain ${args.childChainId}`
    );
  }

  return events[0]?.args?.ancillaryData as string;
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
