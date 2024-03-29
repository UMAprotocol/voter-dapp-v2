import { mobileAndUnder } from "constant";
import { truncateEthAddress } from "helpers";
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
import { config } from "helpers/config";

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
          ? "sent delegation requests"
          : "received requests to be a delegate"}
      </Header>
      <Text>
        {" "}
        {isSentRequestToBeDelegate
          ? "Once accepted, requested addresses will become your voting delegate."
          : "Accept a request to become a delegate."}{" "}
      </Text>
      {_pendingRequests?.map(({ delegate, delegator, transactionHash }) => (
        <BarWrapper
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
                  Account {truncateEthAddress(delegator)} wants to delegate
                  voting to your address.
                </Text>
              )}
              {isSentRequestToBeDelegate && (
                <Text>
                  You requested {truncateEthAddress(delegate)} to be your
                  delegated voting address.
                </Text>
              )}
            </div>
          </AddressWrapper>
          <WaitingForApprovalWrapper>
            <Text>
              Waiting for approval |{" "}
              <NextLink
                href={config.makeTransactionHashLink(transactionHash)}
                passHref
                target="_blank"
              >
                <A>View Transaction</A>
              </NextLink>
            </Text>
          </WaitingForApprovalWrapper>
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
        </BarWrapper>
      ))}
    </>
  );
}

const ButtonsWrapper = styled.div`
  display: flex;
  gap: 15px;

  @media ${mobileAndUnder} {
    display: grid;
  }
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

const WaitingForApprovalWrapper = styled.div``;
