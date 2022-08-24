import { Vote } from "components/pages";
import useMounted from "hooks/helpers/useMounted";
import type { NextPage } from "next";

const VotePage: NextPage = () => {
  const mounted = useMounted();
  if (!mounted) {
    return null;
  }
  return <Vote />;
};

export default VotePage;
