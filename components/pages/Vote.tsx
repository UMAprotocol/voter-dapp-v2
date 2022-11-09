import {
  Banner,
  HowItWorks,
  Layout,
  LoadingSpinner,
  PageInnerWrapper,
  PageOuterWrapper,
  Votes,
} from "components";
import { useVotesContext } from "hooks";
import { LoadingSpinnerWrapper, Strong } from "./styles";

export function Vote() {
  const { getUserIndependentIsLoading } = useVotesContext();
  return (
    <Layout title="UMA | Voting dApp">
      <Banner>
        Stake, vote &amp; earn up to <Strong>30% APY</Strong>
      </Banner>
      <PageOuterWrapper>
        <HowItWorks />
        <PageInnerWrapper>
          {getUserIndependentIsLoading() ? (
            <LoadingSpinnerWrapper>
              <LoadingSpinner size={300} variant="black" />
            </LoadingSpinnerWrapper>
          ) : (
            <Votes />
          )}
        </PageInnerWrapper>
      </PageOuterWrapper>
    </Layout>
  );
}
