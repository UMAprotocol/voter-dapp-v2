import { ErrorContext } from "contexts";
import { ReactNode, useContext } from "react";
import { ErrorOriginT } from "types";

export const useErrorContext = (type: ErrorOriginT = "default") => {
  const context = useContext(ErrorContext);
  function addErrorMessage(message: ReactNode) {
    context.addErrorMessage(type, message);
  }
  function clearErrorMessages() {
    context.clearErrorMessages(type);
  }
  function removeErrorMessage(message: ReactNode) {
    context.removeErrorMessage(type, message);
  }
  const errorMessages: ReactNode[] = context.errorMessages[type] || [];
  return {
    errorMessages,
    addErrorMessage,
    removeErrorMessage,
    clearErrorMessages,
  };
};
