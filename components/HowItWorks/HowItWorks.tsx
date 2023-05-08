import { InfoBar, Loader, Tooltip } from "components";
import { tabletAndUnder } from "constant";
import { BigNumber } from "ethers";
import { formatNumberForDisplay, parseEther } from "helpers";
import {
  useDelegationContext,
  usePanelContext,
  useStakingContext,
  useUserContext,
} from "hooks";
import NextLink from "next/link";
import One from "public/assets/icons/one.svg";
import Three from "public/assets/icons/three.svg";
import Two from "public/assets/icons/two.svg";
import styled from "styled-components";

export function HowItWorks() {
  const { openPanel } = usePanelContext();
  const { stakedBalance, unstakedBalance, outstandingRewards, pendingUnstake } =
    useStakingContext();
  const { countWrongVotes, countCorrectVotes, apr, hasAddress } =
    useUserContext();
  const { isDelegate, delegatorAddress } = useDelegationContext();

  const loaderOverride = {
    shouldOverride: !hasAddress,
    children: 0,
  };

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
                  dataToWatch={stakedBalance}
                  width={50}
                  override={loaderOverride}
                >
                  {formatNumberForDisplay(stakedBalance)}
                </Loader>
              </Strong>{" "}
              {isDelegate ? "of their" : "of your"}{" "}
              <Strong>
                <Loader
                  dataToWatch={totalTokens()}
                  width={50}
                  override={loaderOverride}
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
                <Loader
                  dataToWatch={[countCorrectVotes, countWrongVotes]}
                  width={50}
                  override={loaderOverride}
                >
                  {formatNumberForDisplay(getTotalVotes(), { decimals: 0 })}
                </Loader>
              </Strong>{" "}
              vote
              {getTotalVotes()?.eq(BigNumber.from(parseEther("1"))) ? "" : "s"},
              and are earning{" "}
              <Strong>
                <Loader dataToWatch={apr} width={50} override={loaderOverride}>
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
                <Loader
                  dataToWatch={outstandingRewards}
                  width={50}
                  override={loaderOverride}
                >
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
