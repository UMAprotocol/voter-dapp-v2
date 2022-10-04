import { green, grey500, red500 } from "constants/colors";
import { formatBigNumberForDisplay } from "helpers";
import { usePanelContext } from "hooks";
import { CSSProperties } from "react";
import styled from "styled-components";
import { VoteT } from "types";

export function VoteHistoryTable({ votes }: { votes: VoteT[] }) {
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
          <VoteHistoryRow
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

function VoteHistoryRow({ vote, onVoteClicked }: { vote: VoteT; onVoteClicked: () => void }) {
  if (!vote.voteHistory) return null;
  const {
    voteNumber,
    voteHistory: { voted, correctness, staking, slashAmount },
  } = vote;
  const scoreColor = slashAmount.lt(0) ? red500 : green;

  return (
    <Tr>
      <VoteNumberTd>
        <VoteNumberButton onClick={onVoteClicked}>
          #{formatBigNumberForDisplay(voteNumber, { isFormatEther: false })}
        </VoteNumberButton>
      </VoteNumberTd>
      <StakingTd>
        <Staking>
          <Bar value={staking} />
        </Staking>
      </StakingTd>
      <VotedTd>
        <Voted>
          <Bar value={voted} isMiddle={true} />
        </Voted>
      </VotedTd>
      <CorrectnessTd>
        <Correctness>
          <Bar value={correctness} />
        </Correctness>
      </CorrectnessTd>
      <ScoreTd style={{ "--color": scoreColor } as CSSProperties}>{formatBigNumberForDisplay(slashAmount)}</ScoreTd>
    </Tr>
  );
}

function getBarColor(value: boolean) {
  return value ? green : grey500;
}

const VoteNumberTd = styled.td``;

const VoteNumberButton = styled.button`
  font: var(--text-sm);
  background: transparent;
  &:hover {
    text-decoration: underline;
  }
`;

const ScoreTd = styled.td`
  text-align: right;
  font: var(--header-xs);
  font-size: 14px;
  color: var(--color);
`;

const Bar = styled.div<{ value: boolean; isMiddle?: boolean }>`
  height: 10px;
  background-color: ${({ value }) => getBarColor(value)};
  border-radius: 15px;
  ${({ isMiddle }) => isMiddle && "margin-inline: 1px"}
`;

const BarTd = styled.td``;

const BarInnerWrapper = styled.div`
  padding-block: 4px;
  border-top: 1px solid var(--grey-500);
  border-bottom: 1px solid var(--grey-500);
`;

const StakingTd = styled(BarTd)``;

const Staking = styled(BarInnerWrapper)`
  border-left: 1px solid var(--grey-500);
  padding-left: 5px;
  border-top-left-radius: 15px;
  border-bottom-left-radius: 15px;
`;

const VotedTd = styled(BarTd)``;

const Voted = styled(BarInnerWrapper)``;

const CorrectnessTd = styled(BarTd)``;

const Correctness = styled(BarInnerWrapper)`
  border-right: 1px solid var(--grey-500);
  padding-right: 5px;
  border-top-right-radius: 15px;
  border-bottom-right-radius: 15px;
`;

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
`;

const TheadTr = styled.tr`
  border-bottom: 1px solid var(--grey-500);
`;

const Tbody = styled.tbody``;

const Tr = styled.tr``;
