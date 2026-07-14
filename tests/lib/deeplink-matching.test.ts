import { formatBytes32String, getAddress, keccak256 } from "ethers/lib/utils";
import { encodeHexString } from "helpers/web3/decodeHexString";
import {
  DeeplinkPriceRequestEntity,
  getBridgedFields,
  hashesOfHex,
  makeRawRequestFromEntity,
  matchesCheapHashVariants,
  matchesHexHashVariants,
  normalizeIdentifier,
  OO_REQUESTER_STAMP,
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

  // binary ancillary data can contain the stamp's nibble sequence shifted off
  // a byte boundary; slicing there would produce odd-length hex and make
  // keccak256 throw (a 500 for every deeplink sharing that identifier+time)
  it("ignores a nibble-shifted stamp coincidence in binary data", () => {
    const unaligned = `0xa${OO_REQUESTER_STAMP}b`;
    expect(stripOoRequesterStamp(unaligned)).toBeUndefined();
    expect(() => hashesOfHex(unaligned)).not.toThrow();
  });

  it("walks back to a byte-aligned stamp past a later unaligned coincidence", () => {
    const tricky = `0x${OO_REQUESTER_STAMP}00a${OO_REQUESTER_STAMP}b`;
    expect(stripOoRequesterStamp(tricky)).toBe("0x");
    expect(() => hashesOfHex(tricky)).not.toThrow();
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
      pickByFullAncillaryData(
        [candidate("compressed", compressedData)],
        childData
      )?.id
    ).toBe("compressed");
  });

  it("is case-insensitive on the provided data", () => {
    expect(
      pickByFullAncillaryData(
        candidates,
        callerData.toUpperCase().replace("0X", "0x")
      )?.id
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

describe("makeRawRequestFromEntity", () => {
  const voterA = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
  const entity: DeeplinkPriceRequestEntity = {
    id: "YES_OR_NO_QUERY-1751900000-0xabc",
    isResolved: true,
    isDeleted: false,
    time: "1751900000",
    ancillaryData: callerData,
    identifier: { id: "YES_OR_NO_QUERY" },
    price: "1000000000000000000",
    resolvedPriceRequestIndex: "123",
    isGovernance: false,
    rollCount: 1,
    latestRound: {
      roundId: "10000",
      totalVotesRevealed: "5000000",
      totalTokensCommitted: "6000000",
      minAgreementRequirement: "1000000",
      minParticipationRequirement: "2000000",
      groups: [
        { price: "1000000000000000000", totalVoteAmount: "4000000" },
        { price: "0", totalVoteAmount: "1000000" },
      ],
      committedVotes: [{ id: "a" }, { id: "b" }, { id: "c" }],
      revealedVotes: [{ voter: { address: voterA }, price: "0" }],
    },
  };

  it("mirrors the getPastVotesV2 transform", () => {
    expect(makeRawRequestFromEntity(entity)).toEqual({
      identifier: formatBytes32String("YES_OR_NO_QUERY"),
      time: 1751900000,
      ancillaryData: callerData,
      correctVote: "1000000000000000000",
      resolvedPriceRequestIndex: "123",
      isGovernance: false,
      rollCount: 1,
      isV1: false,
      participation: {
        uniqueCommitAddresses: 3,
        uniqueRevealAddresses: 1,
        totalTokensVotedWith: 5000000,
        totalTokensCommitted: 6000000,
        minAgreementRequirement: 1000000,
        minParticipationRequirement: 2000000,
      },
      results: [
        { vote: "1000000000000000000", tokensVotedWith: 4000000 },
        { vote: "0", tokensVotedWith: 1000000 },
      ],
      revealedVoteByAddress: { [getAddress(voterA)]: "0" },
    });
  });

  // formatBytes32String rejects identifiers of exactly 32 bytes; plain utf8
  // encoding round-trips them and decodeHexString strips padding either way
  it("encodes a 32-byte identifier without throwing", () => {
    const longId = "A".repeat(32);
    const raw = makeRawRequestFromEntity({
      ...entity,
      identifier: { id: longId },
    });
    expect(raw.identifier).toBe(encodeHexString(longId));
  });

  it("handles an unresolved request with sparse round data", () => {
    const unresolved = makeRawRequestFromEntity({
      ...entity,
      isResolved: false,
      price: null,
      resolvedPriceRequestIndex: null,
      rollCount: null,
      ancillaryData: null,
      latestRound: null,
    });
    expect(unresolved.correctVote).toBeUndefined();
    expect(unresolved.resolvedPriceRequestIndex).toBeUndefined();
    expect(unresolved.rollCount).toBe(0);
    expect(unresolved.ancillaryData).toBe("0x");
    expect(unresolved.results).toEqual([]);
    expect(unresolved.revealedVoteByAddress).toEqual({});
    expect(unresolved.participation.totalTokensCommitted).toBeUndefined();
    expect(unresolved.participation.uniqueCommitAddresses).toBe(0);
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
