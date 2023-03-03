import { useQuery } from "@tanstack/react-query";
import { getVoteDiscussion } from "chain";
import { voteDiscussionKey } from "constant";
import { L1Request } from "types";

export function useVoteDiscussion({ identifier, time }: L1Request) {
  return useQuery({
    queryKey: [voteDiscussionKey, identifier, time],
    queryFn: () => getVoteDiscussion({ identifier, time }),
    onError: (err) => console.error(err),
    initialData: {
      identifier,
      time,
      thread: [],
    },
  });
}
