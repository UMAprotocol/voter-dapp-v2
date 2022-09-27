import { Vote } from "components";
import { useMounted } from "hooks";
import type { NextPage } from "next";

const VotePage: NextPage = () => {
  const mounted = useMounted();
  if (!mounted) {
    return null;
  }
  return <Vote />;
};

export default VotePage;
