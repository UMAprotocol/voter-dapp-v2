import { Button, LoadingSkeleton, PanelErrorBanner } from "components";
import { mobileAndUnder } from "constant";
import { formatNumberForDisplay } from "helpers";
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
              Earn even more rewards by claiming and automatically stake/lock
              these rewards text TODO
            </PanelSectionText>
            <Button
              variant="primary"
              width="100%"
              height={45}
              label="Claim and Stake"
              onClick={withdrawAndRestake}
            />
          </ClaimAndStakeWrapper>
          <ClaimToWalletWrapper>
            <PanelSectionTitle>Claim to Wallet</PanelSectionTitle>
            <PanelSectionText>
              By claiming to your wallet you will not earn rewards text text but
              this could be an option for tax reasons text TODO.
            </PanelSectionText>
            {isDelegate ? (
              <PanelWarningText>
                Delegated wallets can only claim and restake. Claiming to your
                wallet from a delegated voting wallet is not allowed.
              </PanelWarningText>
            ) : (
              <Button
                variant="secondary"
                width="100%"
                height={45}
                label="Claim to Wallet"
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
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
