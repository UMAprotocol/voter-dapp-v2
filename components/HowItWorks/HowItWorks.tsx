import { InfoBar, LoadingSkeleton } from "components";
import { tabletAndUnder } from "constant";
import { BigNumber } from "ethers";
import { formatNumberForDisplay, parseEther } from "helpers";
import { usePanelContext, useStakingContext, useUserContext } from "hooks";
import One from "public/assets/icons/one.svg";
import Three from "public/assets/icons/three.svg";
import Two from "public/assets/icons/two.svg";
import styled from "styled-components";

export function HowItWorks() {
  const { openPanel } = usePanelContext();
  const {
    stakedBalance,
    unstakedBalance,
    outstandingRewards,
    getStakingDataFetching,
    pendingUnstake,
  } = useStakingContext();
  const { countReveals, apr, userDataFetching } = useUserContext();

  function openStakeUnstakePanel() {
    openPanel("stake");
  }

  function openClaimPanel() {
    openPanel("claim");
  }

  function totalTokens() {
    if (
      unstakedBalance === undefined ||
      stakedBalance === undefined ||
      pendingUnstake === undefined
    )
      return;
    return unstakedBalance.add(stakedBalance).add(pendingUnstake);
  }

  function isLoading() {
    return getStakingDataFetching() || userDataFetching;
  }

  return (
    <OuterWrapper>
      <InnerWrapper>
        <Title>How it works:</Title>
        <InfoBar
          label={
            <>
              <IconWrapper>
                <One />
              </IconWrapper>
              Stake UMA
            </>
          }
          content={
            <>
              You are staking{" "}
              <LoadingSkeleton isLoading={isLoading()} width={60}>
                <Strong>{formatNumberForDisplay(stakedBalance)}</Strong>
              </LoadingSkeleton>{" "}
              of your{" "}
              <LoadingSkeleton isLoading={isLoading()} width={60}>
                <Strong>{formatNumberForDisplay(totalTokens())}</Strong>
              </LoadingSkeleton>{" "}
              UMA tokens.
            </>
          }
          actionLabel="Stake/Unstake"
          onClick={openStakeUnstakePanel}
        />
        <InfoBar
          label={
            <>
              <IconWrapper>
                <Two />
              </IconWrapper>
              Vote
            </>
          }
          content={
            <>
              You have voted in{" "}
              <LoadingSkeleton isLoading={isLoading()} width={60}>
                <Strong>
                  {formatNumberForDisplay(countReveals, { decimals: 0 })}
                </Strong>
              </LoadingSkeleton>{" "}
              vote{countReveals?.eq(BigNumber.from(parseEther("1"))) ? "" : "s"}
              , and are earning{" "}
              <LoadingSkeleton isLoading={isLoading()} width={60}>
                <Strong>{formatNumberForDisplay(apr, { decimals: 1 })}%</Strong>
              </LoadingSkeleton>{" "}
              APR
            </>
          }
          actionLabel="Vote history"
          onClick={() => openPanel("history")}
        />
        <InfoBar
          label={
            <>
              <IconWrapper>
                <Three />
              </IconWrapper>
              Get rewards
            </>
          }
          content={
            <>
              You have{" "}
              <LoadingSkeleton isLoading={isLoading()} width={60}>
                <Strong>
                  {formatNumberForDisplay(outstandingRewards)} UMA
                </Strong>
              </LoadingSkeleton>{" "}
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
  background: var(--white);
`;

const InnerWrapper = styled.div`
  padding-inline: 45px;
  padding-block: 30px;
  max-width: var(--page-width);
  margin-inline: auto;
  div {
    margin-bottom: 5px;
  }
  @media ${tabletAndUnder} {
    padding-inline: 0;
  }
`;

const Title = styled.h1`
  padding-inline: 5px;
  font: var(--header-md);
  margin-bottom: 20px;
`;

const Strong = styled.strong`
  font-weight: 700;
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
  padding-top: 2px;
`;
