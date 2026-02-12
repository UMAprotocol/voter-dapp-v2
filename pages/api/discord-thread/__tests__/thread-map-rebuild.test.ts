import { describe, it, expect } from "vitest";
import {
  getTimestampFromSnowflake,
  createSnowflakeFromTimestamp,
} from "lib/discord-utils";

// Mirrored from _utils.ts (can't import directly due to dependency chain issues with @uma/contracts-frontend)
const FULL_REBUILD_INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 hours
const FULL_REBUILD_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000; // 1 week

// Stub: mirrors shouldDoFullRebuild from _utils.ts
function shouldDoFullRebuild(
  cachedData: { lastFullRebuildAt?: number } | null
): boolean {
  if (!cachedData) return true;
  if (!cachedData.lastFullRebuildAt) return true;

  const timeSinceLastRebuild = Date.now() - cachedData.lastFullRebuildAt;
  return timeSinceLastRebuild >= FULL_REBUILD_INTERVAL_MS;
}

describe("Discord Snowflake Utilities", () => {
  describe("getTimestampFromSnowflake", () => {
    it("should correctly extract timestamp from a known snowflake", () => {
      // Known Discord snowflake: 1234567890123456789
      // This was created at a specific time we can verify
      const snowflake = "1234567890123456789";
      const timestamp = getTimestampFromSnowflake(snowflake);

      // The timestamp should be after Discord epoch and before now
      expect(timestamp).toBeGreaterThan(1420070400000);
      expect(timestamp).toBeLessThan(Date.now());
    });

    it("should round-trip timestamp through snowflake conversion", () => {
      const originalTimestamp = Date.now();
      const snowflake = createSnowflakeFromTimestamp(originalTimestamp);
      const extractedTimestamp = getTimestampFromSnowflake(snowflake);

      // Should match exactly (no precision loss for recent timestamps)
      expect(extractedTimestamp).toBe(originalTimestamp);
    });

    it("should handle timestamps from 1 week ago", () => {
      const oneWeekAgo = Date.now() - FULL_REBUILD_LOOKBACK_MS;
      const snowflake = createSnowflakeFromTimestamp(oneWeekAgo);
      const extractedTimestamp = getTimestampFromSnowflake(snowflake);

      expect(extractedTimestamp).toBe(oneWeekAgo);
    });

    it("should handle timestamps from 1 year ago", () => {
      const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
      const snowflake = createSnowflakeFromTimestamp(oneYearAgo);
      const extractedTimestamp = getTimestampFromSnowflake(snowflake);

      expect(extractedTimestamp).toBe(oneYearAgo);
    });
  });

  describe("createSnowflakeFromTimestamp", () => {
    it("should create valid snowflake for current time", () => {
      const now = Date.now();
      const snowflake = createSnowflakeFromTimestamp(now);

      // Snowflake should be a numeric string
      expect(snowflake).toMatch(/^\d+$/);
      // Should be a large number (Discord snowflakes are 64-bit)
      expect(BigInt(snowflake)).toBeGreaterThan(BigInt(0));
    });

    it("should create larger snowflakes for later timestamps", () => {
      const earlier = Date.now() - 1000000;
      const later = Date.now();

      const earlierSnowflake = BigInt(createSnowflakeFromTimestamp(earlier));
      const laterSnowflake = BigInt(createSnowflakeFromTimestamp(later));

      expect(laterSnowflake).toBeGreaterThan(earlierSnowflake);
    });
  });
});

describe("Thread Map Rebuild Logic", () => {
  describe("shouldDoFullRebuild", () => {
    it("should return true when cache is null", () => {
      expect(shouldDoFullRebuild(null)).toBe(true);
    });

    it("should return true when lastFullRebuildAt is undefined", () => {
      expect(shouldDoFullRebuild({})).toBe(true);
      expect(shouldDoFullRebuild({ lastFullRebuildAt: undefined })).toBe(true);
    });

    it("should return true when cache is older than 2 hours", () => {
      const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000;
      expect(shouldDoFullRebuild({ lastFullRebuildAt: threeHoursAgo })).toBe(
        true
      );
    });

    it("should return false when cache is less than 2 hours old", () => {
      const oneHourAgo = Date.now() - 1 * 60 * 60 * 1000;
      expect(shouldDoFullRebuild({ lastFullRebuildAt: oneHourAgo })).toBe(
        false
      );
    });

    it("should return false when cache was just created", () => {
      expect(shouldDoFullRebuild({ lastFullRebuildAt: Date.now() })).toBe(
        false
      );
    });

    it("should return true at exactly 2 hours", () => {
      const exactlyTwoHoursAgo = Date.now() - FULL_REBUILD_INTERVAL_MS;
      expect(
        shouldDoFullRebuild({ lastFullRebuildAt: exactlyTwoHoursAgo })
      ).toBe(true);
    });

    it("should return false at 1ms before 2 hours", () => {
      const justUnderTwoHours = Date.now() - FULL_REBUILD_INTERVAL_MS + 1;
      expect(
        shouldDoFullRebuild({ lastFullRebuildAt: justUnderTwoHours })
      ).toBe(false);
    });
  });

  describe("Lookback filtering logic", () => {
    it("should identify messages older than 1 week", () => {
      const now = Date.now();
      const cutoff = now - FULL_REBUILD_LOOKBACK_MS;

      const recentMessage = { id: createSnowflakeFromTimestamp(now - 1000) };
      const oldMessage = {
        id: createSnowflakeFromTimestamp(cutoff - 1000),
      };

      const recentTimestamp = getTimestampFromSnowflake(recentMessage.id);
      const oldTimestamp = getTimestampFromSnowflake(oldMessage.id);

      expect(recentTimestamp).toBeGreaterThanOrEqual(cutoff);
      expect(oldTimestamp).toBeLessThan(cutoff);
    });

    it("should correctly filter a batch of messages by age", () => {
      const now = Date.now();
      const cutoff = now - FULL_REBUILD_LOOKBACK_MS;

      const messages = [
        { id: createSnowflakeFromTimestamp(now - 1000), content: "recent1" },
        { id: createSnowflakeFromTimestamp(now - 86400000), content: "1 day" },
        {
          id: createSnowflakeFromTimestamp(cutoff - 1000),
          content: "too old",
        },
        {
          id: createSnowflakeFromTimestamp(cutoff - 86400000),
          content: "way too old",
        },
      ];

      const filtered = messages.filter((msg) => {
        const msgTimestamp = getTimestampFromSnowflake(msg.id);
        return msgTimestamp >= cutoff;
      });

      expect(filtered).toHaveLength(2);
      expect(filtered.map((m) => m.content)).toEqual(["recent1", "1 day"]);
    });
  });
});
