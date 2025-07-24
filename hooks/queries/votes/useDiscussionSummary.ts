import { useQuery } from "@tanstack/react-query";
import { discussionSummaryKey } from "constant";
import { L1Request } from "types";
import { getDiscussionSummary } from "web3";

export function useDiscussionSummary({ identifier, time, title }: L1Request) {
  return useQuery({
    queryKey: [discussionSummaryKey, identifier, time, title],
    queryFn: () => getDiscussionSummary({ identifier, time, title }),
    onError: (err) => console.error(err),
    refetchOnWindowFocus: true,
    refetchInterval: 20_000,
  });
}
