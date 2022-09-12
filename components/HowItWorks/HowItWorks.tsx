import { InfoBar } from "components/InfoBar";
import { useContractsContext, usePanelContext } from "hooks/contexts";
import { useAccountDetails, useStakedBalance, useUnstakedBalance } from "hooks/queries";
import { useOutstandingRewards } from "hooks/queries";
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
  const { voting, votingToken } = useContractsContext();
  const { address } = useAccountDetails();
  const { unstakedBalance } = useUnstakedBalance(votingToken, address);
  const { stakedBalance } = useStakedBalance(voting, address);
  const { outstandingRewards } = useOutstandingRewards();

  function openStakeUnstakePanel() {
    setPanelType("stake");
    setPanelOpen(true);
  }

  function openClaimPanel() {
    setPanelType("claim");
    setPanelOpen(true);
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
              You are staking <Strong>{stakedBalance}</Strong> UMA tokens of {stakedBalance! + unstakedBalance!}
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
              You have voted <Strong>{votesInLastCycles} out of 5</Strong> latest voting cycles, and are earning{" "}
              <Strong>{apy}% APY</Strong>
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
              You have <Strong>{outstandingRewards} UMA</Strong> in unclaimed rewards
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
