import { useWallets } from "@web3-onboard/react";
import { Tabs } from "components/Tabs";
import { getAccountDetails } from "components/Wallet";
import { useContractsContext } from "hooks/useContractsContext";
import useStakedBalance from "hooks/useStakedBalance";
import useUnstakedBalance from "hooks/useUnstakedBalance";
import useStakerDetails from "hooks/useStakerDetails";
import styled from "styled-components";
import { PanelFooter } from "../PanelFooter";
import { PanelTitle } from "../PanelTitle";
import { PanelWrapper } from "../styles";
import { CooldownTimer } from "./CooldownTimer";
import { Stake } from "./Stake";
import { Unstake } from "./Unstake";

export function StakeUnstakePanel() {
  const { voting, votingToken } = useContractsContext();
  const connectedWallets = useWallets();
  const { address } = getAccountDetails(connectedWallets);
  const { unstakedBalance } = useUnstakedBalance(votingToken, address);
  const { stakedBalance } = useStakedBalance(voting, address);
  const {
    stakerDetails: { pendingUnstake, canUnstakeTime },
  } = useStakerDetails(voting, address);

  const cooldownEnds = canUnstakeTime;
  const hasCooldownTimeRemaining = cooldownEnds > new Date();
  const hasClaimableTokens = pendingUnstake > 0;
  const showCooldownTimer = hasCooldownTimeRemaining && hasClaimableTokens;
  const canClaim = !hasCooldownTimeRemaining && hasClaimableTokens;

  const tabs = [
    {
      title: "Stake",
      content: <Stake />,
    },
    {
      title: "Unstake",
      content: <Unstake />,
    },
  ];

  return (
    <PanelWrapper>
      <PanelTitle title="Stake / Unstake" />
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
                pendingUnstake={pendingUnstake}
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
