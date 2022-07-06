import { Overview } from "components/pages";
import useMounted from "hooks/useMounted";
import type { NextPage } from "next";

const OverviewPage: NextPage = () => {
  const mounted = useMounted();
  if (!mounted) {
    return null;
  }
  return <Overview />;
};

export default OverviewPage;
