import NextLink from "next/link";
import Time from "public/assets/icons/time-with-inner-circle.svg";
import styled, { CSSProperties } from "styled-components";
import { DelegationEventT } from "types";
import {
  AddressWrapper,
  BarButtonPrimary,
  BarButtonSecondary,
  BarWrapper,
  Header,
  Text,
} from "./styles";

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
  if (
    requestType === "delegate" &&
    !(acceptReceivedRequestToBeDelegate && ignoreReceivedRequestToBeDelegate)
  ) {
    throw new Error(
      "`acceptReceivedRequestToBeDelegate` and `ignoreReceivedRequestToBeDelegate` are required when `requestType` is `delegator`"
    );
  }

  if (requestType === "delegator" && !cancelSentRequestToBeDelegate) {
    throw new Error(
      "`cancelSentRequestToBeDelegate` is required when `requestType` is `delegate`"
    );
  }

  const isReceivedRequestToBeDelegate =
    requestType === "delegate" &&
    acceptReceivedRequestToBeDelegate &&
    ignoreReceivedRequestToBeDelegate;

  const isSentRequestToBeDelegate =
    requestType === "delegator" && cancelSentRequestToBeDelegate;

  // we only allow the user to _send_ one request to be delegate at a time in the UI
  // but the user can _receive_ multiple requests to be delegate
  // we only show the most recent request to be delegate in the UI just in case the user has somehow sent more than one, by using the contracts directly for example
  const _pendingRequests = isSentRequestToBeDelegate
    ? [pendingRequests[pendingRequests.length - 1]]
    : pendingRequests;

  return (
    <>
      <Header>
        Pending{" "}
        {isSentRequestToBeDelegate
          ? "sent requests to be delegate"
          : "received requests to be delegate"}
      </Header>
      <Text>
        Explanation of{" "}
        {isSentRequestToBeDelegate
          ? "sent requests to be delegate"
          : "received requests to be delegate"}{" "}
        requests
      </Text>
      {_pendingRequests?.map(({ delegate, delegator, transactionHash }) => (
        <PendingRequestWrapper
          key={transactionHash}
          style={
            {
              "--padding-right": isReceivedRequestToBeDelegate
                ? "25px"
                : "160px",
            } as CSSProperties
          }
        >
          <AddressWrapper>
            <IconWrapper>
              <PendingRequestIcon />
            </IconWrapper>
            <div>
              {isReceivedRequestToBeDelegate && (
                <Text>
                  Account {delegator} wants to delegate voting to your address.
                </Text>
              )}
              {isSentRequestToBeDelegate && (
                <Text>
                  You requested {delegate} to be your delegated voting address.
                </Text>
              )}
              <Text>
                Waiting for approval |{" "}
                <NextLink
                  href={`https://goerli.etherscan.io/tx/${transactionHash}`}
                  passHref
                >
                  <A target="_blank">View Transaction</A>
                </NextLink>
              </Text>
            </div>
          </AddressWrapper>
          <ButtonsWrapper>
            {isReceivedRequestToBeDelegate && (
              <BarButtonPrimary
                label="accept"
                onClick={() => acceptReceivedRequestToBeDelegate(delegator)}
              />
            )}
            {isReceivedRequestToBeDelegate && (
              <BarButtonSecondary
                label="ignore"
                onClick={() => ignoreReceivedRequestToBeDelegate(delegator)}
              />
            )}
            {isSentRequestToBeDelegate && (
              <BarButtonSecondary
                label="cancel"
                onClick={() => cancelSentRequestToBeDelegate()}
              />
            )}
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

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
`;
