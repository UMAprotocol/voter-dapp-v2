import { AmountInput, Button, Checkbox, PanelErrorBanner } from "components";
import formatDuration from "date-fns/formatDuration";
import { BigNumber, constants } from "ethers";
import { formatEther, parseEtherSafe } from "helpers";
import { useState } from "react";
import styled from "styled-components";
import { PanelSectionText, PanelSectionTitle, PanelWarningText } from "../styles";

const MaxApproval = formatEther(constants.MaxUint256);

interface Props {
  tokenAllowance: BigNumber | undefined;
  unstakedBalance: BigNumber | undefined;
  unstakeCoolDown: number | undefined;
  isDelegate: boolean;
  approve: (approveAmount: string) => void;
  stake: (stakeAmount: string, resetStakeAmount: () => void) => void;
}
export function Stake({ tokenAllowance, unstakedBalance, approve, stake, unstakeCoolDown, isDelegate }: Props) {
  const [stakeAmount, setStakeAmount] = useState("");
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const unstakeCoolDownFormatted = unstakeCoolDown ? formatDuration({ seconds: unstakeCoolDown }) : "0 seconds";

  const disclaimer = `I understand that Staked tokens cannot be transferred for ${unstakeCoolDownFormatted} after unstaking.`;

  function isApprove() {
    if (tokenAllowance === undefined || stakeAmount === "") return true;
    const parsedStakeAmount = parseEtherSafe(stakeAmount);
    if (parsedStakeAmount.eq(0)) return true;
    return parsedStakeAmount.gt(tokenAllowance);
  }

  function isButtonDisabled() {
    return !disclaimerChecked || stakeAmount === "" || parseEtherSafe(stakeAmount).eq(0);
  }

  function onApprove() {
    approve(MaxApproval);
  }

  function onStake() {
    stake(stakeAmount, () => setStakeAmount(""));
  }

  return (
    <Wrapper>
      <PanelSectionTitle>Stake</PanelSectionTitle>
      <PanelSectionText>
        Staked tokens can be used to vote and earn rewards. Staked tokens cannot be transferred for{" "}
        {unstakeCoolDownFormatted} after unstaking.
      </PanelSectionText>
      {isDelegate ? (
        <PanelWarningText>
          You are currently delegating your vote. You will need to undelegate your vote before you can stake.
        </PanelWarningText>
      ) : (
        <>
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
        </>
      )}
      <PanelErrorBanner errorOrigin="stake" />
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
