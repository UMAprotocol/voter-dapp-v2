import { ErrorContext } from "contexts";
import { useContext } from "react";
import { ErrorOriginT } from "types";

export const useErrorContext = (type: ErrorOriginT = "default") => {
  const context = useContext(ErrorContext);
  function addErrorMessage(message: string) {
    context.addErrorMessage(type, message);
  }
  function clearErrorMessages() {
    context.clearErrorMessages(type);
  }
  function removeErrorMessage(message: string) {
    context.removeErrorMessage(type, message);
  }
  const errorMessages: string[] = context.errorMessages[type] || [];
  return {
    errorMessages,
    addErrorMessage,
    removeErrorMessage,
    clearErrorMessages,
  };
};
