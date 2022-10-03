import { green, grey500 } from "constants/colors";
import { formatNumberForDisplay } from "helpers";
import styled, { CSSProperties } from "styled-components";
import { VoteT } from "types";

export function VoteHistoryTable({ votes }: { votes: VoteT[] }) {
  const headings = ["Vote", "Staking", "Voted", "Correctness", "Score"];
  return (
    <Table>
      <Thead>
        {headings.map((heading) => (
          <Th scope="col" key={heading}>
            {heading}
          </Th>
        ))}
      </Thead>
      <Tbody>
        {votes.map((vote) => (
          <VoteHistoryRow vote={vote} key={vote.uniqueKey} />
        ))}
      </Tbody>
    </Table>
  );
}

function VoteHistoryRow({ vote }: { vote: VoteT }) {
  if (!vote.voteHistory) return null;
  const {
    voteNumber,
    voteHistory: { voted, correctness, staking, slashAmount },
  } = vote;

  function getBarColor(value: boolean) {
    return value ? green : grey500;
  }

  return (
    <Tr>
      <VoteNumberTd>{formatNumberForDisplay(voteNumber, { isEther: false })}</VoteNumberTd>
      <StakingTd
        style={
          {
            "--bar-color": getBarColor(staking),
          } as CSSProperties
        }
      >
        {staking}
      </StakingTd>
      <VotedTd
        style={
          {
            "--bar-color": getBarColor(voted),
          } as CSSProperties
        }
      >
        {voted}
      </VotedTd>
      <CorrectnessTd
        style={
          {
            "--bar-color": getBarColor(correctness),
          } as CSSProperties
        }
      >
        {correctness}
      </CorrectnessTd>
      <ScoreTd>{formatNumberForDisplay(slashAmount, { isEther: false })}</ScoreTd>
    </Tr>
  );
}

const VoteNumberTd = styled.td``;

const ScoreTd = styled.td``;

const GreenBarTd = styled.td``;

const StakingTd = styled(GreenBarTd)``;

const VotedTd = styled(GreenBarTd)``;

const CorrectnessTd = styled(GreenBarTd)``;

const Table = styled.table`
  table-layout: fixed;
  width: 100%;
  border-spacing: 0 5px;
`;

const Thead = styled.thead``;

const Th = styled.th``;

const Tbody = styled.tbody``;

const Tr = styled.tr``;
