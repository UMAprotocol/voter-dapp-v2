import { Banner, HowItWorks, Layout, LoadingSpinner, PageInnerWrapper, PageOuterWrapper, Votes } from "components";
import { useVotesContext } from "hooks";
import styled from "styled-components";

export function Vote() {
  const { getUserIndependentIsLoading } = useVotesContext();
  return (
    <Layout>
      <Banner>
        Stake, vote &amp; earn up to <Strong>30% APY</Strong>
      </Banner>
      <HowItWorks />
      <PageOuterWrapper>
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

const Strong = styled.strong`
  color: var(--red-500);
`;

const LoadingSpinnerWrapper = styled.div`
  width: 100%;
  padding-top: 50px;
  display: grid;
  place-items: center;
`;
