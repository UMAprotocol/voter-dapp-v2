import styled from "styled-components";
import { InfoBar } from "components/InfoBar";
import One from "public/assets/icons/one.svg";
import Two from "public/assets/icons/two.svg";
import Three from "public/assets/icons/three.svg";
import { usePanelContext } from "hooks/usePanelContext";
import useUnstakedBalance from "hooks/useUnstakedBalance";
import { useContractsContext } from "hooks/useContractsContext";
import useAccountDetails from "hooks/useAccountDetails";
import useStakerDetails from "hooks/useStakerDetails";
import useStakedBalance from "hooks/useStakedBalance";

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
  const {
    stakerDetails: { outstandingRewards },
  } = useStakerDetails(voting, address);

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
              You have <strong>{outstandingRewards} UMA</strong> in unclaimed rewards
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
