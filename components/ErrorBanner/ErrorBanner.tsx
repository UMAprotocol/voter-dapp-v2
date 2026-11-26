import { EthersErrorLink } from "components/EthersErrorLink/EthersErrorLink";
import { errorFetchingVoteDataMessage, wrongChainMessage } from "constant";
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
  const { errorMessages, removeErrorMessage, errorsShownInActionBar } =
    useErrorContext(errorOrigin);
  // The votes action bar shows the other errors and the wrong chain message,
  // next to the button that causes them. Data fetching errors aren't caused by
  // that button, so they stay here.
  const messages = errorsShownInActionBar
    ? errorMessages.filter(
        (message) => message === errorFetchingVoteDataMessage
      )
    : errorMessages;
  const showWrongChain = isWrongChain && !errorsShownInActionBar;

  if (!messages.length && !showWrongChain) return null;

  return (
    <Wrapper>
      {showWrongChain ? (
        <Error message={wrongChainMessage} />
      ) : (
        <>
          {messages.map((message) => (
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
