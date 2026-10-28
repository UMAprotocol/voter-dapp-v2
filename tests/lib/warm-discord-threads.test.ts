import { afterEach, expect, it, vi } from "vitest";
import { BigNumber } from "ethers";
import { formatBytes32String } from "ethers/lib/utils";
import { NextApiRequest, NextApiResponse } from "next";
import { PriceRequestT } from "types";
import { encodeHexString } from "helpers/web3/decodeHexString";

const cache = vi.hoisted(() => new Map<string, unknown>());
vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: () => ({
      get: (key: string) =>
        Promise.resolve(structuredClone(cache.get(key) ?? null)),
      set: (key: string, value: unknown) => {
        cache.set(key, structuredClone(value));
        return Promise.resolve("OK");
      },
      setex: (key: string, _ttl: number, value: unknown) => {
        cache.set(key, structuredClone(value));
        return Promise.resolve("OK");
      },
    }),
  },
}));
vi.hoisted(() => {
  process.env.CONTENTFUL_SPACE_ID = "space";
  process.env.CONTENTFUL_ACCESS_TOKEN = "token";
});
vi.mock("contentful", () => ({
  createClient: () => ({
    getEntries: () =>
      Promise.resolve({
        items: [{ fields: { number: 217, title: "Refund burned bonds" } }],
      }),
  }),
}));
vi.mock("helpers/config", () => ({ config: {}, chainConstantsList: [] }));
// Avoid initializing browser wallets through the helpers barrel.
vi.mock("helpers", async () => ({
  ...(await import("helpers/voting/projects/polymarket")),
  ...(await import("helpers/voting/projects/predictFun")),
  ...(await import("helpers/voting/projects/probable")),
  ...(await import("helpers/util/misc")),
}));
vi.mock("web3/contracts/createVotingContractInstance", () => ({
  createVotingContractInstance: vi.fn(),
}));
vi.mock("web3", () => ({
  getActiveVotes: vi.fn(),
  getUpcomingVotes: () => Promise.resolve({}),
}));
vi.mock("lib/l2-ancillary-data", async (importOriginal) => ({
  ...(await importOriginal<typeof import("lib/l2-ancillary-data")>()),
  fetchBridgedEventsAt: vi.fn(),
}));

import { getActiveVotes } from "web3";
import { createRequestHash, fetchBridgedEventsAt } from "lib/l2-ancillary-data";
import { createSnowflakeFromTimestamp, makeKey } from "lib/discord-utils";
import { evidenceRationalDiscordChannelId } from "constant/voting/discord";
import {
  getCachedProcessedThread,
  getCachedThreadIdMap,
} from "pages/api/discord-thread/_utils";
import handler from "pages/api/cron/warm-discord-threads";

afterEach(() => {
  vi.unstubAllGlobals();
  cache.clear();
});

it("keeps and matches colliding legacy threads across full and incremental refreshes", async () => {
  const time = 1758134590;
  const fixtures = ["rain", "snow", "hail"].map((weather, index) => {
    const digit = String(index + 1);
    const title = `Will it ${weather}?`;
    const vote = {
      identifier: formatBytes32String("YES_OR_NO_QUERY"),
      decodedIdentifier: "YES_OR_NO_QUERY",
      time,
      ancillaryData: encodeHexString(
        `ancillaryDataHash:${digit.repeat(
          64
        )},childBlockNumber:100,childOracle:${"b".repeat(
          40
        )},childRequester:${"c".repeat(40)},childChainId:8453`
      ),
      decodedAncillaryData: `q:${title},rules:Yes if ${weather}.,ooRequester:1234`,
    } as PriceRequestT;
    const transactionHash = `0x${digit.repeat(64)}`;
    const id = createSnowflakeFromTimestamp(Date.now() - (3 - index) * 1000);
    return {
      title,
      vote,
      transactionHash,
      event: {
        transactionHash,
        args: {
          parentRequestId: createRequestHash({ ...vote, time: String(time) }),
          time: BigNumber.from(time),
        },
      },
      channelMessage: {
        id,
        content: "",
        thread: { id, name: `N/A - ${time}` },
      },
      announcement: {
        id,
        content: `**Transaction:** https://basescan.org/tx/${transactionHash}`,
        author: { id: "42", username: "Herald", bot: true, avatar: null },
        timestamp: new Date().toISOString(),
      },
    };
  });
  vi.mocked(fetchBridgedEventsAt).mockResolvedValue(
    fixtures.map(({ event }) => event) as unknown as Awaited<
      ReturnType<typeof fetchBridgedEventsAt>
    >
  );
  let visible = fixtures.slice(0, 2);
  vi.stubGlobal("fetch", (input: string) => {
    const url = new URL(input);
    const channelId = url.pathname.split("/")[4];
    const after = url.searchParams.get("after");
    const messages =
      channelId === evidenceRationalDiscordChannelId
        ? visible
            .map(({ channelMessage }) => channelMessage)
            .filter(({ id }) => !after || BigInt(id) > BigInt(after))
            .reverse()
        : fixtures
            .filter(({ channelMessage }) => channelMessage.id === channelId)
            .map(({ announcement }) => announcement);
    return Promise.resolve(Response.json(messages));
  });

  for (const count of [2, 3]) {
    visible = fixtures.slice(0, count);
    vi.mocked(getActiveVotes).mockResolvedValue(
      Object.fromEntries(visible.map(({ vote }, index) => [index, vote]))
    );
    const response = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await handler({} as NextApiRequest, response as unknown as NextApiResponse);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ processed: count, skipped: 0, errors: 0 })
    );
    const cachedMap = await getCachedThreadIdMap();
    expect(cachedMap?.threadIdMap[makeKey("N/A", time)]).toHaveLength(count);
    for (const { title, transactionHash, channelMessage } of visible) {
      const discussion = await getCachedProcessedThread(makeKey(title, time));
      expect(discussion?.thread[0].message).toContain(transactionHash);
      expect(discussion?.threadId).toBe(channelMessage.id);
    }
  }
});

it("preserves a named thread link when Discord redacts every message", async () => {
  const time = 1791500000;
  const id = createSnowflakeFromTimestamp(Date.now() - 1000);
  vi.mocked(getActiveVotes).mockResolvedValue({
    vote: {
      identifier: formatBytes32String("YES_OR_NO_QUERY"),
      decodedIdentifier: "YES_OR_NO_QUERY",
      time,
      decodedAncillaryData:
        "q:Will it rain?,rules:Yes if rain.,ooRequester:1234",
    } as PriceRequestT,
  });
  vi.stubGlobal("fetch", (input: string) => {
    const channelId = new URL(input).pathname.split("/")[4];
    return Promise.resolve(
      Response.json(
        channelId === evidenceRationalDiscordChannelId
          ? [
              {
                id,
                content: "",
                thread: { id, name: `Will it rain? - ${time}` },
              },
            ]
          : [{ id, content: "", timestamp: new Date().toISOString() }]
      )
    );
  });
  const response = { status: vi.fn().mockReturnThis(), json: vi.fn() };
  await handler({} as NextApiRequest, response as unknown as NextApiResponse);
  expect(
    await getCachedProcessedThread(makeKey("Will it rain?", time))
  ).toEqual({
    identifier: formatBytes32String("YES_OR_NO_QUERY"),
    time,
    thread: [],
    threadId: id,
  });
});

it("matches governance threads named after their Contentful title", async () => {
  const time = 1793217035;
  const id = createSnowflakeFromTimestamp(Date.now() - 1000);
  vi.mocked(getActiveVotes).mockResolvedValue({
    vote: {
      identifier: formatBytes32String("Admin 217"),
      decodedIdentifier: "Admin 217",
      time,
      decodedAncillaryData: "",
    } as PriceRequestT,
  });
  vi.stubGlobal("fetch", (input: string) => {
    const channelId = new URL(input).pathname.split("/")[4];
    return Promise.resolve(
      Response.json(
        channelId === evidenceRationalDiscordChannelId
          ? [
              {
                id,
                content: "",
                thread: { id, name: `Refund burned bonds - ${time}` },
              },
            ]
          : [
              {
                id,
                content: "Refund looks right",
                author: { id: "7", username: "voter", avatar: null },
                timestamp: new Date().toISOString(),
              },
            ]
      )
    );
  });
  const response = { status: vi.fn().mockReturnThis(), json: vi.fn() };
  await handler({} as NextApiRequest, response as unknown as NextApiResponse);
  const discussion = await getCachedProcessedThread(
    makeKey("Refund burned bonds", time)
  );
  expect(discussion?.thread[0].message).toContain("Refund looks right");
  expect(discussion?.threadId).toBe(id);
});
