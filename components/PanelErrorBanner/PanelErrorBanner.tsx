import { useErrorContext } from "hooks";
import Close from "public/assets/icons/close.svg";
import Warning from "public/assets/icons/warning.svg";
import styled from "styled-components";
import { ErrorOriginT } from "types";

export function PanelErrorBanner({
  errorOrigin,
}: {
  errorOrigin?: ErrorOriginT;
}) {
  const { errorMessages, clearErrorMessages } = useErrorContext(errorOrigin);

  if (errorMessages.length === 0) return null;

  return (
    <OuterWrapper>
      <IconWrapper>
        <Warning />
      </IconWrapper>
      <InnerWrapper>
        {errorMessages.map((message) => (
          <ErrorMessage key={message?.toString()}>{message}</ErrorMessage>
        ))}
      </InnerWrapper>
      <CloseButton onClick={() => clearErrorMessages()}>
        <CloseIconWrapper>
          <CloseIcon />
        </CloseIconWrapper>
      </CloseButton>
    </OuterWrapper>
  );
}

const OuterWrapper = styled.div`
  margin-top: 30px;
  background: var(--red-500-opacity-5);
  border: 1px solid var(--red-500);
  border-radius: 2px;
  color: var(--red-500);
  font: var(--text-md);
  padding: 13px;
  display: flex;
  gap: 13px;
`;

const InnerWrapper = styled.div`
  width: 100%;
`;

const ErrorMessage = styled.p`
  overflow-wrap: anywhere;
  &:not(:last-child) {
    margin-bottom: 8px;
  }
`;

const IconWrapper = styled.div`
  width: 26px;
  height: 26px;
`;

const CloseIconWrapper = styled.div`
  width: 15px;
  height: 15px;
`;

const CloseIcon = styled(Close)`
  path {
    fill: var(--red-500);
  }
`;
const CloseButton = styled.button`
  background: transparent;
`;
