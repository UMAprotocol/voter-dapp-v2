import Arbitrum from "public/assets/icons/arbitrum.svg";
import Ethereum from "public/assets/icons/ethereum.svg";
import Optimism from "public/assets/icons/optimism.svg";
import Polygon from "public/assets/icons/polygon.svg";
import styled from "styled-components";

export function ChainIcon({ chainId }: { chainId: number | undefined }) {
  const icons = {
    Ethereum: EthereumIcon,
    Optimism: OptimismIcon,
    Arbitrum: ArbitrumIcon,
    Polygon: PolygonIcon,
  };

  const chainName = getChainName();

  const Icon = chainName ? icons[chainName] : null;

  function getChainName() {
    switch (chainId) {
      case 1:
        return "Ethereum";
      case 10:
        return "Optimism";
      case 137:
        return "Polygon";
      case 42161:
        return "Arbitrum";
      default:
        return undefined;
    }
  }

  if (!Icon) return null;

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
