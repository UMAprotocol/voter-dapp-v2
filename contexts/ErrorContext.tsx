import { createContext, ReactNode, useState } from "react";

export interface ErrorContextState {
  errorMessages: Record<string,ReactNode[]>;
  addErrorMessage: (type:string, message: ReactNode) => void;
  removeErrorMessage: (type:string, message: ReactNode) => void;
  clearErrorMessages: (type:string ) => void;
}


export const defaultErrorContextState:ErrorContextState = {
  errorMessages: {default:[]},
  addErrorMessage: () => {},
  removeErrorMessage: () => {},
  clearErrorMessages: () => {},
}

export const ErrorContext = createContext<ErrorContextState>(defaultErrorContextState);

export function ErrorProvider ({ children }: { children: ReactNode }) {
  const [errorMessages, setErrorMessages] = useState<Record<string,ReactNode[]>>({});

  function addErrorMessage(type:string, message: ReactNode) {
    setErrorMessages((prev) => ({
      ...prev,
      [type]:[...new Set([...(prev[type] || []), message])]
    }));
  }

  function clearErrorMessages(type:string) {
    setErrorMessages((prev) => ({
      ...prev,
      [type]:[]
    }))
  }

  function removeErrorMessage(type:string, message: ReactNode) {
    setErrorMessages((prev) => ({
      ...prev,
      [type]: prev[type] ? prev[type].filter((prevMessage) => prevMessage !== message) : []
    }))
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
};
