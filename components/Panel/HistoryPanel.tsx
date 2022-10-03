import { black, green, red500 } from "constants/colors";
import { formatNumberForDisplay } from "helpers";
import { useUserContext, useVotesContext } from "hooks";
import styled, { CSSProperties } from "styled-components";
import { PanelTitle } from "./PanelTitle";
import { PanelWrapper } from "./styles";

export function HistoryPanel() {
  const { getPastVotes } = useVotesContext();
  const { apr, cumulativeCalculatedSlash, cumulativeCalculatedSlashPercentage, userDataFetching } = useUserContext();
  const userVoteHistory = getPastVotes().flatMap((vote) => vote.voteHistory ?? []);
  const bonusPenaltyHighlightColor = cumulativeCalculatedSlashPercentage?.eq(0)
    ? black
    : cumulativeCalculatedSlashPercentage?.gt(0)
    ? green
    : red500;

  return (
    <PanelWrapper>
      <PanelTitle title="History" />
      <AprWrapper>
        <AprHeader>Your return</AprHeader>
        <Apr>{formatNumberForDisplay(apr, { isEther: false })}%</Apr>
        <AprDetailsWrapper>
          <Text>
            <>Based on participation score = {formatNumberForDisplay(cumulativeCalculatedSlash, { isEther: false })}</>
          </Text>
          <Text>
            Your bonus/penalty ={" "}
            <BonusOrPenalty
              style={
                {
                  "--color": bonusPenaltyHighlightColor,
                } as CSSProperties
              }
            >
              {formatNumberForDisplay(cumulativeCalculatedSlashPercentage, { isEther: false })}%
            </BonusOrPenalty>
          </Text>
        </AprDetailsWrapper>
      </AprWrapper>
      {/* <HistoryWrapper>{JSON.stringify(userVoteHistory)}</HistoryWrapper> */}
    </PanelWrapper>
  );
}

const AprWrapper = styled.div`
  display: grid;
  place-items: center;
  height: 190px;
  padding: 30px;
  background: var(--red-500);
  color: var(--white);
`;

const AprHeader = styled.h2`
  font: var(--text-md);
`;

const Apr = styled.p`
  font: var(--header-lg);
`;

const AprDetailsWrapper = styled.div`
  display: grid;
  place-items: center;
  padding-block: 10px;
  min-width: 319px;
  background: var(--white);
  color: var(--black);
  border-radius: 5px;
`;

const Text = styled.p`
  font: var(--text-sm);
`;

const BonusOrPenalty = styled.span`
  color: var(--color);
`;

const HistoryWrapper = styled.div``;
