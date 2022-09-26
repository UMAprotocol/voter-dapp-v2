import { useErrorContext } from "hooks/contexts";
import Warning from "public/assets/icons/warning.svg";
import styled from "styled-components";

export function PanelErrorBanner() {
  const { errorMessages } = useErrorContext();

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

const InnerWrapper = styled.div``;

const ErrorMessage = styled.p`
  &:not(:last-child) {
    margin-bottom: 8px;
  }
`;

const IconWrapper = styled.div`
  width: 26px;
  height: 26px;
`;
