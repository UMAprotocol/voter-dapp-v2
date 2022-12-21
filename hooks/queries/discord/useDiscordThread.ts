import { useQuery } from "@tanstack/react-query";
import { getDiscordThread } from "web3";
import { L1Request } from "types";

export function useDiscordThread(params: L1Request) {
  return useQuery({
    queryKey: ["discordThread", params.identifier, params.time],
    queryFn: () => getDiscordThread(params),
    onError: (err) => console.error(err),
  });
}
