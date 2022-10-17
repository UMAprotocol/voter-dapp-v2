import { useConnectWallet } from "@web3-onboard/react";
import { Button } from "components/Button";
import styled from "styled-components";
import { Header, Text } from "./styles";

export function NoWalletConnected() {
  const [_wallets, connect] = useConnectWallet();

  return (
    <>
      <Header>No Wallet Connected</Header>
      <Text>Wallet settings will become available once you connect your wallet.</Text>
      <ConnectButtonWrapper>
        <Button variant="primary" label="Connect" width={150} height={40} onClick={() => void connect()} />
      </ConnectButtonWrapper>
    </>
  );
}

const ConnectButtonWrapper = styled.div`
  margin-top: 20px;
`;
