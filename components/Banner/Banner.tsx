import styled from "styled-components";

export function Banner() {
  return (
    <Wrapper>
      <Text>
        Stake, vote &amp; earn up to <Emphasis>30% APY</Emphasis>
      </Text>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  height: 125px;
  background: var(--black);
  display: flex;
  align-items: center;
  padding-left: 45px;
`;

const Text = styled.h1`
  color: var(--white);
  font: var(--header-lg);
`;

const Emphasis = styled.span`
  color: var(--red);
`;
