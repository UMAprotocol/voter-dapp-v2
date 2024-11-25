import { DesignatedVotingFactoryEthers__factory } from "@uma/contracts-frontend";
import { ethers } from "ethers";
import { config } from "helpers/config";

export function createDesignatedVotingFactoryV1Instance() {
  const provider = new ethers.providers.JsonRpcProvider(
    config.oov3ProviderUrl1
  );
  return DesignatedVotingFactoryEthers__factory.connect(
    config.designatedVotingFactoryV1Address,
    provider
  );
}
