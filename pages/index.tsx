import { PriceRequests } from "components/PriceRequests";
import { Wallet } from "components/Wallet/Wallet";
import useMounted from "hooks/useMounted";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const mounted = useMounted();
  if (!mounted) {
    return null;
  }
  return (
    <div>
      <Wallet />
      <PriceRequests />
    </div>
  );
};

export default Home;
