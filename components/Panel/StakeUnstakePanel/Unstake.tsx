import { AmountInput, Button, PanelErrorBanner } from "components";
import { BigNumber } from "ethers";
import { formatEther } from "helpers";
import { useVotesContext, useVoteTimingContext } from "hooks";
import One from "public/assets/icons/one.svg";
import Three from "public/assets/icons/three.svg";
import Two from "public/assets/icons/two.svg";
import { useState } from "react";
import styled from "styled-components";
import { PanelSectionText, PanelSectionTitle } from "../styles";
import formatDuration from "date-fns/formatDuration";

interface Props {
  stakedBalance: BigNumber | undefined;
  pendingUnstake: BigNumber | undefined;
  unstakeCoolDown: number | undefined;
  canClaim: boolean;
  requestUnstake: (unstakeAmount: string) => void;
}
export function Unstake({ stakedBalance, pendingUnstake, requestUnstake, unstakeCoolDown, canClaim }: Props) {
  const { phase } = useVoteTimingContext();
  const { hasActiveVotes } = useVotesContext();
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const unstakeCoolDownFormatted = unstakeCoolDown ? formatDuration({ seconds: unstakeCoolDown }) : "0 seconds";

  function canUnstake(stakedBalance: BigNumber | undefined, pendingUnstake: BigNumber | undefined) {
    if (stakedBalance === undefined || pendingUnstake === undefined) return false;
    return !canClaim && stakedBalance.gt(0) && pendingUnstake.eq(0);
  }

  return (
    <Wrapper>
      <PanelSectionTitle>Unstake</PanelSectionTitle>
      <PanelSectionText>
        When you unstake tokens there is a {unstakeCoolDownFormatted} cool off period and you wont be able to collect
        rewards text text
      </PanelSectionText>
      <HowItWorks>
        <HowItWorksTitle>How it works</HowItWorksTitle>
        <UnstakeStep>
          <OneIcon />
          Unstake tokens
        </UnstakeStep>
        <UnstakeStep>
          <TwoIcon />
          Cool-off period of {unstakeCoolDownFormatted}
        </UnstakeStep>
        <UnstakeStep>
          <ThreeIcon />
          Claim tokens
        </UnstakeStep>
      </HowItWorks>
      {(phase === "commit" || !hasActiveVotes) && (
        <>
          <AmountInputWrapper>
            <AmountInput
              value={unstakeAmount}
              onInput={setUnstakeAmount}
              allowNegative={false}
              onMax={() => setUnstakeAmount(formatEther(stakedBalance ?? 0))}
              disabled={!canUnstake(stakedBalance, pendingUnstake)}
            />
          </AmountInputWrapper>
          <Button
            variant="primary"
            label="Unstake"
            onClick={() => requestUnstake(unstakeAmount)}
            width="100%"
            disabled={!canUnstake(stakedBalance, pendingUnstake)}
          />
        </>
      )}
      <PanelErrorBanner errorType="unstake" />
      {!canClaim && phase === "reveal" && hasActiveVotes && <p>Cannot request unstake in active reveal phase</p>}
      {canClaim && <p>Cannot request to unstake until you claim unstaked tokens</p>}
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
