import styled from "styled-components";
import { ActivityStatusT, VotePhaseT } from "types";

interface Props {
  activityStatus: ActivityStatusT;
  phase?: VotePhaseT;
}
export function VoteTableHeadings({ activityStatus, phase }: Props) {
  const activeHeadings =
    phase === "reveal"
      ? ["Vote", "Your vote", "Reveal action", "Vote status"]
      : ["Vote", "Your vote", "Vote status"];
  const upcomingHeadings = ["Vote"];
  const pastHeadings = ["Vote", "Your vote", "Correct vote"];
  const headings =
    activityStatus === "active"
      ? activeHeadings
      : activityStatus === "upcoming"
      ? upcomingHeadings
      : pastHeadings;
  return (
    <Wrapper>
      {headings.map((heading) => (
        <Heading key={heading}>{heading}</Heading>
      ))}
    </Wrapper>
  );
}

const Wrapper = styled.tr``;

const Heading = styled.th`
  text-align: left;
  font: var(--text-sm);
`;
