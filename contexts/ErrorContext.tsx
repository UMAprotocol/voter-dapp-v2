import { createContext, ReactNode, useState } from "react";

export interface ErrorContextState {
  errorMessages: ReactNode[];
  addErrorMessage: (message: ReactNode) => void;
  removeErrorMessage: (message: ReactNode) => void;
  clearErrorMessages: () => void;
}

export const defaultErrorContextState: ErrorContextState = {
  errorMessages: [],
  addErrorMessage: () => {},
  removeErrorMessage: () => {},
  clearErrorMessages: () => {},
};

// This factory allows us to unstance multiple error contexts for different parts of the app.
export function Factory() {
  const Context = createContext<ErrorContextState>(defaultErrorContextState);
  const Provider = function ({ children }: { children: ReactNode }) {
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
      <Context.Provider
        value={{
          errorMessages,
          addErrorMessage,
          removeErrorMessage,
          clearErrorMessages,
        }}
      >
        {children}
      </Context.Provider>
    );
  };

  return {
    Context,
    Provider,
  };
}

// add more contexts here. Providers must be added to app.tsx, and context to useErrorContext
export const DefaultError = Factory();
export const PanelError = Factory();
