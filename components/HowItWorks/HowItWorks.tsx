import styled from "styled-components";
import { InfoBar } from "components/InfoBar";
import One from "public/assets/icons/one.svg";
import Two from "public/assets/icons/two.svg";
import Three from "public/assets/icons/three.svg";
import { usePanelContext } from "hooks/usePanelContext";

interface Props {
  stakedBalance: number;
  unstakedBalance: number;
  claimableRewards: number;
  cooldownEnds: Date;
  votesInLastCycles: number;
  apy: number;
}
export function HowItWorks({
  stakedBalance,
  unstakedBalance,
  claimableRewards,
  cooldownEnds,
  votesInLastCycles,
  apy,
}: Props) {
  const { setPanelType, setPanelContent, setPanelOpen } = usePanelContext();

  function openStakeUnstakePanel() {
    setPanelType("stake");
    setPanelContent({ stakedBalance, unstakedBalance, claimableRewards, cooldownEnds });
    setPanelOpen(true);
  }

  function openClaimPanel() {
    setPanelType("claim");
    setPanelContent({ claimableRewards });
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
              You are staking <strong>{stakedBalance}</strong> UMA tokens of {stakedBalance + unstakedBalance}
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
              You have voted <strong>{votesInLastCycles} out of 5</strong> latest voting cycles, and are earning{" "}
              <strong>{apy}% APY</strong>
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
              You have <strong>{claimableRewards} UMA</strong> in unclaimed rewards
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
