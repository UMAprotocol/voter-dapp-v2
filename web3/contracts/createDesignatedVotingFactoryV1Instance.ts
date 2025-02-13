import { DesignatedVotingFactoryEthers__factory } from "@uma/contracts-frontend";
import { config, primaryProvider } from "helpers/config";

export function createDesignatedVotingFactoryV1Instance() {
  return DesignatedVotingFactoryEthers__factory.connect(
    config.designatedVotingFactoryV1Address,
    primaryProvider
  );
}
