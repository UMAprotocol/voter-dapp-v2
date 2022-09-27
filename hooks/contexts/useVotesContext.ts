import { VotesContext } from "contexts";
import { useContext } from "react";

const useVotesContext = () => useContext(VotesContext);

export default useVotesContext;
