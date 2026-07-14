import {
  makeVoterDappDeeplink,
  parseVoteDeeplink,
} from "helpers/util/deeplink";
import { describe, expect, it } from "vitest";

const uniqueKey =
  "YES_OR_NO_QUERY-1751900000-0x40e832d2323085fa42bd2f76a41ef993ffdbe4f6a06e938ce1a9a2a2c45ae7fa";

describe("parseVoteDeeplink", () => {
  it("prefers the canonical uniqueKey form", () => {
    expect(
      parseVoteDeeplink({ vote: uniqueKey, identifier: "ignored" })
    ).toEqual({ form: "uniqueKey", uniqueKey });
  });

  it("parses the external form", () => {
    expect(
      parseVoteDeeplink({
        identifier: "YES_OR_NO_QUERY",
        time: "1751900000",
        ancillaryDataHash:
          "0x40e832d2323085fa42bd2f76a41ef993ffdbe4f6a06e938ce1a9a2a2c45ae7fa",
      })
    ).toEqual({
      form: "external",
      identifier: "YES_OR_NO_QUERY",
      time: 1751900000,
      ancillaryData: undefined,
      ancillaryDataHash:
        "0x40e832d2323085fa42bd2f76a41ef993ffdbe4f6a06e938ce1a9a2a2c45ae7fa",
    });
  });

  // next/router repeats a param as an array when it appears twice
  it("takes the first value of repeated params", () => {
    expect(parseVoteDeeplink({ vote: [uniqueKey, "other"] })).toEqual({
      form: "uniqueKey",
      uniqueKey,
    });
  });

  it("returns undefined for unrelated or malformed queries", () => {
    expect(parseVoteDeeplink({})).toBeUndefined();
    expect(
      parseVoteDeeplink({ identifier: "YES_OR_NO_QUERY" })
    ).toBeUndefined();
    expect(
      parseVoteDeeplink({ identifier: "YES_OR_NO_QUERY", time: "not-a-number" })
    ).toBeUndefined();
  });
});

describe("makeVoterDappDeeplink", () => {
  it("builds a production link, preferring the hash over full data", () => {
    expect(
      makeVoterDappDeeplink({
        identifier: "YES_OR_NO_QUERY",
        time: 1751900000,
        ancillaryDataHash:
          "0x40e832d2323085fa42bd2f76a41ef993ffdbe4f6a06e938ce1a9a2a2c45ae7fa",
        ancillaryData: "0xabcd",
      })
    ).toBe(
      "https://vote.uma.xyz/?identifier=YES_OR_NO_QUERY&time=1751900000&ancillaryDataHash=0x40e832d2323085fa42bd2f76a41ef993ffdbe4f6a06e938ce1a9a2a2c45ae7fa"
    );
  });

  // blank ancillary data ("0x") must survive: it enables a direct uniqueKey
  // lookup when several requests share identifier and time
  it("keeps blank ancillary data and respects baseUrl", () => {
    expect(
      makeVoterDappDeeplink({
        identifier:
          "0x5945535f4f525f4e4f5f51554552590000000000000000000000000000000000",
        time: "1751900000",
        ancillaryData: "0x",
        baseUrl: "https://testnet.vote.uma.xyz",
      })
    ).toBe(
      "https://testnet.vote.uma.xyz/?identifier=0x5945535f4f525f4e4f5f51554552590000000000000000000000000000000000&time=1751900000&ancillaryData=0x"
    );
  });
});
