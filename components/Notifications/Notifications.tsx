import { Portal } from "@reach/portal";
import { LoadingSpinner } from "components/LoadingSpinner";
import { NotificationsContext } from "contexts";
import NextLink from "next/link";
import { ReactNode, useContext } from "react";
import styled from "styled-components";
import { NotificationT } from "types";

export function Notifications() {
  const { notifications, removeNotification } = useContext(NotificationsContext);
  return (
    <Portal>
      {notifications.map((notification, i) => (
        <Notification key={i} {...notification} dismiss={removeNotification} />
      ))}
    </Portal>
  );
}

function Notification({
  description,
  transactionHash,
  dismiss,
}: NotificationT & { dismiss: (description: ReactNode) => void }) {
  return (
    <Wrapper>
      <LoadingSpinnerWrapper>
        <LoadingSpinner size={32} />
      </LoadingSpinnerWrapper>
      <TextWrapper>
        <Description>{description}</Description>
        {transactionHash && (
          <NextLink href={`https://goerli.etherscan.io/tx/${transactionHash}`} passHref>
            <A target="_blank" rel="noopener noreferrer">
              View on Etherscan
            </A>
          </NextLink>
        )}
      </TextWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 20px;
  font: var(--text-sm);
  color: var(--black);
  background: var(--white);
  border: 1px solid var(--black);
  border-radius: 5px;
  box-shadow: var(--shadow-3);
`;

const LoadingSpinnerWrapper = styled.div``;

const TextWrapper = styled.div``;

const Description = styled.p``;

const A = styled.a``;
