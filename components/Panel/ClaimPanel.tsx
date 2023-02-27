import { Button, LoadingSkeleton, PanelErrorBanner } from "components";
import { mobileAndUnder } from "constant";
import { formatNumberForDisplay, parseEtherSafe } from "helpers";
import {
  useContractsContext,
  useDelegationContext,
  useStakingContext,
  useWithdrawAndRestake,
  useWithdrawRewards,
} from "hooks";
import styled from "styled-components";
import { PanelFooter } from "./PanelFooter";
import { PanelTitle } from "./PanelTitle";
import {
  PanelSectionText,
  PanelSectionTitle,
  PanelWarningText,
  PanelWrapper,
} from "./styles";

// amounts below this will show up in the UI as effectively 0, so we should disable claiming to be consistent
const minimumAmountClaimable = parseEtherSafe(".01");

export function ClaimPanel() {
  const { voting } = useContractsContext();
  const { getDelegationStatus } = useDelegationContext();
  const { withdrawRewardsMutation, isWithdrawingRewards } =
    useWithdrawRewards("claim");
  const { withdrawAndRestakeMutation, isWithdrawingAndRestaking } =
    useWithdrawAndRestake("claim");
  const { outstandingRewards, getStakingDataFetching } = useStakingContext();
  const isDelegate = getDelegationStatus() === "delegate";

  function withdrawRewards() {
    if (!outstandingRewards) return;

    withdrawRewardsMutation({ voting, outstandingRewards });
  }

  function withdrawAndRestake() {
    if (!outstandingRewards) return;

    withdrawAndRestakeMutation({ voting, outstandingRewards });
  }

  function isLoading() {
    return (
      getStakingDataFetching() ||
      isWithdrawingAndRestaking ||
      isWithdrawingRewards
    );
  }

  return (
    <PanelWrapper>
      <PanelTitle title="Claim" />
      <SectionsWrapper>
        <RewardsWrapper>
          <RewardsHeader>Claimable Rewards</RewardsHeader>
          <Rewards>
            {isLoading() ? (
              <LoadingSkeleton variant="white" />
            ) : (
              <Strong>
                {formatNumberForDisplay(outstandingRewards)}{" "}
                <TokenSymbol>UMA</TokenSymbol>
              </Strong>
            )}{" "}
          </Rewards>
        </RewardsWrapper>
        <InnerWrapper>
          <ClaimAndStakeWrapper>
            <PanelSectionTitle>Claim and Stake</PanelSectionTitle>
            <PanelSectionText>
              Compound your UMA by claiming and restaking your rewards.
            </PanelSectionText>
            <Button
              variant="primary"
              width="100%"
              height={45}
              label="Claim and Stake"
              disabled={
                !outstandingRewards ||
                outstandingRewards.lt(minimumAmountClaimable)
              }
              onClick={withdrawAndRestake}
            />
          </ClaimAndStakeWrapper>
          <ClaimToWalletWrapper>
            <PanelSectionTitle>Claim to Wallet</PanelSectionTitle>
            {!isDelegate && (
              <PanelSectionText>
                You will not be able to vote or earn rewards with UMA claimed to
                your wallet.
              </PanelSectionText>
            )}
            {isDelegate ? (
              <PanelWarningText>
                Delegate wallets can only claim and restake. You cannot claim
                delegator rewards to your own wallet as a delegate.
              </PanelWarningText>
            ) : (
              <Button
                variant="secondary"
                width="100%"
                height={45}
                label="Claim to Wallet"
                disabled={
                  !outstandingRewards ||
                  outstandingRewards.lt(minimumAmountClaimable)
                }
                onClick={withdrawRewards}
              />
            )}
          </ClaimToWalletWrapper>
          <PanelErrorBanner errorOrigin="claim" />
        </InnerWrapper>
      </SectionsWrapper>
      <PanelFooter />
    </PanelWrapper>
  );
}

const SectionsWrapper = styled.div``;

const InnerWrapper = styled.div`
  padding-inline: 30px;
  padding-block: 20px;

  @media ${mobileAndUnder} {
    padding-inline: 10px;
  }
`;

const RewardsWrapper = styled.div`
  min-height: var(--banner-height);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-block: 20px;
  background: var(--red-500);
  color: var(--white);
`;

const RewardsHeader = styled.h2`
  font: var(--text-md);
`;

const Rewards = styled.p`
  width: 50%;
  font: var(--header-lg);
  text-align: center;
  white-space: nowrap;
`;

const TokenSymbol = styled.span`
  font: inherit;
  font-weight: 300;
`;

const ClaimAndStakeWrapper = styled.div`
  padding-bottom: 25px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--black-opacity-25);
`;

const ClaimToWalletWrapper = styled.div``;

const Strong = styled.strong`
  font-weight: 700;
`;
