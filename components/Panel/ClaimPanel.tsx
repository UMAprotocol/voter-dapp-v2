import { Button } from "components/Button";
import styled from "styled-components";
import { PanelFooter } from "./PanelFooter";
import { PanelTitle } from "./PanelTitle";
import { PanelWrapper } from "./styles";

export function ClaimPanel() {
  return (
    <PanelWrapper>
      <PanelTitle panelType="claim" panelContent={null} />
      <SectionsWrapper>
        <RewardsWrapper>
          <RewardsHeader>Claimable Rewards</RewardsHeader>
          <Rewards>
            <strong>92.678</strong> UMA
          </Rewards>
        </RewardsWrapper>
        <InnerWrapper>
          <ClaimAndStakeWrapper>
            <SectionHeader>Claim and Stake</SectionHeader>
            <SectionDescription>
              Earn even more rewards by claiming and automatically stake/lock these rewards text TODO
            </SectionDescription>
            <Button
              variant="primary"
              width="100%"
              height={45}
              label="Claim and Stake"
              onClick={() => console.log("TODO Claim and Stake")}
            />
          </ClaimAndStakeWrapper>
          <ClaimToWalletWrapper>
            <SectionHeader>Claim to Wallet</SectionHeader>
            <SectionDescription>
              By claiming to your wallet you will not earn rewards text text but this could be an option for tax reasons
              text TODO.
            </SectionDescription>
            <Button
              variant="secondary"
              width="100%"
              height={45}
              label="Claim to Wallet"
              onClick={() => console.log("TODO Claim to Wallet")}
            />
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

const SectionHeader = styled.h2`
  font: var(--header-sm);
`;

const SectionDescription = styled.p`
  font: var(--text-sm);
  margin-bottom: 15px;
`;

const ClaimAndStakeWrapper = styled.div`
  padding-bottom: 25px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--black-opacity-25);
`;

const ClaimToWalletWrapper = styled.div``;
