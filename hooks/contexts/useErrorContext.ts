import { ErrorContext } from "contexts";
import { useContext } from "react";

const useErrorContext = () => useContext(ErrorContext);

export default useErrorContext;
