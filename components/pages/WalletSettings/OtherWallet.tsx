import Link from "public/assets/icons/link.svg";
import styled from "styled-components";
import { AllowedAction } from "./AllowedAction";
import { AddressWrapper, BarButtonSecondary, BarWrapper, Header, Text } from "./styles";

export function OtherWallet({
  status,
  address,
  remove,
}: {
  status: "delegator" | "delegate";
  address: string | undefined;
  remove: () => void;
}) {
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
          <Text>{address}</Text>
        </AddressWrapper>
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
        <BarButtonSecondary label={`Remove ${status}`} onClick={remove} />
      </BarWrapper>
    </>
  );
}

const LinkedAddressIconWrapper = styled.div`
  width: 24px;
  height: 24px;
`;

const LinkedAddressIcon = styled(Link)`
  circle {
    fill: var(--black);
  }
`;
