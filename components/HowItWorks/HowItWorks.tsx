import { InfoBar } from "components/InfoBar";
import { LoadingSkeleton } from "components/LoadingSkeleton";
import { formatNumberForDisplay } from "helpers/formatNumber";
import { usePanelContext } from "hooks/contexts";
import { useOutstandingRewards, useStakedBalance, useUnstakedBalance } from "hooks/queries";
import One from "public/assets/icons/one.svg";
import Three from "public/assets/icons/three.svg";
import Two from "public/assets/icons/two.svg";
import styled from "styled-components";

interface Props {
  votesInLastCycles: number;
  apy: number;
}
export function HowItWorks({ votesInLastCycles, apy }: Props) {
  const { setPanelType, setPanelOpen } = usePanelContext();
  const { data: unstakedBalance, isFetching: unstakedBalanceIsFetching } = useUnstakedBalance();
  const { data: stakedBalance, isFetching: stakedBalanceIsFetching } = useStakedBalance();
  const { data: outstandingRewards, isFetching: outstandingRewardIsFetching } = useOutstandingRewards();

  function openStakeUnstakePanel() {
    setPanelType("stake");
    setPanelOpen(true);
  }

  function openClaimPanel() {
    setPanelType("claim");
    setPanelOpen(true);
  }

  function totalTokens() {
    if (unstakedBalance === undefined || stakedBalance === undefined) return;
    return unstakedBalance.add(stakedBalance);
  }

  function isLoading() {
    return stakedBalanceIsFetching || unstakedBalanceIsFetching || outstandingRewardIsFetching;
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
              <Strong>{isLoading() ? <LoadingSkeleton width={60} /> : votesInLastCycles} out of 5</Strong> latest voting
              cycles, and are earning <Strong>{isLoading() ? <LoadingSkeleton width={60} /> : apy}% APY</Strong>
            </>
          }
          actionLabel="Vote history"
          onClick={() => console.log("TODO")}
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
