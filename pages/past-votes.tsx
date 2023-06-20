import {
  Banner,
  Layout,
  LoadingSpinner,
  PageInnerWrapper,
  PageOuterWrapper,
  PastVotes,
} from "components";
import { LoadingSpinnerWrapper } from "components";
import { useVotesContext } from "hooks";
import type { NextPage } from "next";

const PastVotesPage: NextPage = () => {
  const { pastVotesIsLoading } = useVotesContext();

  return (
    <Layout title="UMA | Past Votes">
      <Banner>Past Votes</Banner>
      <PageOuterWrapper>
        <PageInnerWrapper>
          {pastVotesIsLoading ? (
            <LoadingSpinnerWrapper>
              <LoadingSpinner size={40} variant="black" />
            </LoadingSpinnerWrapper>
          ) : (
            <PastVotes />
          )}
        </PageInnerWrapper>
      </PageOuterWrapper>
    </Layout>
  );
};

export default PastVotesPage;
