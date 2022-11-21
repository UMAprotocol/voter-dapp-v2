import { mobileAndUnder } from "constant";
import { useErrorContext } from "hooks";
import Close from "public/assets/icons/close.svg";
import Warning from "public/assets/icons/warning.svg";
import styled from "styled-components";
import { ErrorOriginT } from "types";

export function ErrorBanner({ errorOrigin }: { errorOrigin?: ErrorOriginT }) {
  const { errorMessages, removeErrorMessage } = useErrorContext(errorOrigin);

  if (!errorMessages.length) return null;

  return (
    <Wrapper>
      {errorMessages.map((message) => (
        <ErrorMessageWrapper key={message?.toString()}>
          <IconWrapper>
            <Warning />
          </IconWrapper>
          <ErrorMessage>{message}</ErrorMessage>
          <CloseButton onClick={() => removeErrorMessage(message)}>
            <IconWrapper>
              <CloseIcon />
            </IconWrapper>
          </CloseButton>
        </ErrorMessageWrapper>
      ))}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  background: var(--red-500);
  min-height: 60px;
  max-width: 100vw;
  color: var(--white);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-block: 15px;
  padding-inline: var(--page-padding);
`;

const ErrorMessageWrapper = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  gap: 5px;
  &:not(:last-child) {
    margin-bottom: 5px;
  }
`;

const ErrorMessage = styled.p`
  font: var(--text-md);

  @media ${mobileAndUnder} {
    font: var(--text-xs);
  }
`;

const IconWrapper = styled.div`
  width: 15px;
  height: 15px;
`;
const CloseIcon = styled(Close)`
  path {
    fill: var(--white);
  }
`;
const CloseButton = styled.button`
  position: absolute;
  top: 4px;
  right: 0;
  background: transparent;
  fill: var(--white);
`;
