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
      get: async (key: string) => structuredClone(cache.get(key) ?? null),
      set: async (key: string, value: unknown) => {
        cache.set(key, structuredClone(value));
        return "OK";
      },
      setex: async (key: string, _ttl: number, value: unknown) => {
        cache.set(key, structuredClone(value));
        return "OK";
      },
    }),
  },
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
  getUpcomingVotes: async () => ({}),
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
  vi.stubGlobal("fetch", async (input: string) => {
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
    return Response.json(messages);
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
    for (const { title, transactionHash } of visible) {
      const discussion = await getCachedProcessedThread(makeKey(title, time));
      expect(discussion?.thread[0].message).toContain(transactionHash);
    }
  }
});
