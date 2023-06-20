import styled from "styled-components";
import { VoteT } from "types";
import { VoteListProps } from "../shared";
import { VoteTableHeadings } from "./VoteTableHeadings";
import { VoteTableRow } from "./VoteTableRow";

export function VotesDesktop({
  votesToShow,
  activityStatus,
  ...delegated
}: VoteListProps & { votesToShow: VoteT[] }) {
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
