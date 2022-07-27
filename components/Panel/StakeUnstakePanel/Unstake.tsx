import { AmountInput } from "components/Input";
import { Button } from "components/Button";
import { useState } from "react";
import styled from "styled-components";
import One from "public/assets/icons/one.svg";
import Two from "public/assets/icons/two.svg";
import Three from "public/assets/icons/three.svg";

interface Props {
  canClaim: boolean;
}
export function Unstake({ canClaim }: Props) {
  const [unstakeAmount, setStakeAmount] = useState<string>();

  return (
    <Wrapper>
      <Title>Unstake</Title>
      <Description>
        When you unstake tokens there is a 7 days cool off period and you wont be able to collect rewards text text
      </Description>
      <HowItWorks>
        <HowItWorksTitle>How it works</HowItWorksTitle>
        <UnstakeStep>
          <OneIcon />
          Unstake tokens
        </UnstakeStep>
        <UnstakeStep>
          <TwoIcon />
          Cool-off period of 7 days
        </UnstakeStep>
        <UnstakeStep>
          <ThreeIcon />
          Claim tokens
        </UnstakeStep>
      </HowItWorks>
      <AmountInputWrapper>
        <AmountInput
          value={unstakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          onMax={() => setStakeAmount("10000")}
          disabled={!canClaim}
        />
      </AmountInputWrapper>
      <Button
        variant="primary"
        label="Unstake"
        onClick={() => console.log("TODO implement stake")}
        width="100%"
        disabled={!canClaim}
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
  background: var(--grey-50);
  padding-block: 15px;
  padding-left: 20px;
  margin-bottom: 25px;
  border-radius: 5px;
`;

const HowItWorksTitle = styled.h3`
  font: var(--text-md);
  margin-bottom: 13px;
`;

const UnstakeStep = styled.li`
  display: flex;
  gap: 15px;
  margin-bottom: 13px;
  font: var(--text-sm);
`;

const OneIcon = styled(One)`
  circle {
    fill: var(--black);
  }
  path {
    fill: var(--white);
  }
`;

const TwoIcon = styled(Two)`
  circle {
    fill: var(--black);
  }
  path {
    fill: var(--white);
  }
`;

const ThreeIcon = styled(Three)`
  circle {
    fill: var(--black);
  }
  path {
    fill: var(--white);
  }
`;
