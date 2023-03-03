import { DesignatedVotingFactoryEthers__factory } from "@uma/contracts-frontend";
import { ethers } from "ethers";
import { config } from "helpers/config";

export function createDesignatedVotingFactoryV1Instance() {
  const provider = new ethers.providers.InfuraProvider(
    config.infuraName,
    config.infuraId
  );
  return DesignatedVotingFactoryEthers__factory.connect(
    config.designatedVotingFactoryV1Address,
    provider
  );
}
