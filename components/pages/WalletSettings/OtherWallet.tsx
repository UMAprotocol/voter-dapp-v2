import { truncateEthAddress } from "helpers";
import Link from "public/assets/icons/link.svg";
import styled from "styled-components";
import { AllowedActions } from "./AllowedActions";
import {
  Address,
  AddressWrapper,
  BarButtonSecondary,
  BarWrapper,
  Header,
  Text,
  TruncatedAddress,
} from "./styles";

export function OtherWallet({
  status,
  address,
  remove,
}: {
  status: "delegator" | "delegate";
  address: string | undefined;
  remove: (address: string) => void;
}) {
  if (!address) return null;

  const text =
    status === "delegate"
      ? "A Delegate is a wallet that has been chosen to vote on behalf of another party. If acting as a delegate, a delegate can no longer vote for themselves. Delegates can commit & reveal votes on behalf of a delegator, but cannot claim, stake or unstake tokens. A delegate can only be a delegate for a single delegator."
      : "A Delegator is a wallet that has chosen to delegate away its voting power to another party. Delegators can only delegate to one other address. Once done, delegators can no longer commit or reveal votes, but can still claim rewards and stake/unstake tokens.";

  return (
    <>
      <Header>Other wallet ({status})</Header>
      <Text>{text}</Text>
      <BarWrapper>
        <AddressWrapper>
          {" "}
          <LinkedAddressIconWrapper>
            <LinkedAddressIcon />
          </LinkedAddressIconWrapper>
          <Address>{address}</Address>
          <TruncatedAddress>{truncateEthAddress(address)}</TruncatedAddress>
        </AddressWrapper>
        <AllowedActions status={status} />
        <ButtonWrapper>
          <BarButtonSecondary
            label={`Remove ${status}`}
            onClick={() => remove(address)}
          />
        </ButtonWrapper>
      </BarWrapper>
    </>
  );
}

const ButtonWrapper = styled.div`
  width: fit-content;
`;

const LinkedAddressIconWrapper = styled.div`
  width: 24px;
  height: 24px;
`;

const LinkedAddressIcon = styled(Link)`
  circle {
    fill: var(--black);
  }
`;
