import { Banner, HowItWorks, Layout, Votes } from "components";
import styled from "styled-components";

export function Vote() {
  return (
    <Layout>
      <Banner>
        Stake, vote &amp; earn up to <Strong>30% APY</Strong>
      </Banner>
      <HowItWorks />
      <Votes />
    </Layout>
  );
}

const Strong = styled.strong`
  color: var(--red-500);
`;
