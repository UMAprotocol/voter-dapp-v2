import {
  Banner,
  HowItWorks,
  Layout,
  Loader,
  PageInnerWrapper,
  PageOuterWrapper,
  Votes,
} from "components";
import { Strong } from "components/pages/styles";
import { truncateDecimals } from "helpers";
import { useGlobals } from "hooks";
import type { NextPage } from "next";

const VotePage: NextPage = () => {
  const { data: globals } = useGlobals();
  const { annualPercentageReturn } = globals || {};
  return (
    <Layout title="UMA | Voting dApp">
      <Banner>
        Stake, vote &amp; earn up to{" "}
        <Loader dataToWatch={annualPercentageReturn}>
          <Strong>
            {truncateDecimals(annualPercentageReturn || 0, 0)}% APR
          </Strong>
        </Loader>
      </Banner>
      <PageOuterWrapper>
        <HowItWorks />
        <PageInnerWrapper>
          <Votes />
        </PageInnerWrapper>
      </PageOuterWrapper>
    </Layout>
  );
};

export default VotePage;
