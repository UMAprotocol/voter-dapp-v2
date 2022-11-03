import { WalletIcon } from "components";
import { mobileAndUnder } from "constant";
import { useUserContext } from "hooks";
import styled from "styled-components";
import { AllowedAction } from "./AllowedAction";
import { Address, BarWrapper, Header, Text, WalletWrapper } from "./styles";

interface Props {
  status: "delegator" | "delegate" | "none";
}
export function ConnectedWallet({ status }: Props) {
  const { address, walletIcon } = useUserContext();

  return (
    <>
      <Header>
        Connected Wallet {status === "delegate" && "(Delegate)"}
        {status === "delegator" && "(Delegator)"}
      </Header>
      <Text>
        Short introduction to why this is here and how it works and more info
        text info text info text info text info text info text info text info
        text{" "}
      </Text>
      <_BarWrapper>
        <WalletWrapper>
          <WalletIcon icon={walletIcon} />
          <Address>{address}</Address>
        </WalletWrapper>

        <AllowedActionsWrapper>
          {status === "delegate" ? (
            <>
              <AllowedAction>Voting</AllowedAction>
              <AllowedAction>Claiming & Restake</AllowedAction>
            </>
          ) : (
            <>
              <AllowedAction>Staking</AllowedAction>
              <AllowedAction>Voting</AllowedAction>
              <AllowedAction>Claiming Rewards</AllowedAction>
            </>
          )}
        </AllowedActionsWrapper>
      </_BarWrapper>
    </>
  );
}

const _BarWrapper = styled(BarWrapper)`
  padding-right: 160px;

  @media ${mobileAndUnder} {
    padding-right: 0;
  }
`;

const AllowedActionsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
