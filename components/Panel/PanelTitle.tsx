import styled from "styled-components";
import { DisputeOrigins, PanelContentT, PanelTypeT } from "types/global";
import UMA from "public/assets/icons/uma.svg";
import Polymarket from "public/assets/icons/polymarket.svg";

interface Props {
  panelContent: PanelContentT;
  panelType: PanelTypeT;
}
export function PanelTitle({ panelType, panelContent }: Props) {
  if (!panelType) return null;

  const panelTitle = panelContent?.title ?? panelType.charAt(0).toUpperCase() + panelType.slice(1);

  return (
    <Wrapper>
      <TitleIcon origin={panelContent?.origin} />
      <Header id="panel-title">
        {panelTitle}
        <SubTitle>
          <SubTitleText panelType={panelType} panelContent={panelContent} />
        </SubTitle>
      </Header>
    </Wrapper>
  );
}

function TitleIcon({ origin }: { origin: DisputeOrigins | undefined }) {
  switch (origin) {
    case DisputeOrigins.UMA:
      return (
        <TitleIconWrapper>
          <UMAIcon />
        </TitleIconWrapper>
      );
    case DisputeOrigins.Polymarket:
      return (
        <TitleIconWrapper>
          <PolymarketIcon />
        </TitleIconWrapper>
      );
    default:
      return null;
  }
}

function SubTitleText({ panelType, panelContent }: { panelType: string; panelContent: PanelContentT }) {
  if (panelType !== "vote" || !panelContent) return null;

  const { origin, disputeNumber } = panelContent;

  return (
    <>
      {origin} | Dispute number <strong>#{disputeNumber}</strong>
    </>
  );
}

const Wrapper = styled.div`
  background: var(--black);
  color: var(--white);
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 20px;
  padding: 25px;
`;

const Header = styled.h1`
  font: var(--header-md);
`;

const SubTitle = styled.h2`
  font: var(--text-sm);
`;

const UMAIcon = styled(UMA)``;

const PolymarketIcon = styled(Polymarket)``;

const TitleIconWrapper = styled.div`
  width: 40px;
  height: 40px;
`;
