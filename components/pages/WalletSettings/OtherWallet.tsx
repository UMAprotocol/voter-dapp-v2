import { Button } from "components/Button";
import Link from "public/assets/icons/link.svg";
import styled from "styled-components";
import { AllowedAction } from "./AllowedAction";
import { Address, Header, Text } from "./styles";

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
      <Header>Other wallet</Header>
      <Text>{text}</Text>
      <div>
        <LinkedAddressIcon />
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
        <Button variant="primary" label="Remove wallet" onClick={remove} />
      </div>
    </>
  );
}

const LinkedAddressIcon = styled(Link)`
  circle {
    fill: var(--black);
  }
`;
