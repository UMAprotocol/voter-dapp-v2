import { VoteHistoryTable } from "components/VoteHistoryTable/VoteHistoryTable";
import { black, green, red500 } from "constants/colors";
import { formatNumberForDisplay } from "helpers";
import { useUserContext, useVotesContext } from "hooks";
import styled, { CSSProperties } from "styled-components";
import { PanelFooter } from "./PanelFooter";
import { PanelTitle } from "./PanelTitle";
import { PanelSectionText, PanelSectionTitle, PanelWrapper } from "./styles";

export function HistoryPanel() {
  const { getPastVotes } = useVotesContext();
  const { apr, cumulativeCalculatedSlash, cumulativeCalculatedSlashPercentage, userDataFetching } = useUserContext();
  const bonusPenaltyHighlightColor = cumulativeCalculatedSlashPercentage?.eq(0)
    ? black
    : cumulativeCalculatedSlashPercentage?.gt(0)
    ? green
    : red500;

  return (
    <PanelWrapper>
      <PanelTitle title="History" />
      <SectionsWrapper>
        <AprWrapper>
          <AprHeader>Your return</AprHeader>
          <Apr>{formatNumberForDisplay(apr, { isEther: false })}%</Apr>
          <AprDetailsWrapper>
            <Text>
              <>
                Based on participation score = {formatNumberForDisplay(cumulativeCalculatedSlash, { isEther: false })}
              </>
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
        <SectionWrapper>
          <PanelSectionText>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit enim voluptate rem perferendis
            numquam, consequuntur sapiente nesciunt laudantium quibusdam pariatur.
          </PanelSectionText>
        </SectionWrapper>
        <SectionWrapper>
          <PanelSectionTitle>Voting history</PanelSectionTitle>
          <HistoryWrapper>
            <VoteHistoryTable votes={getPastVotes()} />
          </HistoryWrapper>
        </SectionWrapper>
      </SectionsWrapper>
      <PanelFooter />
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

const SectionWrapper = styled.div`
  margin-inline: 30px;
  margin-top: 15px;
`;

const SectionsWrapper = styled.div``;

const AprHeader = styled.h2`
  font: var(--text-md);
`;

const Apr = styled.p`
  font: var(--header-lg);
  margin-bottom: 5px;
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
