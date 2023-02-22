import { AmountInput, Button, PanelErrorBanner } from "components";
import { mobileAndUnder } from "constant";
import formatDuration from "date-fns/formatDuration";
import { BigNumber } from "ethers";
import { formatEther } from "helpers";
import { useVotesContext, useVoteTimingContext } from "hooks";
import One from "public/assets/icons/one.svg";
import Three from "public/assets/icons/three.svg";
import Two from "public/assets/icons/two.svg";
import { useState } from "react";
import styled from "styled-components";
import {
  PanelSectionText,
  PanelSectionTitle,
  PanelWarningText,
} from "../styles";

interface Props {
  stakedBalance: BigNumber | undefined;
  pendingUnstake: BigNumber | undefined;
  unstakeCoolDown: BigNumber | undefined;
  isReadyToUnstake: boolean;
  isDelegate: boolean;
  requestUnstake: (unstakeAmount: string) => void;
  hasCooldownTimeRemaining: boolean;
  isRequestingUnstake: boolean;
}
export function Unstake({
  stakedBalance,
  pendingUnstake,
  requestUnstake,
  unstakeCoolDown,
  isReadyToUnstake,
  isDelegate,
  hasCooldownTimeRemaining,
  isRequestingUnstake,
}: Props) {
  const { phase } = useVoteTimingContext();
  const { hasActiveVotes } = useVotesContext();
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const unstakeCoolDownFormatted = unstakeCoolDown
    ? formatDuration({ seconds: unstakeCoolDown.toNumber() })
    : "0 seconds";

  function canRequestUnstake(
    stakedBalance: BigNumber | undefined,
    pendingUnstake: BigNumber | undefined
  ) {
    if (stakedBalance === undefined || pendingUnstake === undefined)
      return false;
    return (
      !isReadyToUnstake &&
      stakedBalance.gt(0) &&
      pendingUnstake.eq(0) &&
      !isRequestingUnstake
    );
  }

  return (
    <Wrapper>
      <PanelSectionTitle>Unstake</PanelSectionTitle>
      <PanelSectionText>
        After submitting an unstake request, you must wait{" "}
        {unstakeCoolDownFormatted} before you can claim your unstaked tokens.
      </PanelSectionText>
      <HowItWorks>
        <HowItWorksTitle>How it works</HowItWorksTitle>
        <UnstakeStep>
          <IconWrapper>
            <OneIcon />
          </IconWrapper>
          Unstake tokens
        </UnstakeStep>
        <UnstakeStep>
          <IconWrapper>
            <TwoIcon />
          </IconWrapper>
          Wait {unstakeCoolDownFormatted}
        </UnstakeStep>
        <UnstakeStep>
          <IconWrapper>
            <ThreeIcon />
          </IconWrapper>
          Claim unstaked tokens
        </UnstakeStep>
      </HowItWorks>
      {!isDelegate && (phase === "commit" || !hasActiveVotes) && (
        <>
          <AmountInputWrapper>
            <AmountInput
              value={unstakeAmount}
              onInput={setUnstakeAmount}
              allowNegative={false}
              onMax={() => setUnstakeAmount(formatEther(stakedBalance ?? 0))}
              disabled={!canRequestUnstake(stakedBalance, pendingUnstake)}
            />
          </AmountInputWrapper>
          <Button
            variant="primary"
            label="Unstake"
            onClick={() => requestUnstake(unstakeAmount)}
            width="100%"
            disabled={
              !canRequestUnstake(stakedBalance, pendingUnstake) ||
              unstakeAmount === ""
            }
          />
        </>
      )}
      <PanelErrorBanner errorOrigin="unstake" />
      {!isReadyToUnstake &&
        phase === "reveal" &&
        hasActiveVotes &&
        !isDelegate && (
          <PanelWarningText>
            You cannot request to unstake during an active reveal phase.
          </PanelWarningText>
        )}
      {isReadyToUnstake && !hasCooldownTimeRemaining && (
        <PanelWarningText>
          You cannot request to unstake until you claim your previously unstaked
          tokens.
        </PanelWarningText>
      )}
      {!isReadyToUnstake && hasCooldownTimeRemaining && (
        <PanelWarningText>
          You cannot request to unstake additional tokens until your previous
          unstake request is completed.
        </PanelWarningText>
      )}
      {isDelegate && (
        <PanelWarningText>
          You cannot request to unstake while you are a delegate.
        </PanelWarningText>
      )}
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

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
`;
