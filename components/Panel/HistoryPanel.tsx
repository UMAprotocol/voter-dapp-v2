import { LoadingSkeleton } from "components/LoadingSkeleton";
import { LoadingSpinner } from "components/LoadingSpinner";
import { VoteHistoryTable } from "components/VoteHistoryTable/VoteHistoryTable";
import { black, green, red500 } from "constants/colors";
import { formatNumberForDisplay } from "helpers";
import { useUserContext, useVotesContext } from "hooks";
import styled, { CSSProperties } from "styled-components";
import { VoteT } from "types";
import { PanelFooter } from "./PanelFooter";
import { PanelTitle } from "./PanelTitle";
import { PanelSectionText, PanelSectionTitle, PanelWrapper } from "./styles";

export function HistoryPanel() {
  const { getPastVotes, getIsFetching } = useVotesContext();
  const { apr, cumulativeCalculatedSlash, cumulativeCalculatedSlashPercentage, userDataFetching } = useUserContext();
  const bonusPenaltyHighlightColor = cumulativeCalculatedSlashPercentage?.eq(0)
    ? black
    : cumulativeCalculatedSlashPercentage?.gt(0)
    ? green
    : red500;

  function isLoading() {
    return getIsFetching() || userDataFetching;
  }

  return (
    <PanelWrapper>
      <PanelTitle title="History" />
      <SectionsWrapper>
        <AprWrapper>
          <AprHeader>Your return</AprHeader>
          <Apr>
            {isLoading() ? (
              <LoadingSkeleton variant="white" width={150} height={35} />
            ) : (
              `${formatNumberForDisplay(apr)}%`
            )}
          </Apr>
          <AprDetailsWrapper>
            <Text>
              <>
                Based on participation score ={" "}
                {isLoading() ? (
                  <LoadingSkeleton width={60} height={15} />
                ) : (
                  formatNumberForDisplay(cumulativeCalculatedSlash)
                )}
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
                {isLoading() ? (
                  <LoadingSkeleton width={60} height={15} />
                ) : (
                  `${formatNumberForDisplay(cumulativeCalculatedSlashPercentage)}%`
                )}
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
            {isLoading() ? (
              <LoadingSpinner size={250} />
            ) : (
              <VoteHistoryTable votes={getPastVotes().sort(sortVotesByVoteNumber)} />
            )}
          </HistoryWrapper>
        </SectionWrapper>
      </SectionsWrapper>
      <PanelFooter />
    </PanelWrapper>
  );
}

function sortVotesByVoteNumber(a: VoteT, b: VoteT) {
  return a.voteNumber.toNumber() - b.voteNumber.toNumber();
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

const HistoryWrapper = styled.div`
  display: grid;
  place-items: center;
`;
