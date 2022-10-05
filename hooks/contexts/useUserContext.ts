import { UserContext } from "contexts";
import { useContext } from "react";

export const useUserContext = () => useContext(UserContext);
