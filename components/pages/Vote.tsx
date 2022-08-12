import { Banner } from "components/Banner";
import { HowItWorks } from "components/HowItWorks";
import { Layout } from "components/Layout";
import { Votes } from "components/Votes";
import { add, sub } from "date-fns";
import useActiveVotes from "hooks/useActiveVotes";
import { useContractsContext } from "hooks/useContractsContext";

export function Vote() {
  const mockStakeholderData = {
    stakedBalance: 123.456,
    unstakedBalance: 123.456,
    claimableRewards: 500,
    cooldownEnds: add(new Date(), { hours: 23, minutes: 59 }),
    votesInLastCycles: 3,
    apy: 18,
  };

  return (
    <Layout>
      <Banner />
      <HowItWorks {...mockStakeholderData} />
      <Votes />
    </Layout>
  );
}
