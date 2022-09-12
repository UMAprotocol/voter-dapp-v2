import { useErrorContext } from "hooks/contexts";
import styled from "styled-components";

export function ErrorBanner() {
  const { errorMessages } = useErrorContext();
  return (
    <Wrapper>
      {errorMessages.map((message) => (
        <ErrorMessage key={message?.toString()}>{message}</ErrorMessage>
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

const ErrorMessage = styled.p`
  font: var(--text-md);
  &:not(:last-child) {
    margin-bottom: 5px;
  }
`;
