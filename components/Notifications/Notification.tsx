import { LoadingSpinner } from "components/LoadingSpinner";
import NextLink from "next/link";
import Close from "public/assets/icons/close.svg";
import styled from "styled-components";
import { NotificationT } from "types";

export function Notification({
  description,
  transactionHash,
  dismiss,
  style,
}: NotificationT & {
  style: {
    opacity: number;
  };
  dismiss: (transactionHash: string) => void;
}) {
  return (
    <Wrapper style={style}>
      <LoadingSpinnerWrapper>
        <LoadingSpinner variant="black" size={32} />
      </LoadingSpinnerWrapper>
      <TextWrapper>
        <Description>{description}</Description>
        <NextLink href={`https://goerli.etherscan.io/tx/${transactionHash}`} passHref>
          <A target="_blank" rel="noopener noreferrer">
            View on Etherscan
          </A>
        </NextLink>
      </TextWrapper>
      <CloseButton onClick={() => dismiss(transactionHash)}>
        <CloseIconWrapper>
          <CloseIcon />
        </CloseIconWrapper>
      </CloseButton>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  display: flex;
  gap: 18px;
  align-items: center;
  width: 320px;
  min-height: 90px;
  padding: 20px;
  font: var(--text-sm);
  color: var(--black);
  background: var(--white);
  border: 1px solid var(--black);
  border-radius: 5px;
  box-shadow: var(--shadow-3);
`;

const LoadingSpinnerWrapper = styled.div``;

const TextWrapper = styled.div`
  display: grid;
  gap: 8px;
`;

const Description = styled.div``;

const A = styled.a`
  color: var(--red-500);
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const CloseIconWrapper = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 12px;
  height: 12px;
`;

const CloseIcon = styled(Close)`
  path {
    fill: var(--black);
  }
`;
const CloseButton = styled.button`
  background: transparent;
`;
