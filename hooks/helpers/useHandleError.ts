import { formatTransactionError } from "helpers";
import { useErrorContext } from "hooks";
import { ErrorOriginT } from "types";

export function useHandleError(
  errorOrigin?: ErrorOriginT,
  isContractTransaction = true
) {
  const { addErrorMessage, clearErrorMessages } = useErrorContext(errorOrigin);

  function onError(error: unknown) {
    let message: string;

    if (error instanceof Error) {
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
