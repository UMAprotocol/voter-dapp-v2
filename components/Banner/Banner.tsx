import styled from "styled-components";

export function Banner() {
  return (
    <Wrapper>
      <Text>
        Stake, vote &amp; earn up to
        <Emphasis>30% APY</Emphasis>
      </Text>
    </Wrapper>
  );
}

const Wrapper = styled.div``;

const Text = styled.h1``;

const Emphasis = styled.span``;
