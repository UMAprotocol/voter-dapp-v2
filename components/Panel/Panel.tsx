import "@reach/dialog/styles.css";
import { DialogOverlay, DialogContent } from "@reach/dialog";
import { usePanelContext } from "hooks/usePanelContext";
import styled from "styled-components";
import { ClaimPanel } from "./ClaimPanel";
import { VotePanel } from "./VotePanel";
import Close from "public/assets/icons/close.svg";
import { animated, useTransition } from "react-spring";
import { desktopPanelWidth } from "constants/containers";
import { StakeUnstakePanel } from "./StakeUnstakePanel/StakeUnstakePanel";
import { RemindMePanel } from "./RemindMePanel";
import { VoteHistoryPanel } from "./VoteHistoryPanel";
import UMA from "public/assets/icons/uma.svg";
import Polymarket from "public/assets/icons/polymarket.svg";
import { DisputeOrigins, PanelContentT } from "types/global";

const panelTypeToPanelComponent = {
  claim: ClaimPanel,
  vote: VotePanel,
  stake: StakeUnstakePanel,
  remind: RemindMePanel,
  history: VoteHistoryPanel,
};

export function Panel() {
  const { panelType, panelContent, panelOpen, setPanelOpen } = usePanelContext();

  const transitions = useTransition(panelOpen, {
    from: { opacity: 0, right: -desktopPanelWidth },
    enter: { opacity: 0.75, right: 0 },
    leave: { opacity: 0, right: -desktopPanelWidth },
  });

  if (!panelType) return null;

  const PanelComponent = panelTypeToPanelComponent[panelType];

  const panelTitle = panelContent?.title ?? panelType.charAt(0).toUpperCase() + panelType.slice(1);

  function closePanel() {
    setPanelOpen(false);
  }
  return (
    <>
      {transitions(
        ({ opacity, right }, isOpen) =>
          isOpen && (
            <Overlay
              onDismiss={closePanel}
              style={{ backgroundColor: opacity.to((value) => `hsla(280, 4%, 15%, ${value})`) }}
            >
              <Content aria-labelledby="panel-title" style={{ right }}>
                <TitleWrapper>
                  <TitleIcon origin={panelContent?.origin} />
                  <Title id="panel-title">
                    {panelTitle}
                    <SubTitle>
                      <SubTitleText panelType={panelType} panelContent={panelContent} />
                    </SubTitle>
                  </Title>
                  <CloseButton onClick={closePanel}>
                    <CloseIcon />
                  </CloseButton>
                </TitleWrapper>
                <PanelComponent content={panelContent} />
              </Content>
            </Overlay>
          )
      )}
    </>
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

const AnimatedOverlay = animated(DialogOverlay);

const AnimatedContent = animated(DialogContent);

const Overlay = styled(AnimatedOverlay)`
  overflow-x: hidden;
`;

const Content = styled(AnimatedContent)`
  width: var(--desktop-panel-width);
  min-height: 100%;
  margin: 0;
  padding: 0;
  position: fixed;
  top: 0;
  bottom: 0;
  overflow-y: scroll;
  background: var(--white);
`;

const TitleWrapper = styled.div`
  background: var(--black);
  color: var(--white);
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 20px;
  padding: 25px;
`;

const Title = styled.h1`
  font: var(--header-md);
`;

const SubTitle = styled.h2`
  font: var(--text-sm);
`;

const CloseButton = styled.button`
  background: transparent;
  margin-left: auto;
`;

const CloseIcon = styled(Close)``;

const UMAIcon = styled(UMA)``;

const PolymarketIcon = styled(Polymarket)``;

const TitleIconWrapper = styled.div`
  width: 40px;
  height: 40px;
`;
