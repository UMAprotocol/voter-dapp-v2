import styled from "styled-components";
import { ActivityStatusT } from "types";

interface Props {
  activityStatus: ActivityStatusT;
}
export function VoteTableHeadings({ activityStatus }: Props) {
  const activeHeadings = ["Vote", "Your vote", "Vote status"];
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
