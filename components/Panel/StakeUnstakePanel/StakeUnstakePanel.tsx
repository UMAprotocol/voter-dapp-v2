import { LoadingSkeleton, Tabs } from "components";
import { maximumApprovalAmountString } from "constant";
import { parseEther } from "helpers";
import { formatNumberForDisplay, parseEtherSafe } from "helpers";
import { maximumApprovalAmount } from "helpers/web3/ethers";
import {
  useApprove,
  useContractsContext,
  useDelegationContext,
  useExecuteUnstake,
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
  const { requestUnstakeMutation, isRequestingUnstake } =
    useRequestUnstake("unstake");
  const { executeUnstakeMutation, isExecutingUnstake } =
    useExecuteUnstake("unstake");
  const cooldownEnds = canUnstakeTime;
  const hasCooldownTimeRemaining = !!cooldownEnds && cooldownEnds > new Date();
  const hasPendingUnstake = pendingUnstake?.gt(0) ?? false;
  const isReadyToUnstake = !hasCooldownTimeRemaining && hasPendingUnstake;
  const showCooldownTimer =
    isReadyToUnstake || (hasCooldownTimeRemaining && hasPendingUnstake);
  const isDelegate = getDelegationStatus() === "delegate";

  function isLoading() {
    return (
      getStakingDataFetching() ||
      isStaking ||
      isRequestingUnstake ||
      isExecutingUnstake
    );
  }

  function approve(approveAmountInput: string) {
    const approveAmount =
      approveAmountInput === maximumApprovalAmountString
        ? maximumApprovalAmount
        : parseEtherSafe(approveAmountInput);
    approveMutation({ votingToken, approveAmount });
  }

  function stake(stakeAmountInput: string, resetStakeAmount: () => void) {
    const stakeAmount = parseEther(stakeAmountInput);
    stakeMutation(
      { voting, stakeAmount },
      {
        onSuccess: () => {
          resetStakeAmount();
        },
      }
    );
  }

  function requestUnstake(unstakeAmountInput: string) {
    const unstakeAmount = parseEther(unstakeAmountInput);
    requestUnstakeMutation({ voting, unstakeAmount });
  }

  function executeUnstake() {
    if (!pendingUnstake) return;

    executeUnstakeMutation({ voting, pendingUnstake });
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
          isReadyToUnstake={isReadyToUnstake}
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
                  <LoadingSkeleton variant="white" width="80%" />
                ) : (
                  formatNumberForDisplay(stakedBalance)
                )}
              </BalanceAmount>
            </Balance>
            <Balance>
              <BalanceHeader>Unstaked balance</BalanceHeader>
              <BalanceAmount>
                {isLoading() ? (
                  <LoadingSkeleton variant="white" width="80%" />
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
                isReadyToUnstake={isReadyToUnstake}
                onExecuteUnstake={executeUnstake}
              />
            </CooldownTimerWrapper>
          )}
        </BalancesWrapper>
        <Tabs tabs={tabs} defaultValue={"Stake"} />
      </SectionsWrapper>
      <PanelFooter />
    </PanelWrapper>
  );
}

const SectionsWrapper = styled.div``;
const BalancesWrapper = styled.div`
  min-height: var(--banner-height);
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
