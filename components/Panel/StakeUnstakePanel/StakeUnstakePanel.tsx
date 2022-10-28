import { LoadingSkeleton, Tabs } from "components";
import { formatNumberForDisplay, parseEtherSafe } from "helpers";
import {
  useApprove,
  useContractsContext,
  useDelegationContext,
  useExecuteUnstake,
  useNotificationsContext,
  useRequestUnstake,
  useStake,
  useStakingContext,
} from "hooks";
import styled from "styled-components";
import { PanelFooter } from "../PanelFooter";
import { PanelTitle } from "../PanelTitle";
import { PanelWrapper } from "../styles";
import { CooldownTimer } from "./CooldownTimer";
import { Stake } from "./Stake";
import { Unstake } from "./Unstake";

export function StakeUnstakePanel() {
  const { voting, votingToken } = useContractsContext();
  const {
    tokenAllowance,
    stakedBalance,
    unstakedBalance,
    pendingUnstake,
    canUnstakeTime,
    getStakingDataFetching,
    unstakeCoolDown,
  } = useStakingContext();
  const { getDelegationStatus } = useDelegationContext();
  const { approveMutation } = useApprove("stake");
  const { stakeMutation, isStaking } = useStake("stake");
  const { requestUnstakeMutation, isRequestingUnstake } = useRequestUnstake("unstake");
  const { executeUnstakeMutation, isExecutingUnstake } = useExecuteUnstake("unstake");
  const { addNotification, removeNotification } = useNotificationsContext();
  const cooldownEnds = canUnstakeTime;
  const hasCooldownTimeRemaining = !!cooldownEnds && cooldownEnds > new Date();
  const hasClaimableTokens = pendingUnstake?.gt(0) ?? false;
  const canClaim = !hasCooldownTimeRemaining && hasClaimableTokens;
  const showCooldownTimer = canClaim || (hasCooldownTimeRemaining && hasClaimableTokens);
  const isDelegate = getDelegationStatus() === "delegate";

  function isLoading() {
    return getStakingDataFetching() || isStaking || isRequestingUnstake || isExecutingUnstake;
  }

  function approve(approveAmountInput: string) {
    const approveAmount = parseEtherSafe(approveAmountInput);
    approveMutation(
      { votingToken, approveAmount, addNotification },
      {
        onSuccess: (data) => {
          removeNotification(data.transactionHash);
          addNotification(`Approved ${formatNumberForDisplay(approveAmount)} UMA`, data.transactionHash);
        },
      }
    );
  }

  function stake(stakeAmountInput: string, resetStakeAmount: () => void) {
    const stakeAmount = parseEtherSafe(stakeAmountInput);
    stakeMutation(
      { voting, stakeAmount, addNotification },
      {
        onSuccess: (data) => {
          resetStakeAmount();
          removeNotification(data.transactionHash);
          addNotification(`Staked ${formatNumberForDisplay(stakeAmount)} UMA`, data.transactionHash);
        },
      }
    );
  }

  function requestUnstake(unstakeAmountInput: string) {
    const unstakeAmount = parseEtherSafe(unstakeAmountInput);
    requestUnstakeMutation(
      { voting, unstakeAmount, addNotification },
      {
        onSuccess: (data) => {
          removeNotification(data.transactionHash);
          addNotification(`Requested unstake of ${formatNumberForDisplay(unstakeAmount)} UMA`, data.transactionHash);
        },
      }
    );
  }

  function executeUnstake() {
    if (!pendingUnstake) return;

    executeUnstakeMutation(
      { voting, pendingUnstake, addNotification },
      {
        onSuccess: (data) => {
          removeNotification(data.transactionHash);
          addNotification(`Unstaked ${formatNumberForDisplay(pendingUnstake)} UMA`, data.transactionHash);
        },
      }
    );
  }

  const tabs = [
    {
      title: "Stake",
      content: (
        <Stake
          tokenAllowance={tokenAllowance}
          unstakedBalance={unstakedBalance}
          approve={approve}
          stake={stake}
          unstakeCoolDown={unstakeCoolDown}
          isDelegate={isDelegate}
        />
      ),
    },
    {
      title: "Unstake",
      content: (
        <Unstake
          stakedBalance={stakedBalance}
          pendingUnstake={pendingUnstake}
          requestUnstake={requestUnstake}
          unstakeCoolDown={unstakeCoolDown}
          canClaim={canClaim}
          isDelegate={isDelegate}
        />
      ),
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
