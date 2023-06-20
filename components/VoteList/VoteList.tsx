import { tabletMax } from "constant";
import { VoteT } from "types";
import { useWindowSize } from "usehooks-ts";
import { VotesDesktop } from "./desktop";
import { VotesMobile } from "./mobile";
import { VoteListProps } from "./shared";

export function VoteList(props: VoteListProps & { votesToShow: VoteT[] }) {
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
