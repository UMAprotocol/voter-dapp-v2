import { createContext, ReactNode, useMemo, useState } from "react";
import { ErrorOriginT } from "types";

type ErrorMessagesT = Record<ErrorOriginT, string[]>;

export interface ErrorContextState {
  errorMessages: ErrorMessagesT;
  addErrorMessage: (origin: ErrorOriginT, message: string) => void;
  removeErrorMessage: (origin: ErrorOriginT, message: string) => void;
  clearErrorMessages: (origin: ErrorOriginT) => void;
}

export const defaultErrorContextState: ErrorContextState = {
  errorMessages: {
    default: [],
    vote: [],
    stake: [],
    unstake: [],
    claim: [],
    claimV1: [],
    delegation: [],
    storybook: [],
    remind: [],
  },
  addErrorMessage: () => null,
  removeErrorMessage: () => null,
  clearErrorMessages: () => null,
};

export const ErrorContext = createContext<ErrorContextState>(
  defaultErrorContextState
);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [errorMessages, setErrorMessages] = useState<ErrorMessagesT>(
    defaultErrorContextState.errorMessages
  );

  function addErrorMessage(origin: ErrorOriginT, message: string) {
    if (!message) return;

    setErrorMessages((prev) => ({
      ...prev,
      [origin]: [...new Set([...(prev[origin] || []), message])],
    }));
  }

  function clearErrorMessages(origin: ErrorOriginT) {
    setErrorMessages((prev) => ({
      ...prev,
      [origin]: [],
    }));
  }

  function removeErrorMessage(origin: ErrorOriginT, message: string) {
    setErrorMessages((prev) => ({
      ...prev,
      [origin]: prev[origin]
        ? prev[origin].filter((prevMessage) => prevMessage !== message)
        : [],
    }));
  }

  const value = useMemo(
    () => ({
      errorMessages,
      addErrorMessage,
      removeErrorMessage,
      clearErrorMessages,
    }),
    [errorMessages]
  );

  return (
    <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
  );
}
