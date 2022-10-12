import { Button } from "components/Button";
import NextLink from "next/link";
import Time from "public/assets/icons/time-with-inner-circle.svg";
import styled from "styled-components";
import { DelegationEventT } from "types/global";
import { Header, Text } from "./styles";

export function PendingRequests({
  requestType,
  pendingRequests,
  acceptRequest,
  cancelRequest,
}: {
  requestType: "delegate" | "delegator";
  pendingRequests: DelegationEventT[];
  acceptRequest?: () => void;
  cancelRequest: () => void;
}) {
  if (requestType === "delegator" && !acceptRequest) {
    throw new Error("acceptRequest is required when requestType is delegate");
  }

  return (
    <>
      <Header>Pending {requestType} requests</Header>
      <Text>Explanation of {requestType} requests</Text>
      {pendingRequests.map(({ delegate, delegator, transactionHash }) => (
        <div key={transactionHash}>
          <PendingRequestIcon />
          <Text>
            {requestType} wallet request sent to {requestType === "delegate" ? delegate : delegator}
          </Text>
          <Text>
            Waiting for approval |{" "}
            <NextLink href={`https://goerli.etherscan.io/${transactionHash}`} passHref>
              <A target="_blank">View Transaction</A>
            </NextLink>
          </Text>
          {requestType === "delegator" && <Button variant="primary" label="accept" onClick={acceptRequest} />}
          <Button variant="secondary" label="cancel" onClick={cancelRequest} />
        </div>
      ))}
    </>
  );
}

const PendingRequestIcon = styled(Time)`
  margin-top: 2px;
`;

const A = styled.a`
  color: var(--red-500);
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;
