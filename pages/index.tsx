import {
  ActiveVotes,
  Banner,
  HowItWorks,
  Layout,
  Loader,
  LoadingSpinner,
  LoadingSpinnerWrapper,
  PageInnerWrapper,
  PageOuterWrapper,
  PastVotes,
  Strong,
  UpcomingVotes,
} from "components";
import { truncateDecimals } from "helpers";
import { useGlobals, useVotesContext } from "hooks";
import type { NextPage } from "next";

const HomePage: NextPage = () => {
  const { data: annualPercentageReturnResult, isLoading: aprIsLoading } =
    useGlobals();
  const { annualPercentageReturn } = annualPercentageReturnResult || {};
  const { activeVoteList, upcomingVoteList, activeVotesIsLoading } =
    useVotesContext();
  const hasActiveVotes = activeVoteList.length > 0;
  const hasUpcomingVotes = upcomingVoteList.length > 0;

  return (
    <Layout title="UMA | Voting dApp">
      <Banner>
        Stake, vote &amp; earn up to{" "}
        <Loader isLoading={aprIsLoading}>
          <Strong>
            {truncateDecimals(annualPercentageReturn ?? 0, 0)}% APR
          </Strong>
        </Loader>
      </Banner>
      <PageOuterWrapper>
        <HowItWorks />
        <PageInnerWrapper>
          {activeVotesIsLoading ? (
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
