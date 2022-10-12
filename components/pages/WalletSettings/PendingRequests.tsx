import NextLink from "next/link";
import Time from "public/assets/icons/time-with-inner-circle.svg";
import styled, { CSSProperties } from "styled-components";
import { DelegationEventT } from "types/global";
import { AddressWrapper, BarButtonPrimary, BarButtonSecondary, BarWrapper, Header, Text } from "./styles";

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

  const showAcceptButton = requestType === "delegator" && acceptRequest;

  return (
    <>
      <Header>Pending {requestType} requests</Header>
      <Text>Explanation of {requestType} requests</Text>
      {pendingRequests.map(({ delegate, delegator, transactionHash }) => (
        <PendingRequestWrapper
          key={transactionHash}
          style={{ "--padding-right": showAcceptButton ? "25px" : "160px" } as CSSProperties}
        >
          <AddressWrapper>
            <PendingRequestIcon />
            <div>
              <Text>
                {requestType} wallet request sent to {requestType === "delegate" ? delegate : delegator}
              </Text>
              <Text>Waiting for approval</Text>
            </div>
          </AddressWrapper>
          <Text>
            <NextLink href={`https://goerli.etherscan.io/${transactionHash}`} passHref>
              <A target="_blank">View Transaction</A>
            </NextLink>
          </Text>
          <ButtonsWrapper>
            {showAcceptButton && <BarButtonPrimary label="accept" onClick={acceptRequest} />}
            <BarButtonSecondary label="cancel" onClick={cancelRequest} />
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
