import { LoadingSpinner } from "components/LoadingSpinner";
import NextLink from "next/link";
import Close from "public/assets/icons/close.svg";
import { ReactNode } from "react";
import styled from "styled-components";
import { NotificationT } from "types";

export function Notification({
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
      <CloseButton onClick={() => dismiss(description)}>
        <CloseIconWrapper>
          <CloseIcon />
        </CloseIconWrapper>
      </CloseButton>
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

const CloseIconWrapper = styled.div`
  width: 15px;
  height: 15px;
`;

const CloseIcon = styled(Close)`
  path {
    fill: var(--black);
  }
`;
const CloseButton = styled.button`
  background: transparent;
`;
