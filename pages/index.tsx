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
import { isUndefined } from "lodash";
import type { NextPage } from "next";
import styled from "styled-components";

const VotePage: NextPage = () => {
  const { data: globals } = useGlobals();
  const { annualPercentageReturn } = globals || {};
  return (
    <Layout title="UMA | Voting dApp">
      <Banner>
        Stake, vote &amp; earn up to{" "}
        <Loader isLoading={isUndefined(annualPercentageReturn)}>
          <Strong>
            {truncateDecimals(annualPercentageReturn || 0, 0)}% APR
          </Strong>
        </Loader>
      </Banner>
      <VotePageOuterWrapper>
        <HowItWorks />
        <VotePageInnerWrapper>
          <Votes />
        </VotePageInnerWrapper>
      </VotePageOuterWrapper>
    </Layout>
  );
};
export default VotePage;

// Fill the page height so a short vote list still docks the action bar on
// the footer instead of leaving a grey gap above it.
const VotePageOuterWrapper = styled(PageOuterWrapper)`
  display: flex;
  flex-direction: column;
`;

const VotePageInnerWrapper = styled(PageInnerWrapper)`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
`;
