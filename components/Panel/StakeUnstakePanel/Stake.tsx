import { AmountInput, Button, Checkbox, PanelErrorBanner } from "components";
import { BigNumber } from "ethers";
import { formatEther, parseEther } from "helpers";
import { useErrorContext } from "hooks";
import { ChangeEvent, useState } from "react";
import styled from "styled-components";
import { PanelSectionText, PanelSectionTitle } from "../styles";

interface Props {
  tokenAllowance: BigNumber | undefined;
  unstakedBalance: BigNumber | undefined;
  approve: (approveAmount: string) => void;
  stake: (stakeAmount: string, resetStakeAmount: () => void) => void;
}
export function Stake({ tokenAllowance, unstakedBalance, approve, stake }: Props) {
  const [stakeAmount, setStakeAmount] = useState("");
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const disclaimer = "I understand that Staked tokens cannot be transferred for 7 days after unstaking.";

  function isApprove() {
    if (tokenAllowance === undefined || stakeAmount === "") return true;
    const parsedStakeAmount = parseEther(stakeAmount);
    if (parsedStakeAmount.eq(0)) return true;
    return parsedStakeAmount.gt(tokenAllowance);
  }

  function isButtonDisabled() {
    return !disclaimerChecked || stakeAmount === "" || parseEther(stakeAmount).eq(0);
  }

  function onApprove() {
    approve(stakeAmount);
  }

  function onStake() {
    stake(stakeAmount, () => setStakeAmount(""));
  }

  return (
    <Wrapper>
      <PanelSectionTitle>Stake</PanelSectionTitle>
      <PanelSectionText>
        Staked tokens can be used to vote and earn rewards. Staked tokens cannot be transferred for 7 days after
        unstaking.
      </PanelSectionText>
      <AmountInputWrapper>
        <AmountInput
          value={stakeAmount}
          onInput={setStakeAmount}
          onMax={() => setStakeAmount(formatEther(unstakedBalance ?? 0))}
          allowNegative={false}
        />
      </AmountInputWrapper>
      <CheckboxWrapper>
        <Checkbox
          label={disclaimer}
          checked={disclaimerChecked}
          onChange={(e) => setDisclaimerChecked(e.target.checked)}
        />
      </CheckboxWrapper>
      <Button
        variant="primary"
        label={isApprove() ? "Approve" : "Stake"}
        onClick={isApprove() ? onApprove : onStake}
        width="100%"
        disabled={isButtonDisabled()}
      />
      <PanelErrorBanner errorType="stake" />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding-top: 25px;
  padding-inline: 30px;
`;

const AmountInputWrapper = styled.div`
  margin-bottom: 15px;
`;

const CheckboxWrapper = styled.div`
  margin-bottom: 23px;
`;
