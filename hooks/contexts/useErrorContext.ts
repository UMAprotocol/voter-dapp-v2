import { ErrorContext } from "contexts/ErrorContext";
import { useContext } from "react";

const useErrorContext = () => useContext(ErrorContext);

export default useErrorContext;
