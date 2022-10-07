import { WalletIcon } from "components";
import Link from "public/assets/icons/link.svg";
import styled from "styled-components";
import { AllowedAction } from "./AllowedAction";
import { Address, BarWrapper, WalletWrapper } from "./styles";

interface Props {
  address: string | undefined;
  isConnected: boolean;
  walletIcon?: string | undefined;
}
export function Delegator({ address, isConnected, walletIcon }: Props) {
  return (
    <Wrapper>
      <WalletWrapper>
        {isConnected ? <WalletIcon icon={walletIcon} /> : <LinkedAddressIcon />}
        <Address>{address}</Address>
      </WalletWrapper>
      <AllowedAction>Staking</AllowedAction>
      <AllowedAction>Voting</AllowedAction>
      <AllowedAction>Claiming Rewards</AllowedAction>
    </Wrapper>
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
