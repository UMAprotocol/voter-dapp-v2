import { InfoBar, Loader, Tooltip } from "components";
import { tabletAndUnder } from "constant";
import { BigNumber } from "ethers";
import { formatNumberForDisplay, parseEther } from "helpers";
import {
  useAccountDetails,
  useDelegationContext,
  usePanelContext,
  useStakedBalance,
  useStakerDetails,
  useUnstakedBalance,
  useUserVotingAndStakingDetails,
} from "hooks";
import NextLink from "next/link";
import One from "public/assets/icons/one.svg";
import Three from "public/assets/icons/three.svg";
import Two from "public/assets/icons/two.svg";
import styled from "styled-components";

export function HowItWorks() {
  const { openPanel } = usePanelContext();
  const { address: userAddress } = useAccountDetails();
  const {
    isDelegate,
    delegatorAddress,
    isLoading: delegationDataIsLoading,
    outstandingRewards,
  } = useDelegationContext();
  const stakingAddress = isDelegate ? delegatorAddress : userAddress;
  const { data: stakedBalance, isLoading: stakedBalanceIsLoading } =
    useStakedBalance(stakingAddress);
  const { data: unstakedBalance, isLoading: unstakedBalanceIsLoading } =
    useUnstakedBalance(stakingAddress);
  const { data: stakerDetails, isLoading: stakerDetailsIsLoading } =
    useStakerDetails(stakingAddress);
  const { pendingUnstake } = stakerDetails || {};
  const {
    data: votingAndStakingDetails,
    isLoading: votingAndStakingDetailsIsLoading,
  } = useUserVotingAndStakingDetails(stakingAddress);
  const { countWrongVotes, countCorrectVotes, apr } =
    votingAndStakingDetails || {};

  function openStakeUnstakePanel() {
    openPanel("stake");
  }

  function openClaimPanel() {
    openPanel("claim");
  }

  function totalTokens() {
    if (
      unstakedBalance === undefined ||
      stakedBalance === undefined ||
      pendingUnstake === undefined
    )
      return;
    return unstakedBalance.add(stakedBalance).add(pendingUnstake);
  }

  function getTotalVotes() {
    return (countWrongVotes || BigNumber.from(0)).add(
      countCorrectVotes || BigNumber.from(0)
    );
  }

  return (
    <OuterWrapper>
      <InnerWrapper>
        <Title>How it works:</Title>
        <InfoBar
          label={
            <>
              <IconWrapper>
                <One />
              </IconWrapper>
              Stake UMA
            </>
          }
          content={
            <>
              {isDelegate ? (
                <Tooltip
                  label={
                    delegatorAddress ? (
                      <>
                        <strong>Delegator address</strong> {delegatorAddress}
                      </>
                    ) : (
                      ""
                    )
                  }
                >
                  <span>
                    <Link href="/wallet-settings">Your delegator</Link> is
                    staking
                  </span>
                </Tooltip>
              ) : (
                "You are staking"
              )}{" "}
              <Strong>
                <Loader
                  isLoading={stakedBalanceIsLoading || delegationDataIsLoading}
                  width={50}
                >
                  {formatNumberForDisplay(stakedBalance)}
                </Loader>
              </Strong>{" "}
              {isDelegate ? "of their" : "of your"}{" "}
              <Strong>
                <Loader
                  isLoading={
                    stakedBalanceIsLoading ||
                    unstakedBalanceIsLoading ||
                    stakerDetailsIsLoading ||
                    delegationDataIsLoading
                  }
                  width={50}
                >
                  {formatNumberForDisplay(totalTokens())}
                </Loader>
              </Strong>{" "}
              UMA tokens.
            </>
          }
          actionLabel="Stake/Unstake"
          onClick={openStakeUnstakePanel}
        />
        <InfoBar
          label={
            <>
              <IconWrapper>
                <Two />
              </IconWrapper>
              Vote
            </>
          }
          content={
            <>
              You have voted in{" "}
              <Strong>
                <Loader isLoading={votingAndStakingDetailsIsLoading} width={50}>
                  {formatNumberForDisplay(getTotalVotes(), { decimals: 0 })}
                </Loader>
              </Strong>{" "}
              vote
              {getTotalVotes()?.eq(BigNumber.from(parseEther("1"))) ? "" : "s"},
              and are earning{" "}
              <Strong>
                <Loader isLoading={votingAndStakingDetailsIsLoading} width={50}>
                  {formatNumberForDisplay(apr, { decimals: 1 })}
                </Loader>
                % APR.
              </Strong>{" "}
            </>
          }
          actionLabel="Vote history"
          onClick={() => openPanel("history")}
        />
        <InfoBar
          label={
            <>
              <IconWrapper>
                <Three />
              </IconWrapper>
              Get rewards
            </>
          }
          content={
            <>
              Your unclaimed UMA rewards:{" "}
              <Strong>
                <Loader isLoading={stakerDetailsIsLoading} width={50}>
                  {formatNumberForDisplay(outstandingRewards, { decimals: 3 })}
                </Loader>
              </Strong>{" "}
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
  background: var(--white);
`;

const InnerWrapper = styled.div`
  padding-inline: var(--page-padding);
  padding-block: 30px;
  max-width: var(--page-width);
  margin-inline: auto;
  > div {
    margin-bottom: 5px;
  }
  @media ${tabletAndUnder} {
    padding-inline: 0;
  }
`;

const Title = styled.h1`
  padding-inline: 5px;
  font: var(--header-md);
  margin-bottom: 20px;
`;

const Strong = styled.strong`
  font-weight: 700;
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
  padding-top: 2px;
`;

const Link = styled(NextLink)`
  color: inherit;
  text-decoration: underline;
`;
