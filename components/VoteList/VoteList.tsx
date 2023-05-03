import { tabletAndUnder, tabletMax } from "constant";
import { useWindowSize } from "hooks";
import styled from "styled-components";
import { VoteListItem } from "./VoteListItem";
import { VoteTableHeadings } from "./VoteTableHeadings";
import { VoteListProps } from "./useVoteList";

export function VoteList({
  votesToShow,
  activityStatus,
  ...delegated
}: VoteListProps) {
  const { width } = useWindowSize();

  if (!width) return null;

  const isTabletAndUnder = width <= tabletMax;

  const items = votesToShow.map((vote) => (
    <VoteListItem
      key={vote.uniqueKey}
      vote={vote}
      activityStatus={activityStatus}
      {...delegated}
    />
  ));

  return (
    <Wrapper as={isTabletAndUnder ? "div" : "table"}>
      {!isTabletAndUnder && (
        <Thead>
          <VoteTableHeadings activityStatus={activityStatus} />
        </Thead>
      )}
      {isTabletAndUnder ? <>{items}</> : <Tbody>{items}</Tbody>}
    </Wrapper>
  );
}

const Wrapper = styled.table`
  width: 100%;
  border-spacing: 0 5px;

  @media ${tabletAndUnder} {
    display: grid;
    gap: 5px;
  }
`;

const Thead = styled.thead``;

const Tbody = styled.tbody``;
