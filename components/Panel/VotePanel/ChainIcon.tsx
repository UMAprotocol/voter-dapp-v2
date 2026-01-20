import { supportedChains } from "constant";
import Arbitrum from "public/assets/icons/arbitrum.svg";
import Boba from "public/assets/icons/boba.svg";
import Ethereum from "public/assets/icons/ethereum.svg";
import Optimism from "public/assets/icons/optimism.svg";
import Polygon from "public/assets/icons/polygon.svg";
import SX from "public/assets/icons/sx.svg";
import Base from "public/assets/icons/base.svg";
import Blast from "public/assets/icons/blast.svg";
import Story from "public/assets/icons/story.svg";
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
    137: PolygonIcon,
    288: BobaIcon,
    416: SXIcon,
    1514: Story,
    42161: ArbitrumIcon,
    11155111: EthereumIcon,
    8453: Base,
    81457: Blast,
    80002: PolygonIcon,
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

const BobaIcon = styled(Boba)``;

const SXIcon = styled(SX)``;
