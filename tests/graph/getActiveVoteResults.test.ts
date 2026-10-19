import { beforeEach, describe, expect, it, vi } from "vitest";
import { parse, Kind, valueFromASTUntyped } from "graphql";
import { getActiveVoteResults } from "graph/queries/getActiveVoteResults";

const state = vi.hoisted(() => ({
  currentCount: 31,
  upcomingCount: 130,
  hasReveals: true,
}));
vi.mock("helpers/config", () => ({
  config: { graphEndpoint: "https://graph.example.test" },
}));
vi.mock("helpers", async () => {
  const { utils } = await import("ethers");
  return {
    formatBytes32String: utils.formatBytes32String,
    makePriceRequestsByKey: (requests: { time: { toString(): string } }[]) =>
      Object.fromEntries(
        requests.map((request) => [String(request.time), request])
      ),
  };
});
vi.mock("helpers/voting/resolveAncillaryData", () => ({
  resolveAncillaryDataForRequests: (requests: unknown[]) =>
    Promise.resolve(requests),
}));
vi.mock("graphql-request", async (importOriginal) => ({
  ...(await importOriginal<typeof import("graphql-request")>()),
  default: (
    _endpoint: string,
    query: string,
    variables: Record<string, unknown> = {}
  ) => {
    // Apply the actual outgoing filters before pagination, as the server does.
    const operation = parse(query).definitions.find(
      (definition) => definition.kind === Kind.OPERATION_DEFINITION
    );
    if (!operation || operation.kind !== Kind.OPERATION_DEFINITION) {
      throw new Error("Missing query operation");
    }
    const field = operation.selectionSet.selections.find(
      (selection) =>
        selection.kind === Kind.FIELD &&
        selection.name.value === "priceRequests"
    );
    if (!field || field.kind !== Kind.FIELD)
      throw new Error("Missing requests");
    const args = Object.fromEntries(
      (field.arguments ?? []).map((arg) => [
        arg.name.value,
        valueFromASTUntyped(arg.value, variables),
      ])
    ) as {
      skip?: number;
      first?: number;
      where?: {
        isResolved?: boolean;
        isDeleted?: boolean;
        latestRound_?: { roundId?: string };
      };
    };
    const skip = args.skip ?? 0;
    const first = args.first ?? 100;
    function request(time: number, roundId: number, hasReveals = false) {
      return {
        identifier: { id: "YES_OR_NO_QUERY" },
        time: String(time),
        price: null,
        ancillaryData: "0x",
        resolvedPriceRequestIndex: null,
        isResolved: false,
        isDeleted: false,
        latestRound: {
          roundId: String(roundId),
          totalVotesRevealed: hasReveals ? "100" : "0",
          totalTokensCommitted: "200",
          minAgreementRequirement: "50",
          minParticipationRequirement: "50",
          groups: hasReveals ? [{ price: "1", totalVoteAmount: "100" }] : [],
          committedVotes: [],
          revealedVotes: [],
        },
      };
    }
    const requests = [
      ...Array.from({ length: state.upcomingCount }, (_, i) =>
        request(10000 + i, 10373)
      ),
      request(20000, 10371, true),
      { ...request(20001, 10372, true), isDeleted: true },
      { ...request(20002, 10372, true), isResolved: true },
      ...Array.from({ length: state.currentCount }, (_, i) =>
        request(i + 1, 10372, state.hasReveals)
      ),
    ];
    const where = args.where ?? {};
    return Promise.resolve({
      priceRequests: requests
        .filter(
          (r) =>
            (where.isResolved === undefined ||
              r.isResolved === where.isResolved) &&
            (where.isDeleted === undefined ||
              r.isDeleted === where.isDeleted) &&
            (where.latestRound_?.roundId === undefined ||
              r.latestRound.roundId === String(where.latestRound_.roundId))
        )
        .slice(skip, skip + first),
    });
  },
}));

beforeEach(() => {
  state.currentCount = 31;
  state.upcomingCount = 130;
  state.hasReveals = true;
});

describe("getActiveVoteResults", () => {
  it("fetches only the current round, excluding upcoming, older, deleted and resolved requests", async () => {
    const votes = await getActiveVoteResults(10372);
    expect(Object.keys(votes)).toHaveLength(31);
    expect(votes["31"]?.results).toEqual([{ vote: "1", tokensVotedWith: 100 }]);
    expect(votes["10000"]).toBeUndefined();
    expect(votes["20000"]).toBeUndefined();
    expect(votes["20001"]).toBeUndefined();
    expect(votes["20002"]).toBeUndefined();
  });

  it("keeps current-round participation before any reveals arrive", async () => {
    state.hasReveals = false;
    const votes = await getActiveVoteResults(10372);
    expect(Object.keys(votes)).toHaveLength(31);
    expect(votes["1"]?.results).toEqual([]);
    expect(votes["1"]?.participation?.totalTokensCommitted).toBe(200);
  });

  it("preserves the round filter across every page, including beyond 1000 requests", async () => {
    state.currentCount = 1101;
    const votes = await getActiveVoteResults(10372);
    expect(Object.keys(votes)).toHaveLength(1101);
    expect(votes["1101"]?.results).toEqual([
      { vote: "1", tokensVotedWith: 100 },
    ]);
    expect(votes["10000"]).toBeUndefined();
  });

  it("uses the new round when the round changes", async () => {
    const votes = await getActiveVoteResults(10373);
    expect(Object.keys(votes)).toHaveLength(130);
    expect(votes["10000"]?.results).toEqual([]);
    expect(votes["1"]).toBeUndefined();
  });

  it("returns no results for a round with no matching requests", async () => {
    expect(await getActiveVoteResults(10374)).toEqual({});
  });
});
