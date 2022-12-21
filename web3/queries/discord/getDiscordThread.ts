import * as ss from "superstruct";
import { DiscordThreadT, L1Request } from "types";

export async function getDiscordThread(
  l1Request: L1Request
): Promise<DiscordThreadT> {
  const response = await fetch("/api/discord-thread", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ l1Request }),
  });

  if (!response.ok) {
    throw new Error("Getting discord threads failed with unknown error");
  }
  return ss.create(await response.json(), DiscordThreadT);
}
