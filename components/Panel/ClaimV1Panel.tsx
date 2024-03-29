import { Button, Loader, PanelErrorBanner } from "components";
import { mobileAndUnder } from "constant";
import { BigNumber } from "ethers";
import { formatNumberForDisplay } from "helpers";
import {
  useAccountDetails,
  useContractsContext,
  useV1Rewards,
  useWithdrawV1Rewards,
} from "hooks";
import styled from "styled-components";
import { PanelFooter } from "./PanelFooter";
import { PanelTitle } from "./PanelTitle";
import { PanelSectionText, PanelSectionTitle, PanelWrapper } from "./styles";

export function ClaimV1Panel() {
  const { votingWriter } = useContractsContext();
  const { address } = useAccountDetails();
  const { withdrawV1RewardsMutation } = useWithdrawV1Rewards(
    address,
    "claimV1"
  );
  const { data: v1Rewards, isLoading: v1RewardsIsLoading } =
    useV1Rewards(address);
  const claimableV1Rewards = v1Rewards?.totalRewards ?? BigNumber.from(0);

  function withdrawV1Rewards() {
    if (!v1Rewards || !votingWriter) return;

    const { totalRewards, multicallPayload } = v1Rewards;

    if (totalRewards.eq(0) || multicallPayload.length === 0) return;

    withdrawV1RewardsMutation({
      voting: votingWriter,
      totalRewards,
      multicallPayload,
    });
  }

  return (
    <PanelWrapper>
      <PanelTitle title="Claim V1 Rewards" />
      <SectionsWrapper>
        <RewardsWrapper>
          <RewardsHeader>Claimable V1 Rewards</RewardsHeader>
          <Rewards>
            <Loader isLoading={v1RewardsIsLoading} variant="white">
              <Strong>
                {formatNumberForDisplay(claimableV1Rewards)}{" "}
                <TokenSymbol>UMA</TokenSymbol>
              </Strong>
            </Loader>
          </Rewards>
        </RewardsWrapper>
        <InnerWrapper>
          <ClaimToWalletWrapper>
            <PanelSectionTitle>Claim V1 Rewards</PanelSectionTitle>
            <PanelSectionText>
              These rewards are from the V1 voting contract. It is the same UMA
              token. You can stake this UMA in the new voting contract to earn
              rewards.
            </PanelSectionText>
            <Button
              variant="primary"
              width="100%"
              height={45}
              label="Claim to Wallet"
              onClick={withdrawV1Rewards}
            />
          </ClaimToWalletWrapper>
          <PanelErrorBanner errorOrigin="claimV1" />
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

const ClaimToWalletWrapper = styled.div``;

const Strong = styled.strong`
  font-weight: 700;
`;
