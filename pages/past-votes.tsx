import {
  Banner,
  Layout,
  PageInnerWrapper,
  PageOuterWrapper,
  PastVotes,
} from "components";
import type { NextPage } from "next";

const PastVotesPage: NextPage = () => {
  return (
    <Layout title="UMA | Past Votes">
      <Banner>Past Votes</Banner>
      <PageOuterWrapper>
        <PageInnerWrapper>
          <PastVotes />
        </PageInnerWrapper>
      </PageOuterWrapper>
    </Layout>
  );
};

export default PastVotesPage;
