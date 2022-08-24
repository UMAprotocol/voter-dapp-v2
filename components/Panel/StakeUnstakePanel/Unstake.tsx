import { AmountInput } from "components/Input";
import { Button } from "components/Button";
import { useState } from "react";
import styled from "styled-components";
import One from "public/assets/icons/one.svg";
import Two from "public/assets/icons/two.svg";
import Three from "public/assets/icons/three.svg";
import { PanelSectionText, PanelSectionTitle } from "../styles";
import useVotePhase from "hooks/queries/useVotePhase";
import useActiveVotes from "hooks/queries/useActiveVotes";
import { useContractsContext } from "hooks/contexts";
import useStakedBalance from "hooks/queries/useStakedBalance";
import useAccountDetails from "hooks/queries/useAccountDetails";
import useRequestUnstake from "hooks/mutations/useRequestUnstake";
import useStakerDetails from "hooks/queries/useStakerDetails";

export function Unstake() {
  const votePhase = useVotePhase();
  const { address } = useAccountDetails();
  const { voting } = useContractsContext();
  const { activeVotes } = useActiveVotes(voting);
  const { stakedBalance } = useStakedBalance(voting, address);
  const {
    stakerDetails: { pendingUnstake },
  } = useStakerDetails(voting, address);
  const requestUnstakeMutation = useRequestUnstake();
  const [unstakeAmount, setUnstakeAmount] = useState("");

  function requestUnstake() {
    requestUnstakeMutation({ voting, unstakeAmount });
  }

  function canUnstake(stakedBalance: number, pendingUnstake: number) {
    return stakedBalance > 0 && pendingUnstake === 0;
  }

  return (
    <Wrapper>
      <PanelSectionTitle>Unstake</PanelSectionTitle>
      <PanelSectionText>
        When you unstake tokens there is a 7 days cool off period and you wont be able to collect rewards text text
      </PanelSectionText>
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
      {(votePhase === "commit" || activeVotes.length === 0) && (
        <>
          <AmountInputWrapper>
            <AmountInput
              value={unstakeAmount}
              onChange={(e) => setUnstakeAmount(e.target.value)}
              onMax={() => setUnstakeAmount(stakedBalance.toString())}
              disabled={!canUnstake(stakedBalance, pendingUnstake)}
            />
          </AmountInputWrapper>
          <Button
            variant="primary"
            label="Unstake"
            onClick={requestUnstake}
            width="100%"
            disabled={!canUnstake(stakedBalance, pendingUnstake)}
          />
        </>
      )}
      {votePhase === "reveal" && activeVotes.length > 0 && <p>Cannot request unstake in active reveal phase</p>}
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
