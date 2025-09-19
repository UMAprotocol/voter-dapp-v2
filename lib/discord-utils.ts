import { stripInvalidCharacters } from "./utils";

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

  // Find the last complete word within the limit
  const truncated = title.substring(0, titleMaxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");

  // If we found a space, truncate at that word boundary
  if (lastSpaceIndex > 0) {
    return title.substring(0, lastSpaceIndex);
  }

  // If no space found, truncate at the max length
  return truncated;
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
