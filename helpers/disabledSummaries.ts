export function isDiscordSummaryDisabled(cacheKey: string): boolean {
  const disabledList = process.env.DISABLED_DISCORD_SUMMARY || "";

  if (!disabledList) {
    return false;
  }

  // Extract the key part after "discord-summary:"
  const keyPart = cacheKey.replace("discord-summary:", "");

  // Split the disabled list by comma and check if the key is in the list
  const disabledKeys = disabledList.split(",").map((key) => key.trim());

  return disabledKeys.includes(keyPart);
}

export function formatDisabledSummaryKey(
  time: string,
  identifier: string,
  title: string
): string {
  return `${time}:${identifier}:${title}`;
}
