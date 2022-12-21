import { WalletIcon } from "components";
import { truncateEthAddress } from "helpers";
import { useUserContext } from "hooks";
import { AllowedActions } from "./AllowedActions";
import {
  Address,
  BarWrapper,
  Header,
  Text,
  TruncatedAddress,
  WalletWrapper,
} from "./styles";

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
        A "Delegator" can choose a "delegate" to perform . For more information, please refer here. Do this.
      </Text>
      <BarWrapper>
        <WalletWrapper>
          <WalletIcon icon={walletIcon} />
          <Address>{address}</Address>
          <TruncatedAddress>{truncateEthAddress(address)}</TruncatedAddress>
        </WalletWrapper>
        <AllowedActions status={status} />
      </BarWrapper>
    </>
  );
}
