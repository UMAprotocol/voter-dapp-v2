import { EthersErrorLink } from "components/EthersErrorLink/EthersErrorLink";
import { tabletAndUnder } from "constant";
import Close from "public/assets/icons/close.svg";
import Warning from "public/assets/icons/warning.svg";
import styled from "styled-components";
import { ActionBarErrorList } from "./style";

// Errors in the sticky commit/reveal bar. They usually come from pressing its
// button, when the banner at the top of the page is scrolled out of view.
export function ActionBarErrors({
  messages,
  onDismiss,
}: {
  messages: string[];
  onDismiss?: (message: string) => void;
}) {
  return (
    <ActionBarErrorList role="alert">
      {messages.map((message) => (
        <ErrorMessage key={message}>
          <IconWrapper>
            <Warning />
          </IconWrapper>
          <Text>
            <EthersErrorLink errorMessage={message} />
          </Text>
          {onDismiss ? (
            <CloseButton
              aria-label="Dismiss error"
              onClick={() => onDismiss(message)}
            >
              <CloseIconWrapper>
                <CloseIcon />
              </CloseIconWrapper>
            </CloseButton>
          ) : null}
        </ErrorMessage>
      ))}
    </ActionBarErrorList>
  );
}

const ErrorMessage = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 10px;
  background: var(--red-500-opacity-5);
  border: 1px solid var(--red-500);
  border-radius: 2px;
  color: var(--red-500);
  font: var(--text-md);

  @media ${tabletAndUnder} {
    font: var(--text-sm);
  }
`;

const Text = styled.p`
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
`;

const IconWrapper = styled.span`
  display: block;
  flex: none;
  width: 20px;
  height: 20px;
`;

const CloseIconWrapper = styled.span`
  display: block;
  width: 12px;
  height: 12px;
`;

const CloseIcon = styled(Close)`
  path {
    fill: var(--red-500);
  }
`;

const CloseButton = styled.button`
  flex: none;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  background: transparent;
`;
