import { usePanelContext } from "hooks";
import styled from "styled-components";
import { VoteT } from "types";
import { VoteHistoryTableRow } from "./VoteHistoryTableRow";

interface Props {
  votes: VoteT[];
}
export function VoteHistoryTable({ votes }: Props) {
  const { openPanel } = usePanelContext();
  const headings = ["Vote", "Staking", "Voted", "Correctness", "Score"];

  return (
    <Table>
      <Thead>
        <TheadTr>
          {headings.map((heading) => (
            <Th scope="col" key={heading}>
              {heading}
            </Th>
          ))}
        </TheadTr>
      </Thead>
      <Tbody>
        {votes.map((vote) => (
          <VoteHistoryTableRow
            vote={vote}
            key={vote.uniqueKey}
            onVoteClicked={() => {
              openPanel("vote", vote);
            }}
          />
        ))}
      </Tbody>
    </Table>
  );
}

const Table = styled.table`
  table-layout: fixed;
  width: 100%;
  border-spacing: 0 5px;
`;

const Thead = styled.thead``;

const Th = styled.th`
  font: var(--text-xs);
  text-align: left;

  &:last-child {
    text-align: right;
  }

  /* special media query only needed here for very small screens */
  @media (max-width: 320px) {
    --bar-width: 20%;
    &:nth-child(1) {
      width: 15%;
    }
    &:nth-child(2) {
      width: var(--bar-width);
    }
    &:nth-child(3) {
      width: var(--bar-width);
    }
    &:nth-child(4) {
      width: var(--bar-width);
    }
  }
`;

const TheadTr = styled.tr`
  border-bottom: 1px solid var(--grey-500);
`;

const Tbody = styled.tbody``;
