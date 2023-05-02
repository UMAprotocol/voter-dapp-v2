import { useVoteList } from "components/Votes/useVoteList";
import { tabletMax } from "constant";
import { VoteT } from "types";
import { useWindowSize } from "usehooks-ts";
import { VotesDesktop } from "./VotesDesktop";
import { VotesMobile } from "./VotesMobile";

export type VoteListProps = ReturnType<typeof useVoteList> & {
  votesToShow: VoteT[];
};
export function VoteList(props: VoteListProps) {
  const { width } = useWindowSize();

  if (width === undefined || width === 0) return null;

  const isMobile = width <= tabletMax;
  const isDesktop = width > tabletMax;

  return (
    <>
      {isDesktop && <VotesDesktop {...props} />}
      {isMobile && <VotesMobile {...props} />}
    </>
  );
}
