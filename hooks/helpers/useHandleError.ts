import { useErrorContext } from "hooks/contexts";

export default function useHandleError() {
  const { addErrorMessage } = useErrorContext();

  return (error: unknown) => {
    if (error instanceof Error) {
      addErrorMessage(error.message);
    } else {
      addErrorMessage("Unknown error");
    }
  };
}
