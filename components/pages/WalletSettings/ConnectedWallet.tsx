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
      {status === "delegator" && (
        <Text>
          A delegator is a wallet that has chosen to delegate its voting power
          to another party. Delegators can only delegate to one address at a
          time.
        </Text>
      )}
      {status === "delegate" && (
        <Text>
          A delegate is a wallet that has been chosen to vote on behalf of
          another party. If acting as a delegate, a delegate can no longer vote
          for themselves. Delegates can commit & reveal votes on behalf of a
          delegator, as well as claim and stake reward tokens. A delegate cannot
          unstake tokens for a delegator. A delegate can only be a delegate for
          a single delegator.
        </Text>
      )}
      <BarWrapper>
        <WalletWrapper>
          <WalletIcon icon={walletIcon} />
          <Address>{address ?? "No wallet connected"}</Address>
          {address && (
            <TruncatedAddress>{truncateEthAddress(address)}</TruncatedAddress>
          )}
        </WalletWrapper>
        <AllowedActions status={status} />
      </BarWrapper>
    </>
  );
}
