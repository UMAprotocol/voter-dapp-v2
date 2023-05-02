import {
  ActiveVotes,
  Banner,
  HowItWorks,
  Layout,
  LoadingSpinner,
  PageInnerWrapper,
  PageOuterWrapper,
  PastVotes,
  UpcomingVotes,
} from "components";
import { LoadingSpinnerWrapper, Strong } from "components/pages/styles";
import { truncateDecimals } from "helpers";
import { useGlobals, useVotesContext } from "hooks";
import type { NextPage } from "next";

const HomePage: NextPage = () => {
  const {
    data: { annualPercentageReturn },
  } = useGlobals();
  const { activeVoteList, pastVoteList, upcomingVoteList } = useVotesContext();

  const hasActiveVotes = activeVoteList.length > 0;
  const hasUpcomingVotes = upcomingVoteList.length > 0;
  const hasPastVotes = pastVoteList.length > 0;
  const hasAnyVotes = hasActiveVotes || hasUpcomingVotes || hasPastVotes;
  return (
    <Layout title="UMA | Voting dApp">
      <Banner>
        Stake, vote &amp; earn up to{" "}
        <Strong>{truncateDecimals(annualPercentageReturn, 0) || 0}% APR</Strong>
      </Banner>
      <PageOuterWrapper>
        <HowItWorks />
        <PageInnerWrapper>
          {hasActiveVotes && <ActiveVotes />}
          {hasUpcomingVotes && <UpcomingVotes />}
          {hasPastVotes && <PastVotes />}
          {!hasAnyVotes && (
            <LoadingSpinnerWrapper>
              <LoadingSpinner size={40} variant="black" />
            </LoadingSpinnerWrapper>
          )}
        </PageInnerWrapper>
      </PageOuterWrapper>
    </Layout>
  );
};

export default HomePage;
