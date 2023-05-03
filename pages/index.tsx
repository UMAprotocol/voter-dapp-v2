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
import { LoadingSpinnerWrapper, Strong } from "components/style";
import { truncateDecimals } from "helpers";
import { useGlobals, useVotesContext } from "hooks";
import type { NextPage } from "next";

const HomePage: NextPage = () => {
  const {
    data: { annualPercentageReturn },
  } = useGlobals();
  const { activeVoteList, upcomingVoteList, getUserIndependentIsLoading } =
    useVotesContext();
  const isLoading = getUserIndependentIsLoading();
  const hasActiveVotes = activeVoteList.length > 0;
  const hasUpcomingVotes = upcomingVoteList.length > 0;

  return (
    <Layout title="UMA | Voting dApp">
      <Banner>
        Stake, vote &amp; earn up to{" "}
        <Strong>{truncateDecimals(annualPercentageReturn, 0) || 0}% APR</Strong>
      </Banner>
      <PageOuterWrapper>
        <HowItWorks />
        <PageInnerWrapper>
          {isLoading ? (
            <LoadingSpinnerWrapper>
              <LoadingSpinner size={40} variant="black" />
            </LoadingSpinnerWrapper>
          ) : (
            <>
              {hasActiveVotes && <ActiveVotes />}
              {hasUpcomingVotes && <UpcomingVotes isHomePage={true} />}
              {/* There will always be past votes, so no need to check if they exist */}
              <PastVotes isHomePage={true} />
            </>
          )}
        </PageInnerWrapper>
      </PageOuterWrapper>
    </Layout>
  );
};

export default HomePage;
