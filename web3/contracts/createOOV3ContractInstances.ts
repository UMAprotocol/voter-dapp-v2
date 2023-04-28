import { OptimisticOracleV3InterfaceEthers__factory } from "@uma/contracts-frontend";
import { ethers } from "ethers";
import { config } from "helpers/config";

function connect(address: string, provider: ethers.providers.Provider) {
  return OptimisticOracleV3InterfaceEthers__factory.connect(address, provider);
}

export function createOOV3ContractInstances() {
  const contractDetails = [
    {
      chainId: 1,
      providerUrl: config.oov3ProviderUrl1,
      address: ethers.utils.getAddress(
        "0xfb55F43fB9F48F63f9269DB7Dde3BbBe1ebDC0dE"
      ),
    },
    {
      // goerli
      chainId: 5,
      providerUrl: config.oov3ProviderUrl5,
      address: ethers.utils.getAddress(
        "0x9923D42eF695B5dd9911D05Ac944d4cAca3c4EAB"
      ),
    },
    {
      // optimism
      chainId: 10,
      providerUrl: config.oov3ProviderUrl10,
      address: ethers.utils.getAddress(
        "0x072819Bb43B50E7A251c64411e7aA362ce82803B"
      ),
    },
    {
      // polygon
      chainId: 137,
      providerUrl: config.oov3ProviderUrl137,
      address: ethers.utils.getAddress(
        "0x5953f2538F613E05bAED8A5AeFa8e6622467AD3D"
      ),
    },
    {
      // boba
      chainId: 288,
      providerUrl: config.oov3ProviderUrl288,
      address: ethers.utils.getAddress(
        "0xe1C2587C1789f7D00F22931D4DBAD537405DFe1f"
      ),
    },
    {
      // arbitrum
      chainId: 42161,
      providerUrl: config.oov3ProviderUrl42161,
      address: ethers.utils.getAddress(
        "0xa6147867264374F324524E30C02C331cF28aa879"
      ),
    },
  ];

  const instances = contractDetails.map(({ chainId, providerUrl, address }) => {
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    return {
      chainId,
      instance: connect(address, provider),
    };
  });

  return instances;
}
