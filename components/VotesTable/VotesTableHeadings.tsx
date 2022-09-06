import styled from "styled-components";
import { ActivityStatusT } from "types/global";

interface Props {
  activityStatus: ActivityStatusT;
}
export default function VotesTableHeadings({ activityStatus }: Props) {
  const activeHeadings = ["Vote", "Your vote", "Vote status"];
  const upcomingHeadings = ["Vote"];
  const pastHeadings = ["Vote", "Your vote", "Correct vote"];
  const headings =
    activityStatus === "active" ? activeHeadings : activityStatus === "upcoming" ? upcomingHeadings : pastHeadings;
  return (
    <Wrapper>
      {headings.map((heading) => (
        <Heading scope="col" key={heading}>
          {heading}
        </Heading>
      ))}
    </Wrapper>
  );
}

const Wrapper = styled.tr``;

const Heading = styled.th`
  text-align: left;
  font: var(--text-sm);
  &:first-child {
    width: 45%;
    padding-left: 30px;
  }
  &:nth-child(2) {
    width: 240px;
  }
  &:nth-child(3) {
    padding-left: 30px;
  }
`;
