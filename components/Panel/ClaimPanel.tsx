import { Button } from "components/Button";
import useAccountDetails from "hooks/queries/useAccountDetails";
import { useContractsContext } from "hooks/contexts";
import useStakerDetails from "hooks/queries/useStakerDetails";
import useWithdrawAndRestake from "hooks/mutations/useWithdrawAndRestake";
import useWithdrawRewards from "hooks/mutations/useWithdrawRewards";
import styled from "styled-components";
import { PanelFooter } from "./PanelFooter";
import { PanelTitle } from "./PanelTitle";
import { PanelSectionText, PanelSectionTitle, PanelWrapper } from "./styles";

export function ClaimPanel() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();
  const withdrawRewardsMutation = useWithdrawRewards();
  const withdrawAndRestakeMutation = useWithdrawAndRestake();
  const {
    stakerDetails: { outstandingRewards },
  } = useStakerDetails(voting, address);

  function withdrawRewards() {
    withdrawRewardsMutation({ voting });
  }

  function withdrawAndRestake() {
    withdrawAndRestakeMutation({ voting });
  }

  return (
    <PanelWrapper>
      <PanelTitle title="Claim" />
      <SectionsWrapper>
        <RewardsWrapper>
          <RewardsHeader>Claimable Rewards</RewardsHeader>
          <Rewards>
            <Strong>{outstandingRewards}</Strong> UMA
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
