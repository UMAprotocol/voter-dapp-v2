import { errorFetchingVoteDataMessage, wrongChainMessage } from "constant";
import { emitErrorEvent, formatTransactionError } from "helpers";
import { hasTransactionErrorNotification } from "helpers/util/handleNotifications";
import { useErrorContext } from "hooks";
import { ErrorOriginT } from "types";

interface Options {
  errorOrigin?: ErrorOriginT;
  isContractTransaction?: boolean;
  isDataFetching?: boolean;
  customErrorMessage?: string;
}
export function useHandleError(options?: Options) {
  const {
    errorOrigin,
    isContractTransaction = true,
    isDataFetching = false,
    customErrorMessage,
  } = options || {};
  const { addErrorMessage, clearErrorMessages, errorMessages } =
    useErrorContext(errorOrigin);

  function onError(error: unknown) {
    const isTransactionAttempt = isContractTransaction && !isDataFetching;
    if (!isTransactionAttempt && errorMessages.includes(wrongChainMessage))
      return;

    let message: string;

    if (isDataFetching) {
      message = errorFetchingVoteDataMessage;
    } else if (customErrorMessage) {
      message = customErrorMessage;
    } else if (isContractTransaction) {
      message = formatTransactionError(error);
    } else if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    } else {
      message = "Unknown error";
    }

    addErrorMessage(message);
    if (isTransactionAttempt && !hasTransactionErrorNotification(error)) {
      emitErrorEvent({ message });
    }
  }

  return {
    onError,
    clearErrors: clearErrorMessages,
  };
}
