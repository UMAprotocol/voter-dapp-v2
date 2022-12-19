import { supportedChains } from "constant";
import Arbitrum from "public/assets/icons/arbitrum.svg";
import Avalanche from "public/assets/icons/avax.svg";
import Boba from "public/assets/icons/boba.svg";
import Ethereum from "public/assets/icons/ethereum.svg";
import Gnosis from "public/assets/icons/gnosis.svg";
import Optimism from "public/assets/icons/optimism.svg";
import Polygon from "public/assets/icons/polygon.svg";
import SX from "public/assets/icons/sx.svg";
import styled from "styled-components";
import { SupportedChainIds } from "types";

export function ChainIcon({
  chainId,
}: {
  chainId: SupportedChainIds | undefined;
}) {
  if (!chainId) return null;

  const icons = {
    1: EthereumIcon,
    5: EthereumIcon,
    10: OptimismIcon,
    100: GnosisIcon,
    137: PolygonIcon,
    288: BobaIcon,
    416: SXIcon,
    43114: AvalancheIcon,
    42161: ArbitrumIcon,
  };

  const chainName = supportedChains[chainId];
  const Icon = icons[chainId];
  if (!Icon || !chainName) return null;

  return (
    <Wrapper>
      <IconWrapper>
        <Icon />
      </IconWrapper>
      <ChainName>{chainName}</ChainName>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  height: 35px;
  width: max-content;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-inline: 10px;
  padding-block: 8px;
  border: 1px solid var(--grey-100);
  border-radius: 5px;
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
`;

const ChainName = styled.p`
  font: var(--text-sm);
`;

const EthereumIcon = styled(Ethereum)``;

const OptimismIcon = styled(Optimism)``;

const PolygonIcon = styled(Polygon)``;

const ArbitrumIcon = styled(Arbitrum)``;

const GnosisIcon = styled(Gnosis)``;

const BobaIcon = styled(Boba)``;

const SXIcon = styled(SX)``;

const AvalancheIcon = styled(Avalanche)``;
