import { earlyRequestMagicNumber } from "constant";
import { DropdownItemT, VoteT } from "types";
import chunk from "lodash/chunk";
import { BigNumber, ethers } from "ethers";
import { solidityKeccak256 } from "ethers/lib/utils";

const polymarketChainId = 137;

// hard coded known poly addresses:
// https://github.com/UMAprotocol/protocol/blob/master/packages/monitor-v2/src/monitor-polymarket/common.ts#L474

export const polymarketRequesters = [
  "0xcb1822859cef82cd2eb4e6276c7916e692995130", // Polymarket Binary Adapter Address
  "0x6a9d222616c90fca5754cd1333cfd9b7fb6a4f74", // Polymarket CTF Adapter Address
  "0x2f5e3684cb1f318ec51b00edba38d79ac2c0aa9d", // Polymarket CTF Adapter Address V2
  "0x4bfb41d5b3570defd03c39a9a4d8de6bd8b8982e", // Polymarket CTF Exchange Address
  "0xb21182d0494521cf45dbbeebb5a3acaab6d22093", // Polymarket Sports Address
  "0x157ce2d672854c848c9b79c49a8cc6cc89176a49", // Polymarket CTF Adapter Address V3
  "0x65070be91477460d8a7aeeb94ef92fe056c2f2a7", // Polymarket UmaCtfAdapter for Managed OOv2
  "0x69c47de9d4d3dad79590d61b9e05918e03775f24", // Polymarket UmaCtfAdapter for Managed OOv2
].map((a) => a.toLowerCase());

const polymarketIdentifiers = ["YES_OR_NO_QUERY", "MULTIPLE_VALUES"];

export function isPolymarketRequester(address: string): boolean {
  return polymarketRequesters.includes(address.toLowerCase());
}

export function getRequester(decodedAncillaryData: string): string | undefined {
  const match = decodedAncillaryData.match(/ooRequester:([^,]+)/) ?? [];
  return match[1] ? "0x" + match[1] : undefined;
}
export function getInitializer(
  decodedAncillaryData: string
): string | undefined {
  const match = decodedAncillaryData.match(/initializer:([^,]+)/);
  return match ? "0x" + match[1] : undefined;
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
    polymarketIdentifiers.includes(decodedIdentifier) &&
    decodedAncillaryData.includes(queryTitleToken) &&
    decodedAncillaryData.includes(resultDataToken) &&
    requester &&
    isPolymarketRequester(requester) &&
    childChainId === polymarketChainId;

  return Boolean(isPolymarket);
}

// Parses p-values (e.g. "p1: 0, p2: 1, p3: 0.5") from the res_data section.
// Returns a map like { p1: "0", p2: "1", p3: "0.5" }. Only handles exactly 3 p-values (p4 is assumed to be "too early").
function parseResData(
  decodedAncillaryData: string
): Record<string, string> | undefined {
  const match = decodedAncillaryData.match(
    /res_data: (p\d): (\d+\.\d+|\d+), (p\d): (\d+\.\d+|\d+), (p\d): (\d+\.\d+|\d+)/
  );
  if (!match) return undefined;
  // match captures: [full, p1Key, p1Val, p2Key, p2Val, p3Key, p3Val]
  return Object.fromEntries(chunk(match.slice(1), 2)) as Record<string, string>;
}

// Parses human-readable labels from the "Where pN corresponds to X, pN to Y" section.
// Returns a map like { p1: "Knicks", p2: "Cavs" }. Supports 2 or 3 correspondence pairs.
// Uses ", " as a delimiter — commas not followed by a space (e.g. "$2,000") are kept as part of the label.
function parseCorrespondenceLabels(
  decodedAncillaryData: string
): Record<string, string> | undefined {
  // Try 3 pairs first, then 2
  const match =
    decodedAncillaryData.match(
      /Where (p\d) corresponds to ((?:[^,]|,(?!\s))+), (p\d) to ((?:[^,]|,(?!\s))+), (p\d) to ([^.,]+)/
    ) ??
    decodedAncillaryData.match(
      /Where (p\d) corresponds to ((?:[^,]|,(?!\s))+), (p\d) to ([^.,]+)/
    );
  if (!match) return undefined;
  // match captures: [full, p1Key, p1Label, p2Key, p2Label, ...]
  const pairs = chunk(match.slice(1), 2) as [string, string][];
  return Object.fromEntries(
    pairs.map(([key, label]) => {
      // Normalize "a No" / "a no" → "No"
      if (label.toLowerCase().includes("a no")) return [key, "No"];
      return [key, label.trim()];
    })
  );
}

// Builds dropdown options by combining res_data values with correspondence labels.
// Requires both to be parseable — if either fails, returns [] so the UI falls back to a raw text input.
// For p-values that have a res_data entry but no correspondence label (e.g. p3: 0.5 with only 2 labels),
// a fallback label is derived: 0.5 → "50/50", otherwise the raw value string.
function dynamicPolymarketOptions(
  decodedAncillaryData: string
): DropdownItemT[] {
  const resData = parseResData(decodedAncillaryData);
  const labels = parseCorrespondenceLabels(decodedAncillaryData);

  if (!resData || !labels) return [];

  return Object.entries(resData).map(([pKey, value]) => {
    const label = labels[pKey] ?? (value === "0.5" ? "50/50" : value);
    return { label, value, secondaryLabel: pKey };
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

  // this will only display if we have dynamically found 2+ options, otherwise fallback to custom input
  if (dynamicOptions.length >= 2) {
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

export function getResDataValues(decodedAncillaryData: string): string[] {
  const matches = decodedAncillaryData.matchAll(/p\d: (\d+\.?\d*)/g);
  return [...matches].map((m) => m[1]);
}

// input user values as regular numbers
export function decodeMultipleQueryPriceAtIndex(
  encodedPrice: BigNumber,
  index: number
): number {
  if (index < 0 || index > 6) {
    throw new Error("Index out of range");
  }
  // Shift the bits of encodedPrice to the right by (32 * index) positions.
  // This operation effectively moves the desired 32-bit segment to the least significant position.
  // The bitwise AND operation with 0xffffffff ensures that only the least significant 32 bits are retained,
  // effectively extracting the 32-bit value at the specified index.
  return encodedPrice
    .shr(32 * index)
    .and(BigNumber.from("0xffffffff"))
    .toNumber();
}

export function encodeMultipleQuery(values: string[]): string {
  if (values.length > 7) {
    throw new Error("Maximum of 7 values allowed");
  }

  let encodedPrice = BigNumber.from(0);

  for (let i = 0; i < values.length; i++) {
    if (values[i] === undefined || values[i] === "") {
      throw new Error("All values must be defined");
    }
    const numValue = Number(values[i]);
    if (!Number.isInteger(numValue)) {
      throw new Error("All values must be integers");
    }
    if (numValue > 0xffffffff || numValue < 0) {
      throw new Error("Values must be uint32 (0 <= value <= 2^32 - 1)");
    }
    // Shift the current value to its correct position in the 256-bit field.
    // Each value is a 32-bit unsigned integer, so we shift it by 32 bits times its index.
    // This places the first value at the least significant bits and subsequent values
    // at increasingly higher bit positions.
    encodedPrice = encodedPrice.or(BigNumber.from(numValue).shl(32 * i));
  }

  return encodedPrice.toString();
}

export function decodeMultipleQuery(
  price: string,
  length: number
): string[] | string {
  const result: number[] = [];
  const bigIntPrice = BigNumber.from(price);

  if (isUnresolvable(price)) {
    return price;
  }

  for (let i = 0; i < length; i++) {
    const value = decodeMultipleQueryPriceAtIndex(bigIntPrice, i);
    result.push(value);
  }
  return result.map((x) => x.toString());
}

export function isTooEarly(price: BigNumber | string | undefined): boolean {
  if (!price) {
    return false;
  }
  return typeof price === "string"
    ? BigNumber.from(price).eq(ethers.constants.MinInt256)
    : ethers.constants.MinInt256.eq(price);
}

export function isUnresolvable(price: BigNumber | string | undefined): boolean {
  if (!price) {
    return false;
  }
  return typeof price === "string"
    ? BigNumber.from(price).eq(ethers.constants.MaxInt256)
    : ethers.constants.MaxInt256.eq(price);
}

/**
 * Strips the following keys from ancillary data (and any possible preceding commas):
 * 1. ooRequester
 * 2. childRequester
 * 3. childChainId
 */

// questionId is a hash of ancillaryData + initializer EOA
export function sanitizeAncillaryData(decodedAncillaryData: string): string {
  const regex = /(?:,\s*)?(ooRequester|childChainId|childRequester):[^,]+/g;
  const stripped = decodedAncillaryData.replace(regex, "");
  return stripped;
}

export function getQuestionId({
  decodedAncillaryData,
}: Partial<Pick<VoteT, "decodedAncillaryData">>): string | undefined {
  if (decodedAncillaryData) {
    return solidityKeccak256(
      ["string"],
      [sanitizeAncillaryData(decodedAncillaryData)]
    );
  }
}
