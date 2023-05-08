import { Loader, Tabs } from "components";
import { maximumApprovalAmountString } from "constant";
import { formatNumberForDisplay, parseEther, parseEtherSafe } from "helpers";
import { maximumApprovalAmount } from "helpers/web3/ethers";
import {
  useApprove,
  useContractsContext,
  useDelegationContext,
  useExecuteUnstake,
  useRequestUnstake,
  useStake,
  useStakingContext,
  useUserContext,
} from "hooks";
import styled from "styled-components";
import { PanelFooter } from "../PanelFooter";
import { PanelTitle } from "../PanelTitle";
import { PanelWrapper } from "../styles";
import { CooldownTimer } from "./CooldownTimer";
import { Stake } from "./Stake";
import { Unstake } from "./Unstake";

export function StakeUnstakePanel() {
  const { votingWriter, votingTokenWriter } = useContractsContext();
  const {
    tokenAllowance,
    stakedBalance,
    unstakedBalance,
    pendingUnstake,
    canUnstakeTime,
    unstakeCoolDown,
  } = useStakingContext();
  const { hasAddress } = useUserContext();
  const { isDelegate } = useDelegationContext();
  const { approveMutation, isApproving } = useApprove("stake");
  const { stakeMutation } = useStake("stake");
  const { requestUnstakeMutation, isRequestingUnstake } =
    useRequestUnstake("unstake");
  const { executeUnstakeMutation } = useExecuteUnstake("unstake");
  const cooldownEnds = canUnstakeTime;
  const hasCooldownTimeRemaining = !!cooldownEnds && cooldownEnds > new Date();
  const hasPendingUnstake = pendingUnstake?.gt(0) ?? false;
  const isReadyToUnstake =
    !isDelegate && !hasCooldownTimeRemaining && hasPendingUnstake;
  const showCooldownTimer =
    isReadyToUnstake || (hasCooldownTimeRemaining && hasPendingUnstake);
  const loaderOverride = {
    isOverride: !hasAddress,
    children: 0,
  };

  function approve(approveAmountInput: string) {
    if (!votingTokenWriter) return;
    const approveAmount =
      approveAmountInput === maximumApprovalAmountString
        ? maximumApprovalAmount
        : parseEtherSafe(approveAmountInput);
    approveMutation({ votingToken: votingTokenWriter, approveAmount });
  }

  function stake(stakeAmountInput: string, resetStakeAmount: () => void) {
    if (!votingWriter) return;
    const stakeAmount = parseEther(stakeAmountInput);
    stakeMutation(
      { voting: votingWriter, stakeAmount },
      {
        onSuccess: () => {
          resetStakeAmount();
        },
      }
    );
  }

  function requestUnstake(unstakeAmountInput: string) {
    if (!votingWriter) return;
    const unstakeAmount = parseEther(unstakeAmountInput);
    requestUnstakeMutation({ voting: votingWriter, unstakeAmount });
  }

  function executeUnstake() {
    if (!pendingUnstake || !votingWriter) return;

    executeUnstakeMutation({ voting: votingWriter, pendingUnstake });
  }

  const tabs = [
    {
      title: "Stake",
      content: (
        <Stake
          tokenAllowance={tokenAllowance}
          unstakedBalance={unstakedBalance}
          approve={approve}
          isApproving={isApproving}
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
          hasCooldownTimeRemaining={hasCooldownTimeRemaining}
          isRequestingUnstake={isRequestingUnstake}
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
                <Loader
                  dataToWatch={stakedBalance}
                  variant="white"
                  width="80%"
                  override={loaderOverride}
                >
                  {formatNumberForDisplay(stakedBalance)}
                </Loader>
              </BalanceAmount>
            </Balance>
            <Balance>
              <BalanceHeader>Unstaked balance</BalanceHeader>
              <BalanceAmount>
                <Loader
                  dataToWatch={unstakedBalance}
                  variant="white"
                  width="80%"
                  override={loaderOverride}
                >
                  {formatNumberForDisplay(unstakedBalance)}
                </Loader>
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
