import { ErrorContext } from "contexts";
import { useContext } from "react";

export const useErrorContext = () => useContext(ErrorContext);
