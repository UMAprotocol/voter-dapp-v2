import { stripInvalidCharacters } from "./utils";

// Discord epoch (January 1, 2015 00:00:00 UTC) used for snowflake ID conversion
const DISCORD_EPOCH = BigInt(1420070400000);

/**
 * Extracts the timestamp (in ms) from a Discord snowflake ID.
 * Snowflakes encode the creation timestamp in the high 42 bits.
 */
export function getTimestampFromSnowflake(snowflake: string): number {
  return Number((BigInt(snowflake) >> BigInt(22)) + DISCORD_EPOCH);
}

/**
 * Creates a Discord snowflake ID from a timestamp.
 * Useful for testing and for creating "after" cursors.
 */
export function createSnowflakeFromTimestamp(timestampMs: number): string {
  const snowflake = (BigInt(timestampMs) - DISCORD_EPOCH) << BigInt(22);
  return snowflake.toString();
}

// Discord truncation utility functions
// These are pure functions that don't depend on external services
function truncateTitle(title: string) {
  // Discord thread title limit is 100 characters total
  // We need to account for " - " (3 chars) + timestamp (10 chars) = 13 chars
  // So the title absolute maximum is 87 characters
  const titleMaxLength = 87;

  if (title.length <= titleMaxLength) {
    return title;
  }

  return `${title.substring(0, titleMaxLength - 3)}...`; // 3 char accounts for ellipsis
}

export function makeKey(title: string, timestamp: string | number): string {
  const cleanedTitle = stripInvalidCharacters(truncateTitle(title));
  return `${cleanedTitle}-${String(timestamp)}`.replaceAll(" ", "");
}

export function extractValidateTitleAndTimestamp(msg?: string): string | null {
  // All messages are structured with the unixtimestamp at the end, such as
  // Across Dispute November 24th 2022 at 1669328675
  if (!msg) return null;
  const time = parseInt(msg.substring(msg.length - 10, msg.length));
  const title = msg.slice(0, -13);

  // All times must be newer than 2021-01-01 and older than the current time.
  const isTimeValid =
    new Date(time).getTime() > 1577858461 && time < Date.now();

  // use "title-timestamp" to find thread
  return isTimeValid ? makeKey(title, time) : null;
}
