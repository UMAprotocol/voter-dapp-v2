import { keccak256 } from "ethers/lib/utils";
import { encodeHexString } from "helpers/web3/decodeHexString";
import {
  getBridgedFields,
  hashesOfHex,
  matchesCheapHashVariants,
  matchesHexHashVariants,
  normalizeIdentifier,
  pickByFullAncillaryData,
  stripOoRequesterStamp,
} from "lib/deeplink-matching";
import { describe, expect, it } from "vitest";

// Fixtures mirror the shapes seen in production: a plain DVM request, an
// OO-stamped request (`<caller data>,ooRequester:<addr>`), a stamped request
// with blank caller data, and a bridged/compressed request that replaces the
// data with `ancillaryDataHash:<keccak256(childData)>,...`.

const requester = "f39fd6e51aad88f6f4ce6ab8827279cfffb92266";
const childRequester = "70997970c51812dc3a010c7d01b50e0d17dc79c8";

const callerData = encodeHexString('q:"Will it settle?",p1:0,p2:1');
const stampedData = encodeHexString(
  `q:"Will it settle?",p1:0,p2:1,ooRequester:${requester}`
);
// shares callerData's byte-prefix but the remainder is not the stamp
const prefixCollisionData = encodeHexString(
  'q:"Will it settle?",p1:0,p2:1,extra:1'
);
const blankStampedData = encodeHexString(`,ooRequester:${requester}`);

const childData = stampedData;
const compressedData = encodeHexString(
  `ancillaryDataHash:${keccak256(childData).slice(2)},` +
    `childBlockNumber:12345,` +
    `childOracle:${requester},` +
    `childRequester:${childRequester},` +
    `childChainId:137`
);

const emptyDataHash = keccak256("0x");

function candidate(id: string, ancillaryData: string | null) {
  return { id, ancillaryData };
}

describe("stripOoRequesterStamp", () => {
  it("strips the stamp back to the caller's bytes", () => {
    expect(stripOoRequesterStamp(stampedData)).toBe(callerData);
  });

  it("returns undefined when no stamp is present", () => {
    expect(stripOoRequesterStamp(callerData)).toBeUndefined();
  });

  it("strips a blank-data stamp to empty bytes", () => {
    expect(stripOoRequesterStamp(blankStampedData)).toBe("0x");
  });
});

describe("hashesOfHex", () => {
  it("hashes unstamped data once", () => {
    expect(hashesOfHex(callerData)).toEqual([keccak256(callerData)]);
  });

  it("hashes stamped data and its pre-stamp form", () => {
    expect(hashesOfHex(stampedData)).toEqual([
      keccak256(stampedData),
      keccak256(callerData),
    ]);
  });

  it("includes the empty-data hash for a blank-data stamp", () => {
    expect(hashesOfHex(blankStampedData)).toEqual([
      keccak256(blankStampedData),
      emptyDataHash,
    ]);
  });

  it("returns nothing for empty input", () => {
    expect(hashesOfHex(undefined)).toEqual([]);
    expect(hashesOfHex("0x")).toEqual([]);
  });
});

describe("pickByFullAncillaryData", () => {
  const candidates = [
    candidate("exact", callerData),
    candidate("stamped", stampedData),
    candidate("collision", prefixCollisionData),
    candidate("compressed", compressedData),
  ];

  it("prefers an exact match", () => {
    expect(pickByFullAncillaryData(candidates, callerData)?.id).toBe("exact");
  });

  it("matches stamped data when the caller holds the pre-stamp bytes", () => {
    const withoutExact = candidates.filter((c) => c.id !== "exact");
    expect(pickByFullAncillaryData(withoutExact, callerData)?.id).toBe(
      "stamped"
    );
  });

  it("does not let a byte-prefix collision steal a stamped match", () => {
    const onlyCollision = [candidate("collision", prefixCollisionData)];
    expect(pickByFullAncillaryData(onlyCollision, callerData)).toBeUndefined();
  });

  it("refuses ambiguous stamped matches", () => {
    const twoStamped = [
      candidate("a", stampedData),
      candidate(
        "b",
        encodeHexString(
          `q:"Will it settle?",p1:0,p2:1,ooRequester:${childRequester}`
        )
      ),
    ];
    expect(pickByFullAncillaryData(twoStamped, callerData)).toBeUndefined();
  });

  it("matches a compressed request by the embedded child-data hash", () => {
    expect(
      pickByFullAncillaryData([candidate("compressed", compressedData)], childData)
        ?.id
    ).toBe("compressed");
  });

  it("is case-insensitive on the provided data", () => {
    expect(
      pickByFullAncillaryData(candidates, callerData.toUpperCase().replace("0X", "0x"))
        ?.id
    ).toBe("exact");
  });
});

describe("getBridgedFields", () => {
  it("extracts the child-chain reference from a compressed request", () => {
    expect(getBridgedFields(compressedData)).toEqual({
      ancillaryDataHash: keccak256(childData).slice(2),
      childOracle: `0x${requester}`,
      childChainId: 137,
      childBlockNumber: 12345,
    });
  });

  it("returns undefined for non-bridged data", () => {
    expect(getBridgedFields(callerData)).toBeUndefined();
    expect(getBridgedFields(null)).toBeUndefined();
    expect(getBridgedFields("0xzz")).toBeUndefined();
  });
});

describe("matchesHexHashVariants", () => {
  it("matches the hash of the data itself", () => {
    expect(matchesHexHashVariants(stampedData, keccak256(stampedData))).toBe(
      true
    );
  });

  it("matches the hash of the pre-stamp form", () => {
    expect(matchesHexHashVariants(stampedData, keccak256(callerData))).toBe(
      true
    );
  });

  it("rejects an unrelated hash", () => {
    expect(
      matchesHexHashVariants(stampedData, keccak256(prefixCollisionData))
    ).toBe(false);
  });
});

describe("matchesCheapHashVariants", () => {
  it("matches DVM-side and pre-stamp hashes", () => {
    expect(matchesCheapHashVariants(stampedData, keccak256(stampedData))).toBe(
      true
    );
    expect(matchesCheapHashVariants(stampedData, keccak256(callerData))).toBe(
      true
    );
  });

  it("matches the hash embedded in a compressed request", () => {
    expect(matchesCheapHashVariants(compressedData, keccak256(childData))).toBe(
      true
    );
  });

  it("matches the empty-data hash for a blank-data stamp", () => {
    expect(matchesCheapHashVariants(blankStampedData, emptyDataHash)).toBe(
      true
    );
  });

  it("does not match the child data hash without the embedded reference", () => {
    expect(matchesCheapHashVariants(callerData, keccak256(childData))).toBe(
      false
    );
  });
});

describe("normalizeIdentifier", () => {
  it("decodes the on-chain bytes32 form", () => {
    expect(
      normalizeIdentifier(
        "0x5945535f4f525f4e4f5f51554552590000000000000000000000000000000000"
      )
    ).toBe("YES_OR_NO_QUERY");
  });

  it("passes decoded identifiers through", () => {
    expect(normalizeIdentifier("YES_OR_NO_QUERY")).toBe("YES_OR_NO_QUERY");
  });
});
