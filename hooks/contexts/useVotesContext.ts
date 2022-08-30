import { VotesContext } from "contexts/VotesContext";
import { useContext } from "react";

const useVotesContext = () => useContext(VotesContext);

export default useVotesContext;
