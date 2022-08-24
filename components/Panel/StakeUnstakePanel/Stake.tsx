import { AmountInput } from "components/Input";
import { Button } from "components/Button";
import { Checkbox } from "components/Checkbox";
import { useState } from "react";
import styled from "styled-components";
import { PanelSectionText, PanelSectionTitle } from "../styles";
import useUnstakedBalance from "hooks/queries/useUnstakedBalance";
import useAccountDetails from "hooks/queries/useAccountDetails";
import { useContractsContext } from "hooks/contexts";
import { ethers } from "ethers";
import { votingAddress } from "constants/addresses";
import useTokenAllowance from "hooks/queries/useTokenAllowance";
import useStake from "hooks/mutations/useStake";
import useApprove from "hooks/mutations/useApprove";

export function Stake() {
  const { address } = useAccountDetails();
  const { voting, votingToken } = useContractsContext();
  const { unstakedBalance } = useUnstakedBalance(votingToken, address);
  const { tokenAllowance } = useTokenAllowance(votingToken, address);
  const [stakeAmount, setStakeAmount] = useState("");
  const stakeMutation = useStake();
  const approveMutation = useApprove();
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const disclaimer = "I understand that Staked tokens cannot be transferred for 7 days after unstaking.";

  function stake() {
    stakeMutation({ voting, stakeAmount });
  }

  async function approve() {
    approveMutation({ votingToken, approveAmount: stakeAmount });
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
          onMax={() => setStakeAmount(tokenAllowance > 0 ? tokenAllowance.toString() : unstakedBalance.toString())}
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
        label={tokenAllowance > 0 ? "Stake" : "Approve"}
        onClick={tokenAllowance > 0 ? stake : approve}
        width="100%"
        disabled={!disclaimerChecked || stakeAmount === ""}
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
