import { EthersErrorLink } from "components/EthersErrorLink/EthersErrorLink";
import { wrongChainMessage } from "constant";
import { useErrorContext, useWalletContext } from "hooks";
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
  const { isWrongChain } = useWalletContext();
  const { errorMessages, removeErrorMessage } = useErrorContext(errorOrigin);

  if (!errorMessages.length && !isWrongChain) return null;

  return (
    <Wrapper>
      {isWrongChain ? (
        <Error message={wrongChainMessage} />
      ) : (
        <>
          {errorMessages.map((message) => (
            <Error
              key={message}
              message={message}
              removeErrorMessage={removeErrorMessage}
            />
          ))}
        </>
      )}
    </Wrapper>
  );
}

export function Error({
  message,
  removeErrorMessage,
}: {
  message: string | undefined;
  removeErrorMessage?: (message: string) => void;
}) {
  if (!message) {
    return null;
  }

  return (
    <ErrorMessageWrapper>
      <IconWrapper>
        <WarningIcon />
      </IconWrapper>
      <ErrorMessage>
        <EthersErrorLink errorMessage={message} />
      </ErrorMessage>
      {!!removeErrorMessage && (
        <CloseButton onClick={() => removeErrorMessage(message)}>
          <IconWrapper>
            <CloseIcon />
          </IconWrapper>
        </CloseButton>
      )}
    </ErrorMessageWrapper>
  );
}
