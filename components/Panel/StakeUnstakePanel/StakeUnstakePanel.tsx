import { Tabs } from "components/Tabs";
import styled from "styled-components";
import { PanelContentT, StakePanelContentT } from "types/global";
import { PanelFooter } from "../PanelFooter";
import { PanelTitle } from "../PanelTitle";
import { PanelWrapper } from "../styles";
import { CooldownTimer } from "./CooldownTimer";
import { Stake } from "./Stake";
import { Unstake } from "./Unstake";

interface Props {
  content: PanelContentT;
}
export function StakeUnstakePanel({ content }: Props) {
  if (!content) return null;

  const { stakedBalance, unstakedBalance, claimableRewards, cooldownEnds } = content as StakePanelContentT;

  const hasCooldownTimeRemaining = cooldownEnds > new Date();
  const hasClaimableRewards = claimableRewards > 0;
  const showCooldownTimer = hasCooldownTimeRemaining && hasClaimableRewards;
  const canClaim = !hasCooldownTimeRemaining && hasClaimableRewards;

  const tabs = [
    {
      title: "Stake",
      content: <Stake />,
    },
    {
      title: "Unstake",
      content: <Unstake canClaim={canClaim} />,
    },
  ];

  return (
    <PanelWrapper>
      <PanelTitle panelType="stake" panelContent={null} />
      <SectionsWrapper>
        <BalancesWrapper>
          <Balances>
            <Balance>
              <BalanceHeader>Staked balance</BalanceHeader>
              <BalanceAmount>{stakedBalance}</BalanceAmount>
            </Balance>
            <Balance>
              <BalanceHeader>Unstaked balance</BalanceHeader>
              <BalanceAmount>{unstakedBalance}</BalanceAmount>
            </Balance>
          </Balances>
          {showCooldownTimer && (
            <CooldownTimerWrapper>
              <CooldownTimer
                cooldownEnds={cooldownEnds}
                claimableRewards={claimableRewards}
                canClaim={canClaim}
                onClaim={() => console.log("TODO implement onClaim")}
              />
            </CooldownTimerWrapper>
          )}
        </BalancesWrapper>
        <Tabs tabs={tabs} />
      </SectionsWrapper>
      <PanelFooter />
    </PanelWrapper>
  );
}

const SectionsWrapper = styled.div``;
const BalancesWrapper = styled.div`
  display: grid;
  background: var(--red-500);
  color: var(--white);
  padding-top: 25px;
  padding-bottom: 20px;
`;

const Balances = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  place-items: center;
`;

const Balance = styled.div`
  width: 100%;
  text-align: center;
  &:first-child {
    border-right: 1px solid var(--white);
  }
`;

const CooldownTimerWrapper = styled.div`
  margin-top: 30px;
  margin-inline: 30px;
`;

const BalanceHeader = styled.h2`
  font: var(--text-md);
`;

const BalanceAmount = styled.p`
  font: var(--header-lg);
`;
