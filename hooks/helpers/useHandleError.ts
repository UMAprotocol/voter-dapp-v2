import { useErrorContext } from "hooks";
import { ErrorOriginT } from "types";

export function useHandleError(errorOrigin?: ErrorOriginT) {
  const { addErrorMessage } = useErrorContext(errorOrigin);

  return (error: unknown) => {
    if (error instanceof Error) {
      addErrorMessage(error.message);
    } else if (typeof error === "string") {
      addErrorMessage(error);
    } else {
      addErrorMessage("Unknown error");
    }
  };
}
