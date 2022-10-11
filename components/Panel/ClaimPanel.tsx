import { Button, LoadingSkeleton, PanelErrorBanner } from "components";
import { formatNumberForDisplay } from "helpers";
import { useContractsContext, useStakingContext, useWithdrawAndRestake, useWithdrawRewards } from "hooks";
import styled from "styled-components";
import { PanelFooter } from "./PanelFooter";
import { PanelTitle } from "./PanelTitle";
import { PanelSectionText, PanelSectionTitle, PanelWrapper } from "./styles";

export function ClaimPanel() {
  const { voting } = useContractsContext();
  const { withdrawRewardsMutation, isWithdrawingRewards } = useWithdrawRewards("claim");
  const { withdrawAndRestakeMutation, isWithdrawingAndRestaking } = useWithdrawAndRestake("claim");
  const { outstandingRewards, getStakingDataFetching: getBalancesFetching } = useStakingContext();

  function withdrawRewards() {
    withdrawRewardsMutation({ voting });
  }

  function withdrawAndRestake() {
    withdrawAndRestakeMutation({ voting });
  }

  function isLoading() {
    return getBalancesFetching() || isWithdrawingAndRestaking || isWithdrawingRewards;
  }

  return (
    <PanelWrapper>
      <PanelTitle title="Claim" />
      <SectionsWrapper>
        <RewardsWrapper>
          <RewardsHeader>Claimable Rewards</RewardsHeader>
          <Rewards>
            <Strong>
              {isLoading() ? (
                <LoadingSkeleton variant="white" width={150} height={32} />
              ) : (
                formatNumberForDisplay(outstandingRewards)
              )}
            </Strong>{" "}
            UMA
          </Rewards>
        </RewardsWrapper>
        <InnerWrapper>
          <ClaimAndStakeWrapper>
            <PanelSectionTitle>Claim and Stake</PanelSectionTitle>
            <PanelSectionText>
              Earn even more rewards by claiming and automatically stake/lock these rewards text TODO
            </PanelSectionText>
            <Button variant="primary" width="100%" height={45} label="Claim and Stake" onClick={withdrawAndRestake} />
          </ClaimAndStakeWrapper>
          <ClaimToWalletWrapper>
            <PanelSectionTitle>Claim to Wallet</PanelSectionTitle>
            <PanelSectionText>
              By claiming to your wallet you will not earn rewards text text but this could be an option for tax reasons
              text TODO.
            </PanelSectionText>
            <Button variant="secondary" width="100%" height={45} label="Claim to Wallet" onClick={withdrawRewards} />
          </ClaimToWalletWrapper>
          <PanelErrorBanner errorType="claim" />
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
  font: var(--header-lg);
  font-weight: 300;
  strong {
    font-weight: 700;
  }
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
