import { useVotes } from "components/Votes/useVotes";
import { tabletMax } from "constant";
import { useWindowSize } from "usehooks-ts";
import { VotesDesktop } from "./VotesDesktop";
import { VotesMobile } from "./VotesMobile";

export type VotesListProps = ReturnType<typeof useVotes>;
export function VotesList(props: VotesListProps) {
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
