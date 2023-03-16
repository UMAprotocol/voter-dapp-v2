import styled from "styled-components";

import { ActiveVotes } from "./ActiveVotes";
import { PastVotes } from "./PastVotes";
import { UpcomingVotes } from "./UpcomingVotes";
import { useVotesContext } from "hooks";
import { VoteTimeline } from "components";

export function Votes() {
  const {
    hasActiveVotes,
    hasUpcomingVotes,
    getActiveVotes,
    getUpcomingVotes,
    getPastVotes,
  } = useVotesContext();

  const pastVotes = getPastVotes().slice(0, 5);
  const pastVotesComponent = pastVotes.length ? (
    <PastVotes votes={pastVotes} />
  ) : null;
  const upcomingVotes = getUpcomingVotes();
  const activeVotes = getActiveVotes();
  if (hasActiveVotes && hasUpcomingVotes) {
    return (
      <>
        <ActiveVotes votes={activeVotes}>
          <VoteTimeline />
        </ActiveVotes>
        <Divider />
        <UpcomingVotes votes={upcomingVotes} />
        <Divider />
        {pastVotesComponent}
      </>
    );
  } else if (hasActiveVotes) {
    return (
      <>
        <ActiveVotes votes={activeVotes}>
          <VoteTimeline />
        </ActiveVotes>
        <Divider />
        {pastVotesComponent}
      </>
    );
  } else if (hasUpcomingVotes) {
    return (
      <>
        <UpcomingVotes votes={upcomingVotes}>
          <VoteTimeline />
        </UpcomingVotes>
        <Divider />
        {pastVotesComponent}
      </>
    );
  }
  return <PastVotes votes={pastVotes} />;
}
const Divider = styled.div`
  height: 1px;
  margin-top: 45px;
  margin-bottom: 45px;
  background: var(--black-opacity-25);
`;
