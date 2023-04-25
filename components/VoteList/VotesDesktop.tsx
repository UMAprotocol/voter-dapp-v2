import styled from "styled-components";
import { VoteListProps } from "./VoteList";
import { VoteTableRow } from "./VoteListItem/VoteTableRow";
import { VoteTableHeadings } from "./VoteTableHeadings";

export function VotesDesktop({
  votesToShow,
  activityStatus,
  ...delegated
}: VoteListProps) {
  return (
    <Wrapper>
      <VoteTableHeadings activityStatus={activityStatus} />
      <Tbody>
        {votesToShow?.map((vote) => (
          <VoteTableRow
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
