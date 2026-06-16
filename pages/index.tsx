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
import { config } from "helpers/config";
import { useGlobals } from "hooks";
import { isUndefined } from "lodash";
import type { NextPage } from "next";

const VotePage: NextPage = () => {
  const { data: globals } = useGlobals();
  const { annualPercentageReturn } = globals || {};
  const { stakingAprMax, votingAprMax } = config;

  const stakingAprMaxNumber = Number(stakingAprMax);
  const votingAprMaxNumber = Number(votingAprMax);
  const hasAprBreakdown =
    stakingAprMax !== undefined &&
    votingAprMax !== undefined &&
    Number.isFinite(stakingAprMaxNumber) &&
    Number.isFinite(votingAprMaxNumber);
  const totalAprMax = hasAprBreakdown
    ? stakingAprMaxNumber + votingAprMaxNumber
    : undefined;

  return (
    <Layout title="UMA | Voting dApp">
      <Banner
        subtitle={
          hasAprBreakdown && (
            <>
              Up to <Strong>{truncateDecimals(stakingAprMaxNumber, 1)}%</Strong>{" "}
              from staking your UMA &amp; up to{" "}
              <Strong>{truncateDecimals(votingAprMaxNumber, 1)}%</Strong> from
              voting correctly.
            </>
          )
        }
      >
        Stake, vote &amp; earn up to{" "}
        {hasAprBreakdown ? (
          <Strong>{truncateDecimals(totalAprMax ?? 0, 0)}% APR</Strong>
        ) : (
          <Loader isLoading={isUndefined(annualPercentageReturn)}>
            <Strong>
              {truncateDecimals(annualPercentageReturn || 0, 0)}% APR
            </Strong>
          </Loader>
        )}
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
