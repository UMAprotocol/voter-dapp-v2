import { earlyRequestMagicNumber } from "constant";
import { DropdownItemT } from "types";
import chunk from "lodash/chunk";

const polymarketChainId = 137;

// hard coded known poly addresses:
// https://github.com/UMAprotocol/protocol/blob/master/packages/monitor-v2/src/monitor-polymarket/common.ts#L474
const polymarketBinaryAdapterAddress =
  "0xCB1822859cEF82Cd2Eb4E6276C7916e692995130";
const polymarketCtfAdapterAddress =
  "0x6A9D222616C90FcA5754cd1333cFD9b7fb6a4F74";
const polymarketCtfAdapterAddressV2 =
  "0x2f5e3684cb1f318ec51b00edba38d79ac2c0aa9d";
const polymarketCtfExchangeAddress =
  "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E";
export const polymarketRequesters = [
  polymarketBinaryAdapterAddress.toLowerCase(),
  polymarketCtfAdapterAddress.toLowerCase(),
  polymarketCtfAdapterAddressV2.toLowerCase(),
  polymarketCtfExchangeAddress.toLowerCase(),
];

export function isPolymarketRequester(address: string): boolean {
  return polymarketRequesters.includes(address.toLowerCase());
}

export function getRequester(decodedAncillaryData: string): string | undefined {
  const match = decodedAncillaryData.match(/ooRequester:(\w+)/) ?? [];
  return match[1] ? "0x" + match[1] : undefined;
}
export function getChildChainId(
  decodedAncillaryData: string
): number | undefined {
  const match = decodedAncillaryData.match(/childChainId:(\d+)/) ?? [];
  return match[1] ? Number(match[1]) : undefined;
}
export function checkIfIsPolymarket(
  decodedIdentifier: string,
  decodedAncillaryData: string
) {
  const queryTitleToken = "q: title:";
  const resultDataToken = "res_data:";
  const requester = getRequester(decodedAncillaryData);
  const childChainId = getChildChainId(decodedAncillaryData);
  const isPolymarket =
    decodedIdentifier === "YES_OR_NO_QUERY" &&
    decodedAncillaryData.includes(queryTitleToken) &&
    decodedAncillaryData.includes(resultDataToken) &&
    requester &&
    isPolymarketRequester(requester) &&
    childChainId === polymarketChainId;

  return Boolean(isPolymarket);
}

// this will only work when there are exactly 3 or more options, which should match most polymarket requests
// it will only parse 3 options, omitting p4, which is assumed to be "too early".
function dynamicPolymarketOptions(
  decodedAncillaryData: string
): DropdownItemT[] {
  const resData = decodedAncillaryData.match(
    /res_data: (p\d): (\d+\.\d+|\d+), (p\d): (\d+\.\d+|\d+), (p\d): (\d+\.\d+|\d+)/
  );
  // Match any character except commas that are followed by a space, we use ", " as a delimiter. This way we can allow a string like "$2,000" to be matched.
  const correspondence = decodedAncillaryData.match(
    /Where (p\d) corresponds to ((?:[^,]|,(?!\s))+), (p\d) to ((?:[^,]|,(?!\s))+), (p\d) to ([^.,]+)/
  );

  if (!resData || !correspondence) return [];

  const cleanCorrespondence = correspondence.map((data) => {
    if (data.toLowerCase().includes("a no")) {
      return "No";
    }
    return data.trim();
  });

  const correspondenceTable = Object.fromEntries(
    chunk(cleanCorrespondence.slice(1), 2)
  ) as Record<string, string>;
  const resDataTable = Object.fromEntries(chunk(resData.slice(1), 2)) as Record<
    string,
    string
  >;

  return Object.keys(resDataTable)
    .filter((pValue) => correspondenceTable[pValue] && resDataTable[pValue])
    .map((pValue) => {
      return {
        label: correspondenceTable[pValue],
        value: resDataTable[pValue],
        secondaryLabel: pValue,
      };
    });
}
/** Polymarket yes or no queries follow a semi-predictable pattern.
 * If both the res data and the correspondence to the res data are present,
 * we can use the res data to make the options for the vote.
 *
 * The res data always has options for "yes", "no", and "unknown", and it sometimes has an option for "early request as well".
 */
export function maybeMakePolymarketOptions(
  decodedAncillaryData: string
): DropdownItemT[] | undefined {
  // go from most specific to least specific
  const options1 = {
    resData: `res_data: p1: 0, p2: 1, p3: 0.5, p4: ${earlyRequestMagicNumber}`,
    corresponds:
      "Where p1 corresponds to No, p2 to a Yes, p3 to unknown, and p4 to an early request",
  };

  const options2 = {
    resData: "res_data: p1: 0, p2: 1, p3: 0.5",
    corresponds: "Where p2 corresponds to Yes, p1 to a No, p3 to unknown",
  };

  // this does not follow yes_no price identifier, its due to polymarket requesting this for "neg risk" markets
  const options3 = {
    resData: "res_data: p1: 0, p2: 1.",
    corresponds: "Where p1 corresponds to No, p2 to Yes.",
  };

  const dynamicOptions = dynamicPolymarketOptions(decodedAncillaryData);

  if (
    decodedAncillaryData.includes(options1.resData) &&
    decodedAncillaryData.includes(options1.corresponds)
  ) {
    return [
      {
        label: "No",
        value: "0",
        secondaryLabel: "p1",
      },
      {
        label: "Yes",
        value: "1",
        secondaryLabel: "p2",
      },
      {
        label: "Unknown",
        value: "0.5",
        secondaryLabel: "p3",
      },
      {
        label: "Early request",
        value: earlyRequestMagicNumber,
        secondaryLabel: "p4",
      },
      {
        label: "Custom",
        value: "custom",
      },
    ];
  }

  if (
    decodedAncillaryData.includes(options2.resData) &&
    decodedAncillaryData.includes(options2.corresponds)
  ) {
    return [
      {
        label: "No",
        value: "0",
        secondaryLabel: "p1",
      },
      {
        label: "Yes",
        value: "1",
        secondaryLabel: "p2",
      },
      {
        label: "Unknown",
        value: "0.5",
        secondaryLabel: "p3",
      },
      {
        label: "Custom",
        value: "custom",
      },
    ];
  }

  if (
    decodedAncillaryData.includes(options3.resData) &&
    decodedAncillaryData.includes(options3.corresponds)
  ) {
    return [
      {
        label: "No",
        value: "0",
        secondaryLabel: "p1",
      },
      {
        label: "Yes",
        value: "1",
        secondaryLabel: "p2",
      },
      {
        label: "Early request",
        value: earlyRequestMagicNumber,
        secondaryLabel: "p4",
      },
      {
        label: "Custom",
        value: "custom",
      },
    ];
  }

  // this will only display if we have dynamically found 3 options, otherwise fallback to custom input
  if (dynamicOptions.length >= 3) {
    return [
      ...dynamicOptions,
      // we will always append early request and custom input
      {
        label: "Early request",
        value: earlyRequestMagicNumber,
        secondaryLabel: "p4",
      },
      {
        label: "Custom",
        value: "custom",
      },
    ];
  }
}
