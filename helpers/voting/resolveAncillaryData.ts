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

// bytes, bytes32, address do NOT have "0x" prefix
// uint are represented as decimal string

const abi = [
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

export async function resolveAncillaryDataForRequests<
  T extends Parameters<typeof resolveAncillaryData>[0]
>(requests: T[]): Promise<T[]> {
  const resolvedAncillaryData = await Promise.all(
    requests.map((request) => resolveAncillaryData(request))
  );
  return requests.map((request, i) => ({
    ...request,
    ancillaryDataL1: request.ancillaryData,
    ancillaryData: resolvedAncillaryData[i],
  }));
}

export async function resolveAncillaryData(
  args: Pick<RequestAddedEvent["args"], "ancillaryData" | "time" | "identifier">
): Promise<string> {
  const decodedAncillaryData = decodeHexString(args.ancillaryData);
  const { ancillaryDataHash, childOracle, childChainId, childBlockNumber } =
    extractMaybeAncillaryDataFields(decodedAncillaryData);

  if (ancillaryDataHash && childOracle && childChainId && childBlockNumber) {
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

      return mergeAncillaryData(
        decodedAncillaryData,
        decodeHexString(resolved)
      );
    } catch (error) {
      console.error("Unable to resolve original ancillary data", {
        at: "resolveAncillaryData()",
        data: args,
        cause: error,
      });

      return args.ancillaryData;
    }
  }

  return args.ancillaryData;
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

async function fetchAncillaryDataFromSpoke(args: {
  parentRequestId: BytesLike;
  childOracle: string;
  childChainId: number;
  childBlockNumber: number;
}): Promise<string> {
  const provider = getProvider(args.childChainId);
  // TODO: install from upgraded @uma/contracts-frontend pkg
  const OracleSpoke = new Contract(
    args.childOracle,
    new Interface(abi),
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
