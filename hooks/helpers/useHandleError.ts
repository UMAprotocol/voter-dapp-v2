import { useErrorContext } from "hooks";

export function useHandleError(errorType?: string) {
  const { addErrorMessage } = useErrorContext(errorType);

  return (error: unknown) => {
    if (error instanceof Error) {
      addErrorMessage(error.message);
    } else {
      addErrorMessage("Unknown error");
    }
  };
}
