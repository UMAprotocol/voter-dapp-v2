import { createContext, ReactNode, useState } from "react";

export interface ErrorContextState {
  errorMessages: ReactNode[];
  addErrorMessage: (message: ReactNode) => void;
  removeErrorMessage: (message: ReactNode) => void;
  clearErrorMessages: () => void;
}

export const defaultErrorContextState: ErrorContextState = {
  errorMessages: [],
  addErrorMessage: () => null,
  removeErrorMessage: () => null,
  clearErrorMessages: () => null,
};

export const ErrorContext = createContext<ErrorContextState>(defaultErrorContextState);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [errorMessages, setErrorMessages] = useState<ReactNode[]>([]);

  function addErrorMessage(message: ReactNode) {
    setErrorMessages((prev) => [...new Set([...prev, message])]);
  }

  function clearErrorMessages() {
    setErrorMessages([]);
  }

  function removeErrorMessage(message: ReactNode) {
    setErrorMessages((prev) => prev.filter((prevMessage) => prevMessage !== message));
  }

  return (
    <ErrorContext.Provider
      value={{
        errorMessages,
        addErrorMessage,
        removeErrorMessage,
        clearErrorMessages,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
}
