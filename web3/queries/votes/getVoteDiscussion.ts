import * as ss from "superstruct";
import { VoteDiscussionT, L1Request } from "types";

export async function getVoteDiscussion(
  l1Request: L1Request
): Promise<VoteDiscussionT> {
  const response = await fetch(
    `/api/discord-thread?time=${l1Request.time}&identifier=${l1Request.identifier}`
  );

  if (!response.ok) {
    throw new Error("Getting discord threads failed with unknown error");
  }
  return ss.create(await response.json(), VoteDiscussionT);
}
