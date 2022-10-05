import { Banner, HowItWorks, Layout, Votes } from "components";
import { add } from "date-fns";

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
      <HowItWorks />
      <Votes />
    </Layout>
  );
}
