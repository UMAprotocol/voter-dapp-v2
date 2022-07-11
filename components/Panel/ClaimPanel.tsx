import { Button } from "components/Button";
import styled from "styled-components";
import { PanelContentT } from "types/global";

interface Props {
  content: PanelContentT;
}
export function ClaimPanel({ content }: Props) {
  return (
    <Wrapper>
      <RewardsWrapper>
        <RewardsHeader>Claimable Rewards</RewardsHeader>
        <Rewards>
          <strong>92.678</strong> UMA
        </Rewards>
      </RewardsWrapper>
      <ClaimAndStakeWrapper>
        <ClaimAndStakeHeader>Claim and Stake</ClaimAndStakeHeader>
        <ClaimAndStakeDescription>
          Earn even more rewards by claiming and automatically stake/lock these rewards text TODO
        </ClaimAndStakeDescription>
        <Button variant="primary" label="Claim and Stake" onClick={() => console.log("TODO Claim and Stake")} />
      </ClaimAndStakeWrapper>
      <ClaimToWalletWrapper>
        <ClaimToWalletHeader>Claim to Wallet</ClaimToWalletHeader>
        <ClaimToWalletDescription>
          By claiming to your wallet you will not earn rewards text text but this could be an option for tax reasons
          text TODO.
        </ClaimToWalletDescription>
        <Button variant="secondary" label="Claim to Wallet" onClick={() => console.log("TODO Claim to Wallet")} />
      </ClaimToWalletWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div``;

const RewardsWrapper = styled.div``;

const RewardsHeader = styled.h2``;

const Rewards = styled.p``;

const ClaimAndStakeWrapper = styled.div``;

const ClaimAndStakeHeader = styled.h2``;

const ClaimAndStakeDescription = styled.p``;

const ClaimToWalletWrapper = styled.div``;

const ClaimToWalletHeader = styled.h2``;

const ClaimToWalletDescription = styled.p``;
