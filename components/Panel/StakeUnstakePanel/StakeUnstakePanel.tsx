import { LoadingSkeleton } from "components/LoadingSkeleton";
import { Tabs } from "components/Tabs";
import { formatNumberForDisplay } from "helpers/formatNumber";
import { useContractsContext } from "hooks/contexts";
import { useExecuteUnstake } from "hooks/mutations";
import { useStakedBalance, useStakerDetails, useUnstakedBalance } from "hooks/queries";
import styled from "styled-components";
import { PanelFooter } from "../PanelFooter";
import { PanelTitle } from "../PanelTitle";
import { PanelWrapper } from "../styles";
import { CooldownTimer } from "./CooldownTimer";
import { Stake } from "./Stake";
import { Unstake } from "./Unstake";

export function StakeUnstakePanel() {
  const { voting } = useContractsContext();
  const { data: unstakedBalance } = useUnstakedBalance();
  const { data: stakedBalance } = useStakedBalance();
  const {
    data: { pendingUnstake, canUnstakeTime },
  } = useStakerDetails();
  const executeUnstakeMutation = useExecuteUnstake();

  const cooldownEnds = canUnstakeTime;
  const hasCooldownTimeRemaining = !!cooldownEnds && cooldownEnds > new Date();
  const hasClaimableTokens = pendingUnstake?.gt(0) ?? false;
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

  function executeUnstake() {
    executeUnstakeMutation({ voting });
  }

  function isLoading() {
    return stakedBalance === undefined || unstakedBalance === undefined;
  }

  return (
    <PanelWrapper>
      <PanelTitle title="Stake / Unstake" />
      <SectionsWrapper>
        <BalancesWrapper>
          <Balances>
            <Balance>
              <BalanceHeader>Staked balance</BalanceHeader>
              <BalanceAmount>
                {isLoading() ? (
                  <LoadingSkeleton variant="white" width={200} height={45} />
                ) : (
                  formatNumberForDisplay(stakedBalance)
                )}
              </BalanceAmount>
            </Balance>
            <Balance>
              <BalanceHeader>Unstaked balance</BalanceHeader>
              <BalanceAmount>
                {isLoading() ? (
                  <LoadingSkeleton variant="white" width={200} height={45} />
                ) : (
                  formatNumberForDisplay(unstakedBalance)
                )}
              </BalanceAmount>
            </Balance>
          </Balances>
          {showCooldownTimer && (
            <CooldownTimerWrapper>
              <CooldownTimer
                cooldownEnds={cooldownEnds}
                pendingUnstake={pendingUnstake}
                canClaim={canClaim}
                onClaim={executeUnstake}
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
