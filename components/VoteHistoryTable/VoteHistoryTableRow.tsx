import { green, grey500, red500 } from "constant";
import { formatNumberForDisplay } from "helpers";
import { CSSProperties } from "react";
import styled from "styled-components";
import { VoteT } from "types";

interface Props {
  vote: VoteT;
  onVoteClicked: () => void;
}
export function VoteHistoryTableRow({ vote, onVoteClicked }: Props) {
  const {
    voteNumber,
    voteHistory: { voted, correctness, staking, slashAmount },
  } = vote;
  const scoreColor = slashAmount.lt(0) ? red500 : green;

  return (
    <Tr>
      <VoteNumberTd>
        <VoteNumberButton onClick={onVoteClicked}>
          #{formatNumberForDisplay(voteNumber, { isFormatEther: false })}
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
      <ScoreTd style={{ "--color": scoreColor } as CSSProperties}>{formatNumberForDisplay(slashAmount)}</ScoreTd>
    </Tr>
  );
}

function getBarColor(value: boolean) {
  return value ? green : grey500;
}

const BarInnerWrapper = styled.div`
  padding-block: 4px;
  border-top: 1px solid var(--grey-500);
  border-bottom: 1px solid var(--grey-500);
`;

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

const Tr = styled.tr``;
