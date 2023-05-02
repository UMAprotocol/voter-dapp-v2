import {
  Banner,
  HowItWorks,
  Layout,
  PageInnerWrapper,
  PageOuterWrapper,
  Votes,
} from "components";
import { Strong } from "components/pages/styles";
import { truncateDecimals } from "helpers";
import { useGlobals } from "hooks";
import type { NextPage } from "next";

const HomePage: NextPage = () => {
  const {
    data: { annualPercentageReturn },
  } = useGlobals();
  return (
    <Layout title="UMA | Voting dApp">
      <Banner>
        Stake, vote &amp; earn up to{" "}
        <Strong>{truncateDecimals(annualPercentageReturn, 0) || 0}% APR</Strong>
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

export default HomePage;
