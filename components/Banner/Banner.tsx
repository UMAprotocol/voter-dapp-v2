import styled from "styled-components";

export function Banner() {
  return (
    <OuterWrapper>
      <InnerWrapper>
        <Text>
          Stake, vote &amp; earn up to <Emphasis>30% APY</Emphasis>
        </Text>
      </InnerWrapper>
    </OuterWrapper>
  );
}

const OuterWrapper = styled.div`
  background: var(--black);
`;

const InnerWrapper = styled.div`
  max-width: var(--desktop-max-width);
  height: 125px;
  display: flex;
  align-items: center;
  padding-left: 45px;
  margin-inline: auto;
`;

const Text = styled.h1`
  color: var(--white);
  font: var(--header-lg);
`;

const Emphasis = styled.span`
  color: var(--red);
`;
