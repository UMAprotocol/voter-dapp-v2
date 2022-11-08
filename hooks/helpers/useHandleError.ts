import { formatTransactionError } from "helpers";
import { useErrorContext } from "hooks";
import { ErrorOriginT } from "types";

interface Options {
  errorOrigin?: ErrorOriginT;
  isContractTransaction?: boolean;
  customErrorMessage?: string;
}
export function useHandleError(options?: Options) {
  const {
    errorOrigin,
    isContractTransaction = true,
    customErrorMessage,
  } = options || {};
  const { addErrorMessage, clearErrorMessages } = useErrorContext(errorOrigin);

  function onError(error: unknown) {
    let message: string;

    if (customErrorMessage) {
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
