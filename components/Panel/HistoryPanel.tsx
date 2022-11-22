import {
  LoadingSkeleton,
  LoadingSpinner,
  Pagination,
  VoteHistoryTable,
} from "components";
import {
  black,
  defaultResultsPerPage,
  green,
  mobileAndUnder,
  red500,
} from "constant";
import { formatNumberForDisplay, getEntriesForPage } from "helpers";
import { usePaginationContext, useUserContext, useVotesContext } from "hooks";
import styled, { CSSProperties } from "styled-components";
import { PanelFooter } from "./PanelFooter";
import { PanelTitle } from "./PanelTitle";
import { PanelSectionText, PanelSectionTitle, PanelWrapper } from "./styles";

export function HistoryPanel() {
  const { getPastVotes } = useVotesContext();
  const {
    apr,
    cumulativeCalculatedSlash,
    cumulativeCalculatedSlashPercentage,
    userDataFetching,
  } = useUserContext();
  const {
    pageStates: {
      voteHistoryPage: { resultsPerPage, pageNumber },
    },
  } = usePaginationContext();

  const pastVotes = getPastVotes();
  const numberOfPastVotes = pastVotes.length;
  const votesToShow = getEntriesForPage(pageNumber, resultsPerPage, pastVotes);

  const bonusPenaltyHighlightColor = cumulativeCalculatedSlashPercentage?.eq(0)
    ? black
    : cumulativeCalculatedSlashPercentage?.gt(0)
    ? green
    : red500;

  function isLoading() {
    return userDataFetching;
  }

  return (
    <PanelWrapper>
      <PanelTitle title="History" />
      <SectionsWrapper>
        <AprWrapper>
          <AprHeader>Your return</AprHeader>
          <Apr>
            {isLoading() ? (
              <LoadingSkeleton variant="white" width="50%" />
            ) : (
              `${formatNumberForDisplay(apr)}%`
            )}
          </Apr>
          <AprDetailsWrapper>
            <Text>
              <>
                Based on participation score:{" "}
                {isLoading() ? (
                  <LoadingSkeleton width={40} />
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
                  <LoadingSkeleton width={40} />
                ) : (
                  `${formatNumberForDisplay(
                    cumulativeCalculatedSlashPercentage
                  )}%`
                )}
              </BonusOrPenalty>
            </Text>
          </AprDetailsWrapper>
        </AprWrapper>
        <SectionWrapper>
          <PanelSectionText>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Reprehenderit enim voluptate rem perferendis numquam, consequuntur
            sapiente nesciunt laudantium quibusdam pariatur.
          </PanelSectionText>
        </SectionWrapper>
        <SectionWrapper>
          <PanelSectionTitle>Voting history</PanelSectionTitle>
          <HistoryWrapper>
            {isLoading() ? (
              <LoadingSpinner size={40} />
            ) : (
              <VoteHistoryTable votes={votesToShow} />
            )}
          </HistoryWrapper>
          {numberOfPastVotes > defaultResultsPerPage && (
            <PaginationWrapper>
              <Pagination
                paginateFor="voteHistoryPage"
                numberOfEntries={numberOfPastVotes}
              />
            </PaginationWrapper>
          )}
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

  @media ${mobileAndUnder} {
    margin-inline: 15px;
  }
`;

const SectionsWrapper = styled.div``;

const AprHeader = styled.h2`
  font: var(--text-md);
`;

const Apr = styled.p`
  width: 100%;
  text-align: center;
  font: var(--header-lg);
  margin-bottom: 5px;
`;

const AprDetailsWrapper = styled.div`
  display: grid;
  place-items: center;
  padding-block: 10px;
  padding-inline: 15px;
  background: var(--white);
  color: var(--black);
  border-radius: 5px;
`;

const PaginationWrapper = styled.div`
  margin-top: 10px;
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
