import { RequestAddedEvent } from "@uma/contracts-frontend/dist/typechain/core/ethers/VotingV2";
import { OracleRootTunnel, OracleHub } from "constant/web3/contracts";
import { BytesLike, defaultAbiCoder, keccak256 } from "ethers/lib/utils";
import { getProvider } from "helpers/config";
import { addressEqualSafe } from "helpers/util/misc";
import { decodeHexString } from "helpers/web3/decodeHexString";
import { OracleSpoke__factory } from "types/contracts/OracleSpoke__factory";

// bytes, bytes32, address do NOT have "0x" prefix
// uint are represented as decimal string

export async function resolveAncillaryData({
  requestAddedEvent,
}: {
  requestAddedEvent: RequestAddedEvent;
}): Promise<string> {
  const { requester, ancillaryData, identifier, time } = requestAddedEvent.args;
  const decodedAncillaryData = decodeHexString(ancillaryData);

  if (
    addressEqualSafe(requester, OracleRootTunnel) ||
    addressEqualSafe(requester, OracleHub)
  ) {
    try {
      const { ancillaryDataHash, childOracle, childChainId, childBlockNumber } =
        extractMaybeAncillaryDataFields(decodedAncillaryData);

      // if decoded ancillary data contains these fields, then we must extract from spoke
      if (ancillaryDataHash && childBlockNumber && childOracle) {
        const _childOracle = `0x${childOracle}`;
        const _childChainId = Number(childChainId);
        const _childBlockNumber = Number(childBlockNumber);

        const parentRequestId = keccak256(
          defaultAbiCoder.encode(
            ["bytes32", "uint256", "bytes"],
            [identifier, time, ancillaryData]
          )
        );

        return fetchAncillaryDataFromSpoke({
          parentRequestId,
          childOracle: _childOracle,
          childChainId: _childChainId,
          childBlockNumber: _childBlockNumber,
        });
      }
      return ancillaryData;
    } catch (error) {
      console.error(
        `Unable to resolve original ancillary data for tx ${requestAddedEvent.transactionHash}`,
        {
          at: "resolveAncillaryData()",
          data: requestAddedEvent.args,
          cause: error,
        }
      );

      return ancillaryData;
    }
  }

  return ancillaryData;
}

const AncillaryDataFieldsTypes = {
  // strings
  ancillaryDataHash: "w",
  childOracle: "w",
  childRequester: "w",
  // numbers
  childBlockNumber: "d",
  childChainId: "d",
} as const;

type AncillaryDataField = keyof typeof AncillaryDataFieldsTypes;

export function getAncillaryDataField(
  decodedAncillaryData: string,
  field: AncillaryDataField
): string | undefined {
  const pattern = new RegExp(
    `${field}:(\\${AncillaryDataFieldsTypes[field]}+)`
  );

  const match = decodedAncillaryData.match(pattern) ?? [];

  return match?.[1];
}

function extractMaybeAncillaryDataFields(decodedAncillaryData: string) {
  return {
    ancillaryDataHash: getAncillaryDataField(
      decodedAncillaryData,
      "ancillaryDataHash"
    ),
    childBlockNumber: getAncillaryDataField(
      decodedAncillaryData,
      "childBlockNumber"
    ),
    childOracle: getAncillaryDataField(decodedAncillaryData, "childOracle"),

    childRequester: getAncillaryDataField(
      decodedAncillaryData,
      "childRequester"
    ),
    childChainId: getAncillaryDataField(decodedAncillaryData, "childChainId"),
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
  const OracleSpoke = OracleSpoke__factory.connect(args.childOracle, provider);
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
    args.childBlockNumber + 1
  );

  if (!events.length) {
    throw new Error(
      `Unable to find event with request Id: ${String(
        args.parentRequestId
      )} on chain ${args.childChainId}`
    );
  }

  return events[0].args.ancillaryData;
}
