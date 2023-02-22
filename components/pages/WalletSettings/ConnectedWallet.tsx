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
        A delegator is a wallet that has chosen to delegate its voting power to
        another party. Delegators can only delegate to one address at a time.
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
