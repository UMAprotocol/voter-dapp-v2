import styled from "styled-components";
import { ActivityStatusT } from "types";

interface Props {
  activityStatus: ActivityStatusT;
}
export function VotesTableHeadings({ activityStatus }: Props) {
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
    <Thead>
      <Tr>
        {headings.map((heading) => (
          <Th key={heading}>{heading}</Th>
        ))}
      </Tr>
    </Thead>
  );
}

const Thead = styled.thead``;

const Tr = styled.tr``;

const Th = styled.th`
  text-align: left;
  font: var(--text-sm);
`;
