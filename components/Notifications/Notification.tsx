import { LoadingSpinner } from "components/LoadingSpinner";
import NextLink from "next/link";
import Check from "public/assets/icons/check.svg";
import Close from "public/assets/icons/close.svg";
import Warning from "public/assets/icons/warning.svg";
import styled from "styled-components";
import { NotificationT } from "types";

export function Notification({
  description,
  transactionHash,
  type,
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
      <IndicatorWrapper>
        {type === "pending" && <LoadingSpinner variant="black" size={32} />}
        {type === "error" && (
          <IconWrapper>
            <Warning />
          </IconWrapper>
        )}
        {type === "success" && (
          <IconWrapper>
            <CheckIcon />
          </IconWrapper>
        )}
      </IndicatorWrapper>
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

const IndicatorWrapper = styled.div``;

const IconWrapper = styled.div`
  width: 32px;
  height: 32px;
`;

const CheckIcon = styled(Check)`
  path {
    fill: var(--white);
    stroke: var(--black);
  }
`;

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
