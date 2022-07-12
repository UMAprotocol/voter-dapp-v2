import { AmountInput } from "components/AmountInput";
import { Button } from "components/Button";
import { Checkbox } from "components/Checkbox";
import { useState } from "react";
import styled from "styled-components";

export function Stake() {
  const [stakeAmount, setStakeAmount] = useState<string>();
  const [disclaimerChecked, setDisclaimerChecked] = useState<boolean>(false);
  const disclaimer = "I understand that Staked tokens cannot be transferred for 7 days after unstaking.";
  return (
    <Wrapper>
      <Title>Stake</Title>
      <Description>
        Staked tokens can be used to vote and earn rewards. Staked tokens cannot be transferred for 7 days after
        unstaking.
      </Description>
      <AmountInput
        value={stakeAmount}
        onChange={(e) => setStakeAmount(e.target.value)}
        onMax={() => setStakeAmount("10000")}
      />
      <Checkbox
        label={disclaimer}
        checked={disclaimerChecked}
        onChange={(e) => setDisclaimerChecked(e.target.checked)}
      />
      <Button
        variant="primary"
        label="Stake"
        onClick={() => console.log("TODO implement stake")}
        width="100%"
        disabled={!disclaimerChecked}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div``;

const Title = styled.h2``;

const Description = styled.p``;
