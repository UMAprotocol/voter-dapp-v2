import { describe, expect, it, vi } from "vitest";
import { getVotesToCommit } from "helpers/voting/getVotesToCommit";
import { VoteT } from "types";

vi.mock("helpers", () => ({
  getPrecisionForIdentifier: (identifier: string) =>
    identifier === "TEST8DECIMALS" ? 8 : 18,
}));

function vote(overrides: Partial<VoteT> = {}): VoteT {
  return {
    uniqueKey: "vote",
    decodedIdentifier: "YES_OR_NO_QUERY",
    isCommitted: true,
    canReveal: true,
    decryptedVote: { price: "1000000000000000000", salt: "123" },
    ...overrides,
  } as VoteT;
}

describe("getVotesToCommit", () => {
  it("excludes unchanged commits after reloading on-chain vote data", () => {
    const votes = Array.from({ length: 141 }, (_, index) =>
      vote({
        uniqueKey: `vote-${index}`,
        isCommitted: index < 100,
        decryptedVote:
          index < 100
            ? { price: "1000000000000000000", salt: "123" }
            : undefined,
      })
    );
    const selections = Object.fromEntries(
      votes.map((vote) => [vote.uniqueKey, "1"])
    );
    expect(getVotesToCommit(votes, selections)).toEqual(votes.slice(100));
  });

  it.each(["1", "1.0", "1.00"])(
    "treats %s as the same committed price",
    (selection) => {
      expect(getVotesToCommit([vote()], { vote: selection })).toEqual([]);
    }
  );

  it("retains changed prices and zero-valued selections", () => {
    const original = vote();
    expect(getVotesToCommit([original], { vote: "0" })).toEqual([original]);
    expect(getVotesToCommit([original], { vote: "2" })).toEqual([original]);
  });

  it("does not treat another account's commit or undecryptable votes as unchanged", () => {
    for (const original of [
      vote({ canReveal: false }),
      vote({ decryptedVote: undefined }),
      vote({ isCommitted: false }),
    ]) {
      expect(getVotesToCommit([original], { vote: "1" })).toEqual([original]);
    }
  });

  it("ignores empty selections and stale keys", () => {
    expect(getVotesToCommit([vote()], { vote: "", stale: "1" })).toEqual([]);
    expect(getVotesToCommit([vote()], {})).toEqual([]);
  });

  it("compares prices using the identifier's precision", () => {
    expect(
      getVotesToCommit(
        [
          vote({
            decodedIdentifier: "TEST8DECIMALS",
            decryptedVote: { price: "125000000", salt: "123" },
          }),
        ],
        { vote: "1.25" }
      )
    ).toEqual([]);
  });

  it("compares packed multiple-value prices without decimal scaling", () => {
    expect(
      getVotesToCommit(
        [
          vote({
            decodedIdentifier: "MULTIPLE_VALUES",
            decryptedVote: { price: "123456789", salt: "123" },
          }),
        ],
        { vote: "123456789" }
      )
    ).toEqual([]);
  });

  it("keeps invalid edits in the existing validation path", () => {
    const original = vote();
    expect(getVotesToCommit([original], { vote: "-" })).toEqual([original]);
  });
});
