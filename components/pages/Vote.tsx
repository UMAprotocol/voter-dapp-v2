import {
  Banner,
  HowItWorks,
  Layout,
  LoadingSpinner,
  PageInnerWrapper,
  PageOuterWrapper,
  Votes,
} from "components";
import { LoadingSpinnerWrapper, Strong } from "./styles";
import { useGlobals, useVotesContext } from "hooks";
import { truncateDecimals } from "helpers";

export function Vote() {
  const {
    data: { annualPercentageReturn },
  } = useGlobals();
  const { getUserIndependentIsLoading } = useVotesContext();
  return (
    <Layout title="UMA | Voting dApp">
      <Banner>
        Stake, vote &amp; earn up to{" "}
        <Strong>{truncateDecimals(annualPercentageReturn, 0) || 0}% APR</Strong>
      </Banner>
      <PageOuterWrapper>
        <HowItWorks />
        <PageInnerWrapper>
          {getUserIndependentIsLoading() ? (
            <LoadingSpinnerWrapper>
              <LoadingSpinner size={40} variant="black" />
            </LoadingSpinnerWrapper>
          ) : (
            <Votes />
          )}
        </PageInnerWrapper>
      </PageOuterWrapper>
    </Layout>
  );
}
