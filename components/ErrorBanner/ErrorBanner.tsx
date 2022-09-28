import { useErrorContext } from "hooks";
import Warning from "public/assets/icons/warning.svg";
import styled from "styled-components";

export function ErrorBanner() {
  const { errorMessages } = useErrorContext();

  if (!errorMessages.length) return null;

  return (
    <Wrapper>
      {errorMessages.map((message) => (
        <ErrorMessageWrapper key={message?.toString()}>
          <IconWrapper>
            <Warning />
          </IconWrapper>
          <ErrorMessage>{message}</ErrorMessage>
        </ErrorMessageWrapper>
      ))}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  background: var(--red-500);
  min-height: 60px;
  color: var(--white);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-block: 15px;
`;

const ErrorMessageWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  &:not(:last-child) {
    margin-bottom: 5px;
  }
`;

const ErrorMessage = styled.p`
  max-width: 500px;
  font: var(--text-md);
`;

const IconWrapper = styled.div`
  width: 15px;
  height: 15px;
`;
