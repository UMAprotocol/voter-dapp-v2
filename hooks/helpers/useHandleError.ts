import { useErrorContext } from "hooks";

export function useHandleError() {
  const { addErrorMessage } = useErrorContext();

  return (error: unknown) => {
    if (error instanceof Error) {
      addErrorMessage(error.message);
    } else {
      addErrorMessage("Unknown error");
    }
  };
}
