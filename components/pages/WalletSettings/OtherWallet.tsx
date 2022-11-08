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
      ? "Explanation of secondary wallet when secondary is delegate."
      : "Explanation of secondary wallet when secondary is delegator.";

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
