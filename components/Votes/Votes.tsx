import { LoadingSpinner } from "components";
import { LoadingSpinnerWrapper } from "components/pages/styles";
import { useVotesContext } from "hooks";
import { ActiveVotes } from "./ActiveVotes";
import { PastVotes } from "./PastVotes";
import { UpcomingVotes } from "./UpcomingVotes";

export function Votes() {
  const { activeVoteList, pastVoteList, upcomingVoteList } = useVotesContext();

  const hasActiveVotes = Boolean(activeVoteList?.length);
  const hasUpcomingVotes = Boolean(upcomingVoteList?.length);
  const hasPastVotes = Boolean(pastVoteList?.length);
  const hasAnyVotes = hasActiveVotes || hasUpcomingVotes || hasPastVotes;

  return (
    <>
      {hasActiveVotes && <ActiveVotes />}
      {hasUpcomingVotes && <UpcomingVotes />}
      {hasPastVotes && <PastVotes />}
      {!hasAnyVotes && (
        <LoadingSpinnerWrapper>
          <LoadingSpinner size={40} variant="black" />
        </LoadingSpinnerWrapper>
      )}
    </>
  );
}
