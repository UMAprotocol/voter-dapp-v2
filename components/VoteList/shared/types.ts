import { VoteT } from "types";
import { useVoteList, useVoteListItem } from ".";

export type VoteListProps = ReturnType<typeof useVoteList>;
export type VoteListItemProps = VoteListProps & { vote: VoteT };
export type VoteListItemState = ReturnType<typeof useVoteListItem>;
