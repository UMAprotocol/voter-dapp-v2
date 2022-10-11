import { InfoBar, LoadingSkeleton } from "components";
import { BigNumber } from "ethers";
import { formatNumberForDisplay, parseEther } from "helpers";
import { useBalancesContext, usePanelContext, useUserContext } from "hooks";
import One from "public/assets/icons/one.svg";
import Three from "public/assets/icons/three.svg";
import Two from "public/assets/icons/two.svg";
import styled from "styled-components";

export function HowItWorks() {
  const { openPanel } = usePanelContext();
  const { stakedBalance, unstakedBalance, outstandingRewards, getBalancesFetching } = useBalancesContext();
  const { countReveals, apr, userDataFetching } = useUserContext();

  function openStakeUnstakePanel() {
    openPanel("stake");
  }

  function openClaimPanel() {
    openPanel("claim");
  }

  function totalTokens() {
    if (unstakedBalance === undefined || stakedBalance === undefined) return;
    return unstakedBalance.add(stakedBalance);
  }

  function isLoading() {
    return getBalancesFetching() || userDataFetching;
  }

  return (
    <OuterWrapper>
      <InnerWrapper>
        <Title>How it works:</Title>
        <InfoBar
          label={
            <>
              <One />
              Stake UMA
            </>
          }
          content={
            <>
              You are staking{" "}
              <Strong>{isLoading() ? <LoadingSkeleton width={60} /> : formatNumberForDisplay(stakedBalance)}</Strong>{" "}
              UMA tokens of{" "}
              <Strong>{isLoading() ? <LoadingSkeleton width={60} /> : formatNumberForDisplay(totalTokens())}</Strong>{" "}
              total tokens.
            </>
          }
          actionLabel="Stake/Unstake"
          onClick={openStakeUnstakePanel}
        />
        <InfoBar
          label={
            <>
              <Two />
              Vote
            </>
          }
          content={
            <>
              You have voted in{" "}
              <Strong>
                {isLoading() ? <LoadingSkeleton width={60} /> : formatNumberForDisplay(countReveals, { decimals: 0 })}
              </Strong>{" "}
              voting cycle{countReveals?.eq(1) ? "s" : ""}, and are earning{" "}
              <Strong>{isLoading() ? <LoadingSkeleton width={60} /> : formatNumberForDisplay(apr)}% APR</Strong>
            </>
          }
          actionLabel="Vote history"
          onClick={() => openPanel("history")}
        />
        <InfoBar
          label={
            <>
              <Three />
              Get rewards
            </>
          }
          content={
            <>
              You have{" "}
              <Strong>
                {isLoading() ? <LoadingSkeleton width={60} /> : formatNumberForDisplay(outstandingRewards)} UMA
              </Strong>{" "}
              in unclaimed rewards
            </>
          }
          actionLabel="Claim"
          onClick={openClaimPanel}
        />
      </InnerWrapper>
    </OuterWrapper>
  );
}

const OuterWrapper = styled.section`
  max-width: var(--desktop-max-width);
  margin-inline: auto;
`;

const InnerWrapper = styled.div`
  padding-inline: 45px;
  padding-block: 30px;
  div {
    margin-bottom: 5px;
  }
`;

const Title = styled.h1`
  font: var(--header-md);
  margin-bottom: 20px;
`;

const Strong = styled.strong`
  font-weight: 700;
`;
