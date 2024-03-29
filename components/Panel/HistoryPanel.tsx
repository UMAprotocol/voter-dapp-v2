import {
  Loader,
  LoadingSpinner,
  Pagination,
  VoteHistoryTable,
  usePagination,
} from "components";
import { black, green, mobileAndUnder, red500 } from "constant";
import { formatNumberForDisplay } from "helpers";
import {
  useAccountDetails,
  useDelegationContext,
  useUserVotingAndStakingDetails,
  useVotesContext,
} from "hooks";
import { isUndefined } from "lodash";
import NextLink from "next/link";
import styled, { CSSProperties } from "styled-components";
import { PanelFooter } from "./PanelFooter";
import { PanelTitle } from "./PanelTitle";
import { PanelSectionText, PanelSectionTitle, PanelWrapper } from "./styles";

export function HistoryPanel() {
  const { pastVotesV2List } = useVotesContext();
  const { address } = useAccountDetails();
  const { isDelegate, delegatorAddress } = useDelegationContext();
  const { data: votingAndStakingDetails } = useUserVotingAndStakingDetails(
    isDelegate ? delegatorAddress : address
  );
  const {
    apr,
    cumulativeCalculatedSlash,
    cumulativeCalculatedSlashPercentage,
  } = votingAndStakingDetails ?? {};
  const { showPagination, entriesToShow, ...paginationProps } = usePagination(
    pastVotesV2List ?? []
  );

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
          <Apr>
            <Loader isLoading={isUndefined(apr)} variant="white" width="50%">
              {formatNumberForDisplay(apr)}%
            </Loader>
          </Apr>
          <AprDetailsWrapper>
            <Text>
              <>
                Earnings based on participation:{" "}
                <Loader
                  isLoading={isUndefined(cumulativeCalculatedSlash)}
                  width={40}
                >
                  {formatNumberForDisplay(cumulativeCalculatedSlash)}
                </Loader>
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
                <Loader
                  isLoading={isUndefined(cumulativeCalculatedSlashPercentage)}
                  width={40}
                >
                  {formatNumberForDisplay(cumulativeCalculatedSlashPercentage)}%
                </Loader>
              </BonusOrPenalty>
            </Text>
          </AprDetailsWrapper>
        </AprWrapper>
        <SectionWrapper>
          <PanelSectionText>
            All voters receive a continuous emissions reward simply for being
            staked, but a voters performance in each vote round is used in
            determining reallocation amounts. If a voter misses or gets a vote
            wrong, they will lose a small portion of their stake. Conversely, if
            a voter votes correctly in a round, they will receive a pro-rata
            share of the reallocated stake from incorrect voters. For more
            information on vote history and how APY is calculated,{" "}
            <Link
              href="https://docs.uma.xyz/protocol-overview/dvm-2.0#vote-delegation"
              target="_blank"
            >
              refer here.
            </Link>
          </PanelSectionText>
        </SectionWrapper>
        <SectionWrapper>
          <PanelSectionTitle>Voting history</PanelSectionTitle>
          <HistoryWrapper>
            {isUndefined(pastVotesV2List) ? (
              <LoadingSpinner size={40} />
            ) : (
              <VoteHistoryTable votes={entriesToShow} />
            )}
          </HistoryWrapper>
          {showPagination && (
            <PaginationWrapper>
              <Pagination {...paginationProps} />
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
const Link = styled(NextLink)`
  color: var(--red-500);
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;
