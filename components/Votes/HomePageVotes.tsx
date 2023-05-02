import { LoadingSpinner } from "components";
import { LoadingSpinnerWrapper } from "components/pages/styles";
import { useVotesContext } from "hooks";
import { ActiveVotes } from "./ActiveVotes";
import { PastVotes } from "./PastVotes";
import { UpcomingVotes } from "./UpcomingVotes";

export function HomePageVotes() {
  const { activeVoteList, pastVoteList, upcomingVoteList } = useVotesContext();

  const hasActiveVotes = activeVoteList.length > 0;
  const hasUpcomingVotes = upcomingVoteList.length > 0;
  const hasPastVotes = pastVoteList.length > 0;
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
