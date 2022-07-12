import { AmountInput } from "components/AmountInput";
import { Button } from "components/Button";
import { useState } from "react";
import styled from "styled-components";

export function Unstake() {
  const [unstakeAmount, setStakeAmount] = useState<string>();
  const [canUnstake, setCanUnstake] = useState(false);

  return (
    <Wrapper>
      <Title>Unstake</Title>
      <Description>
        When you unstake tokens there is a 7 days cool off period and you wont be able to collect rewards text text
      </Description>
      <HowItWorks>
        <HowItWorksTitle>How it works</HowItWorksTitle>
        <UnstakeStep>Unstake tokens</UnstakeStep>
        <UnstakeStep>Cool-off period of 7 days</UnstakeStep>
        <UnstakeStep>Claim tokens</UnstakeStep>
      </HowItWorks>
      <AmountInputWrapper>
        <AmountInput
          value={unstakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          onMax={() => setStakeAmount("10000")}
          disabled={!canUnstake}
        />
      </AmountInputWrapper>
      <Button
        variant="primary"
        label="Unstake"
        onClick={() => console.log("TODO implement stake")}
        width="100%"
        disabled={!canUnstake}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding-top: 25px;
  padding-inline: 30px;
`;

const Title = styled.h2`
  font: var(--header-sm);
  font-weight: 700;
`;

const Description = styled.p`
  font: var(--text-sm);
  margin-bottom: 27px;
`;

const AmountInputWrapper = styled.div`
  margin-bottom: 15px;
`;

const HowItWorks = styled.ol`
  list-style: none;
`;

const HowItWorksTitle = styled.h3`
  font: var(--text-md);
`;

const UnstakeStep = styled.li`
  display: flex;
  font: var(--text-sm);
`;
