import styled from "styled-components";
import { VotesListProps } from "./VotesList";
import { VotesTableHeadings } from "./VotesTableHeadings";
import { VotesTableRow } from "./VotesTableRow";

export function VotesDesktop({
  votesToShow,
  activityStatus,
  ...delegated
}: VotesListProps) {
  return (
    <Wrapper>
      <VotesTableHeadings activityStatus={activityStatus} />
      <Tbody>
        {votesToShow?.map((vote) => (
          <VotesTableRow
            key={vote.uniqueKey}
            vote={vote}
            activityStatus={activityStatus}
            {...delegated}
          />
        ))}
      </Tbody>
    </Wrapper>
  );
}

const Wrapper = styled.table`
  width: 100%;
  border-spacing: 0 5px;
`;

const Tbody = styled.tbody``;
