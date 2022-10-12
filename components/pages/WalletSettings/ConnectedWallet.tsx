import { WalletIcon } from "components";
import Link from "public/assets/icons/link.svg";
import styled from "styled-components";
import { AllowedAction } from "./AllowedAction";
import { Address, BarWrapper, Header, Text, WalletWrapper } from "./styles";

interface Props {
  address: string | undefined;
  status: "delegator" | "delegate" | "none";
  walletIcon: string | undefined;
}
export function ConnectedWallet({ address, status, walletIcon }: Props) {
  return (
    <>
      <Header>
        Connected Wallet {status === "delegate" && "(Delegate)"}
        {status === "delegator" && "(Delegator)"}
      </Header>
      <Text>
        Short introduction to why this is here and how it works and more info text info text info text info text info
        text info text info text info text{" "}
      </Text>
      <Wrapper>
        <WalletWrapper>
          <WalletIcon icon={walletIcon} />
          <Address>{address}</Address>
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
        </WalletWrapper>
      </Wrapper>
    </>
  );
}

const Wrapper = styled(BarWrapper)`
  display: grid;
  align-items: center;
  grid-template-rows: 1fr;
  grid-template-columns: repeat(4, auto);
`;

const LinkedAddressIcon = styled(Link)`
  circle {
    fill: var(--black);
  }
`;
