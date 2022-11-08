import { errorFetchingVoteDataMessage, wrongChainMessage } from "constant";
import { formatTransactionError } from "helpers";
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
    if (errorMessages.includes(wrongChainMessage)) return;

    let message: string;

    if (isDataFetching) {
      message = errorFetchingVoteDataMessage;
    } else if (customErrorMessage) {
      message = customErrorMessage;
    } else if (error instanceof Error) {
      message = isContractTransaction
        ? formatTransactionError(error)
        : error.message;
    } else if (typeof error === "string") {
      message = error;
    } else {
      message = "Unknown error";
    }

    addErrorMessage(message);
  }

  return {
    onError,
    clearErrors: clearErrorMessages,
  };
}
