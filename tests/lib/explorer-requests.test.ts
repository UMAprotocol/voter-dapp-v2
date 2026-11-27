import { afterEach, describe, expect, it, vi } from "vitest";
import { keccak256 } from "ethers/lib/utils";
import { encodeHexString } from "helpers/web3/decodeHexString";
import {
  ExplorerRequestRound,
  explorerQuestionId,
  extractOoRequester,
  findRoundForDvmTime,
  getExplorerRequestRounds,
} from "lib/explorer-requests";

const requester = "65070be91477460d8a7aeeb94ef92fe056c2f2a7";
const original = "q: title: Will it rain?, res_data: p1: 0, p2: 1";
const ancillaryDataL2 = encodeHexString(
  `${original},ooRequester:${requester},childRequester:2c0367a9db231ddebd88a94b4f6461a6e47c58b1,childChainId:137`
);

function round(
  overrides: Partial<ExplorerRequestRound> = {}
): ExplorerRequestRound {
  return {
    question_id: "0xabc",
    request_timestamp: 1000,
    requester: `0x${requester}`,
    oracle_type: "managed",
    proposal_time: "1970-01-01T00:33:20Z", // 2000
    proposed_price: "0",
    request_tx_hash: "0xrequest",
    request_event_index: 3,
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("explorer request lookups", () => {
  it("keys questions by the ancillary data the oracle was asked with", () => {
    expect(explorerQuestionId(ancillaryDataL2)).toBe(
      keccak256(encodeHexString(original))
    );
  });

  it("reads the requester from the DVM-side stamp", () => {
    expect(extractOoRequester(ancillaryDataL2)).toBe(`0x${requester}`);
    expect(extractOoRequester(encodeHexString(original))).toBeUndefined();
  });

  it("matches a round by request time or, for event-based requests, proposal time", () => {
    const first = round({
      request_timestamp: 1000,
      proposal_time: "1970-01-01T00:33:20Z",
    });
    const reset = round({
      request_timestamp: 3000,
      proposal_time: "1970-01-01T01:06:40Z", // 4000
    });
    expect(findRoundForDvmTime([first, reset], 1000)).toBe(first);
    expect(findRoundForDvmTime([first, reset], 4000)).toBe(reset);
    expect(findRoundForDvmTime([first, reset], 5000)).toBeUndefined();
    expect(findRoundForDvmTime([first], 5000)).toBe(first);
  });

  it("asks for every round of the question, including Polymarket V2", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ items: [round()], total: 1 }))
      );
    vi.stubGlobal("fetch", fetchMock);
    await expect(getExplorerRequestRounds("0xabc")).resolves.toEqual([round()]);
    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.origin + url.pathname).toBe(
      "https://oracle.api.otb.uma.xyz/requests"
    );
    expect(url.searchParams.get("q")).toBe("0xabc");
    expect(url.searchParams.get("include_polymarket_v2")).toBe("true");
  });

  it("fails instead of reporting a request as missing when the API errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 503 }))
    );
    await expect(getExplorerRequestRounds("0xabc")).rejects.toThrow("503");
  });
});
