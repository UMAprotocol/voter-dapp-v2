import { VoteTimingContext } from "contexts/VoteTimingContext";
import { useContext } from "react";

const useVoteTimingContext = () => useContext(VoteTimingContext);

export default useVoteTimingContext;
