import { DefaultError, PanelError } from "contexts";
import { useContext } from "react";

export const useErrorContext = () => useContext(DefaultError.Context);
export const usePanelErrorContext = () => useContext(PanelError.Context);
