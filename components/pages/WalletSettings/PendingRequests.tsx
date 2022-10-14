import NextLink from "next/link";
import Time from "public/assets/icons/time-with-inner-circle.svg";
import styled, { CSSProperties } from "styled-components";
import { DelegationEventT } from "types/global";
import { AddressWrapper, BarButtonPrimary, BarButtonSecondary, BarWrapper, Header, Text } from "./styles";

export function PendingRequests({
  requestType,
  pendingRequests,
  acceptDelegatorRequest,
  ignoreRequestToBeDelegate,
  acceptDelegateRequest,
  cancelDelegateRequest,
}: {
  requestType: "delegate" | "delegator";
  pendingRequests: DelegationEventT[];
  acceptDelegatorRequest?: (delegatorAddress: string) => void;
  ignoreRequestToBeDelegate?: (delegatorAddress: string) => void;
  acceptDelegateRequest?: (delegateAddress: string) => void;
  cancelDelegateRequest?: (delegateAddress: string) => void;
}) {
  if (requestType === "delegator" && !(acceptDelegatorRequest && ignoreRequestToBeDelegate)) {
    throw new Error(
      "`acceptDelegatorRequest` and `ignoreRequestToBeDelegate` are required when `requestType` is `delegator`"
    );
  }

  if (requestType === "delegate" && !(acceptDelegateRequest && cancelDelegateRequest)) {
    throw new Error(
      "`acceptDelegateRequest` and `cancelDelegateRequest` are required when `requestType` is `delegate`"
    );
  }

  const isDelegatorRequest = requestType === "delegator" && acceptDelegatorRequest && ignoreRequestToBeDelegate;
  const isDelegateRequest = requestType === "delegate" && acceptDelegateRequest && cancelDelegateRequest;

  return (
    <>
      <Header>Pending {requestType} requests</Header>
      <Text>Explanation of {requestType} requests</Text>
      {pendingRequests.map(({ delegate, delegator, transactionHash }) => (
        <PendingRequestWrapper
          key={transactionHash}
          style={{ "--padding-right": isDelegatorRequest ? "25px" : "160px" } as CSSProperties}
        >
          <AddressWrapper>
            <PendingRequestIcon />
            <div>
              {isDelegatorRequest && <Text>Account {delegator} wants to delegate voting to your address.</Text>}
              {isDelegateRequest && <Text>You requested {delegate} to be your delegated voting address.</Text>}
              <Text>Waiting for approval</Text>
            </div>
          </AddressWrapper>
          <Text>
            <NextLink href={`https://goerli.etherscan.io/tx/${transactionHash}`} passHref>
              <A target="_blank">View Transaction</A>
            </NextLink>
          </Text>
          <ButtonsWrapper>
            {isDelegatorRequest && (
              <BarButtonPrimary label="accept" onClick={() => acceptDelegatorRequest(delegator)} />
            )}
            {isDelegatorRequest && (
              <BarButtonSecondary label="ignore" onClick={() => ignoreRequestToBeDelegate(delegator)} />
            )}
            {isDelegateRequest && <BarButtonSecondary label="cancel" onClick={() => cancelDelegateRequest(delegate)} />}
          </ButtonsWrapper>
        </PendingRequestWrapper>
      ))}
    </>
  );
}

const PendingRequestWrapper = styled(BarWrapper)`
  padding-right: var(--padding-right);
`;

const ButtonsWrapper = styled.div`
  display: flex;
  gap: 15px;
`;

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
