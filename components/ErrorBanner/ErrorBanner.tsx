import { EthersErrorLink } from "components/EthersErrorLink/EthersErrorLink";
import { useErrorContext } from "hooks";
import { ErrorOriginT } from "types";
import {
  CloseButton,
  CloseIcon,
  ErrorMessage,
  ErrorMessageWrapper,
  IconWrapper,
  WarningIcon,
  Wrapper,
} from "./styles";

export function ErrorBanner({ errorOrigin }: { errorOrigin?: ErrorOriginT }) {
  const { errorMessages, removeErrorMessage } = useErrorContext(errorOrigin);

  if (!errorMessages.length) return null;

  return (
    <Wrapper>
      {errorMessages.map((message) => (
        <ErrorMessageWrapper key={message?.toString()}>
          <IconWrapper>
            <WarningIcon />
          </IconWrapper>
          <ErrorMessage>
            <EthersErrorLink errorMessage={message} />
          </ErrorMessage>
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
