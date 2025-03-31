import { useQuery } from "@tanstack/react-query";
import { voteDiscussionKey } from "constant";
import { L1Request } from "types";
import { getVoteDiscussion } from "web3";

export function useVoteDiscussion({ identifier, time, title }: L1Request) {
  return useQuery({
    queryKey: [voteDiscussionKey, identifier, time, title],
    queryFn: () => getVoteDiscussion({ identifier, time, title }),
    onError: (err) => console.error(err),
    refetchOnWindowFocus: true,
    refetchInterval: 20_000,
  });
}
