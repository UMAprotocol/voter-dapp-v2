import { LoadingSkeleton, Tabs } from "components";
import { maximumApprovalAmountString } from "constant";
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
  const hasClaimableTokens = pendingUnstake?.gt(0) ?? false;
  const canClaim = !hasCooldownTimeRemaining && hasClaimableTokens;
  const showCooldownTimer =
    canClaim || (hasCooldownTimeRemaining && hasClaimableTokens);
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
    if (!unstakedBalance) return;
    const parsedStakeAmountInput = parseEtherSafe(stakeAmountInput);
    // with lots of decimal places the casting from string input to BigNumber can cause the amount to be slightly off when using the unstaked balance as the max
    // make sure the parsed stake amount is not greater than the unstaked balance or the contract will revert
    const stakeAmount = parsedStakeAmountInput.gt(unstakedBalance)
      ? unstakedBalance
      : parsedStakeAmountInput;
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
    if (!stakedBalance) return;
    const parsedUnstakeAmountInput = parseEtherSafe(unstakeAmountInput);
    // with lots of decimal places the casting from string input to BigNumber can cause the amount to be slightly off when using the staked balance as the max
    // make sure the parsed unstake amount is not greater than the staked balance or the contract will revert
    const unstakeAmount = parsedUnstakeAmountInput.gt(stakedBalance)
      ? stakedBalance
      : parsedUnstakeAmountInput;
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
