import { Button } from "components/Button";
import { Checkbox } from "components/Checkbox";
import { AmountInput } from "components/Input";
import { formatEther, parseEther } from "helpers/ethers";
import { useBalancesContext, useContractsContext } from "hooks/contexts";
import { useApprove, useStake } from "hooks/mutations";
import { useState } from "react";
import styled from "styled-components";
import { PanelSectionText, PanelSectionTitle } from "../styles";

export function Stake() {
  const { voting, votingToken } = useContractsContext();
  const { unstakedBalance, tokenAllowance } = useBalancesContext();
  const [stakeAmount, setStakeAmount] = useState("");
  const stakeMutation = useStake();
  const approveMutation = useApprove();
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const disclaimer = "I understand that Staked tokens cannot be transferred for 7 days after unstaking.";

  function stake() {
    stakeMutation(
      { voting, stakeAmount: parseEther(stakeAmount) },
      {
        onSuccess: () => {
          setStakeAmount("");
        },
      }
    );
  }

  async function approve() {
    approveMutation({ votingToken, approveAmount: parseEther(stakeAmount) });
  }

  function getMax() {
    if (tokenAllowance === undefined || unstakedBalance === undefined) return "0";
    if (tokenAllowance.gt(unstakedBalance)) return formatEther(unstakedBalance);
    return formatEther(tokenAllowance);
  }

  function isApprove() {
    if (tokenAllowance === undefined || stakeAmount === "") return true;
    const parsedStakeAmount = parseEther(stakeAmount);
    if (parsedStakeAmount.eq(0)) return true;
    return parsedStakeAmount.gt(tokenAllowance);
  }

  function isButtonDisabled() {
    return !disclaimerChecked || stakeAmount === "" || parseEther(stakeAmount).eq(0);
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
          onChange={(e) => setStakeAmount(e.target.value)}
          onMax={() => setStakeAmount(getMax())}
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
        onClick={isApprove() ? approve : stake}
        width="100%"
        disabled={isButtonDisabled()}
      />
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
