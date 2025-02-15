import { buildSearchParams } from "helpers/util/buildSearchParams";
import * as ss from "superstruct";
import { VoteDiscussionT, L1Request } from "types";

export async function getVoteDiscussion(
  l1Request: L1Request
): Promise<VoteDiscussionT> {
  const params = buildSearchParams({
    time: l1Request.time,
    identifier: l1Request.identifier,
    title: l1Request.title,
  });

  const response = await fetch(`/api/discord-thread?${params}`);

  if (!response.ok) {
    throw new Error("Getting discord threads failed with unknown error");
  }
  return ss.create(await response.json(), VoteDiscussionT);
}
