import NextLink from "next/link";
import Time from "public/assets/icons/time-with-inner-circle.svg";
import styled, { CSSProperties } from "styled-components";
import { DelegationEventT } from "types";
import { AddressWrapper, BarButtonPrimary, BarButtonSecondary, BarWrapper, Header, Text } from "./styles";

export function PendingRequests({
  requestType,
  pendingRequests,
  acceptReceivedRequestToBeDelegate,
  ignoreReceivedRequestToBeDelegate,
  cancelSentRequestToBeDelegate,
}: {
  requestType: "delegate" | "delegator";
  pendingRequests: DelegationEventT[];
  acceptReceivedRequestToBeDelegate?: (delegatorAddress: string) => void;
  ignoreReceivedRequestToBeDelegate?: (delegatorAddress: string) => void;
  cancelSentRequestToBeDelegate?: () => void;
}) {
  if (requestType === "delegator" && !(acceptReceivedRequestToBeDelegate && ignoreReceivedRequestToBeDelegate)) {
    throw new Error(
      "`acceptReceivedRequestToBeDelegate` and `ignoreReceivedRequestToBeDelegate` are required when `requestType` is `delegator`"
    );
  }

  if (requestType === "delegate" && !cancelSentRequestToBeDelegate) {
    throw new Error("`cancelSentRequestToBeDelegate` is required when `requestType` is `delegate`");
  }

  const isDelegatorRequest =
    requestType === "delegator" && acceptReceivedRequestToBeDelegate && ignoreReceivedRequestToBeDelegate;
  const isDelegateRequest = requestType === "delegate" && cancelSentRequestToBeDelegate;

  const _pendingRequests = isDelegateRequest ? [pendingRequests[pendingRequests.length - 1]] : pendingRequests;

  return (
    <>
      <Header>Pending {requestType} requests</Header>
      <Text>Explanation of {requestType} requests</Text>
      {_pendingRequests?.map(({ delegate, delegator, transactionHash }) => (
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
              <BarButtonPrimary label="accept" onClick={() => acceptReceivedRequestToBeDelegate(delegator)} />
            )}
            {isDelegatorRequest && (
              <BarButtonSecondary label="ignore" onClick={() => ignoreReceivedRequestToBeDelegate(delegator)} />
            )}
            {isDelegateRequest && <BarButtonSecondary label="cancel" onClick={() => cancelSentRequestToBeDelegate()} />}
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
