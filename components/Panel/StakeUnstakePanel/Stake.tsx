import { AmountInput, Button, Checkbox, PanelErrorBanner } from "components";
import { mobileAndUnder } from "constant";
import { maximumApprovalAmountString } from "constant";
import formatDuration from "date-fns/formatDuration";
import { BigNumber } from "ethers";
import { formatEther, parseEtherSafe } from "helpers";
import { useState } from "react";
import styled from "styled-components";
import {
  PanelSectionText,
  PanelSectionTitle,
  PanelWarningText,
} from "../styles";

interface Props {
  tokenAllowance: BigNumber | undefined;
  unstakedBalance: BigNumber | undefined;
  unstakeCoolDown: number | undefined;
  isDelegate: boolean;
  approve: (approveAmount: string) => void;
  stake: (stakeAmount: string, resetStakeAmount: () => void) => void;
}
export function Stake({
  tokenAllowance,
  unstakedBalance,
  approve,
  stake,
  unstakeCoolDown,
  isDelegate,
}: Props) {
  const [inputAmount, setInputAmount] = useState("");
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const unstakeCoolDownFormatted = unstakeCoolDown
    ? formatDuration({ seconds: unstakeCoolDown })
    : "0 seconds";

  const disclaimer = `I understand that Staked tokens cannot be transferred for ${unstakeCoolDownFormatted} after unstaking.`;

  function isApprove() {
    if (tokenAllowance === undefined || tokenAllowance.eq(0)) return true;
    const parsedStakeAmount = parseEtherSafe(inputAmount);
    return parsedStakeAmount.gt(tokenAllowance);
  }

  function isButtonDisabled() {
    if (inputAmount === maximumApprovalAmountString && disclaimerChecked)
      return false;

    return (
      !disclaimerChecked ||
      inputAmount === "" ||
      parseEtherSafe(inputAmount).eq(0)
    );
  }

  function onApprove() {
    approve(inputAmount);
    setInputAmount("");
  }

  function onStake() {
    stake(inputAmount, () => setInputAmount(""));
  }

  function onMax() {
    if (isApprove()) {
      setInputAmount(maximumApprovalAmountString);
    } else {
      setInputAmount(formatEther(unstakedBalance ?? 0));
    }
  }

  return (
    <Wrapper>
      <PanelSectionTitle>Stake</PanelSectionTitle>
      <PanelSectionText>
        Staked tokens can be used to vote and earn rewards. Staked tokens cannot
        be transferred for {unstakeCoolDownFormatted} after unstaking.
      </PanelSectionText>
      {isDelegate ? (
        <PanelWarningText>
          You are currently delegating your vote. You will need to undelegate
          your vote before you can stake.
        </PanelWarningText>
      ) : (
        <>
          <AmountInputWrapper>
            <AmountInput
              value={inputAmount}
              onInput={setInputAmount}
              onMax={onMax}
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

  @media ${mobileAndUnder} {
    padding-inline: 10px;
  }
`;

const AmountInputWrapper = styled.div`
  margin-bottom: 15px;
`;

const CheckboxWrapper = styled.div`
  margin-bottom: 23px;
`;
