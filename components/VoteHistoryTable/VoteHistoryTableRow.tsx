import { Tooltip } from "components/Tooltip/Tooltip";
import { black, green, grey500, red500 } from "constant";
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
    resolvedPriceRequestIndex,
    voteHistory: { voted, correctness, staking, slashAmount },
  } = vote;
  const formattedSlashAmount = makeFormattedSlashAmount();
  const scoreColor = getScoreColor();

  function makeFormattedSlashAmount() {
    const formattedSlashAmount = formatNumberForDisplay(slashAmount);
    if (staking && (formattedSlashAmount === "0" || formattedSlashAmount === "-0")) return "pending";
    if (formattedSlashAmount === "-0") return "0";
    return formattedSlashAmount;
  }

  function getScoreColor() {
    if (formattedSlashAmount === "pending") return black;
    if (formattedSlashAmount === "0") return black;
    if (formattedSlashAmount.startsWith("-")) return red500;
    return green;
  }

  const pendingEarningsTooltip = "Your earnings will display as soon as you interact (commit or reveal) with the dApp."

  return (
    <Tr>
      <VoteNumberTd>
        {resolvedPriceRequestIndex ? (
          <VoteNumberButton onClick={onVoteClicked}>
            #{resolvedPriceRequestIndex}
          </VoteNumberButton>
        ) : (
          <Tooltip label="This vote is from version one (previous version) of the voting contract. Sequential vote numbers were introduced in version two (current version).">
            <VoteNumberV1>V1</VoteNumberV1>
          </Tooltip>
        )}
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
      <ScoreTd style={{ "--color": scoreColor } as CSSProperties}>
        {formattedSlashAmount === "pending" ? (
          <Tooltip label={pendingEarningsTooltip}>
            <PendingChip>Pending</PendingChip>
          </Tooltip>
        ) : (
          formattedSlashAmount
        )}
      </ScoreTd>
    </Tr>
  );
}

function getBarColor(value: boolean) {
  return value ? green : grey500;
}

// Styled Components
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

const VoteNumberV1 = styled.span`
  font: var(--text-sm);
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const PendingChip = styled.span`
  display: inline-block;
  padding: 2px 4px;
  font-size: 10px;
  font-weight: 800;
  color: var(--white);
  background: var(--grey-500);
  border-radius: 5px;
  text-transform: uppercase;
  text-align: center;
  cursor: default;
`;