import "@reach/dialog/styles.css";
import { DialogOverlay, DialogContent } from "@reach/dialog";
import { usePanelContext } from "hooks/usePanelContext";
import styled from "styled-components";
import { ClaimPanel } from "./ClaimPanel";
import { VotePanel } from "./VotePanel";
import Close from "public/assets/icons/close.svg";
import { animated, useTransition } from "react-spring";
import { desktopPanelWidth } from "constants/containers";

const panelTypeToPanelComponent = {
  claim: ClaimPanel,
  vote: VotePanel,
};

export function Panel() {
  const { panelType, panelContent, panelOpen, setPanelOpen } = usePanelContext();

  const transitions = useTransition(panelOpen, {
    from: { opacity: 0, x: -desktopPanelWidth },
    enter: { opacity: 0.5, x: 0 },
    leave: { opacity: 0, x: -desktopPanelWidth },
  });

  if (!panelType) return null;

  const PanelComponent = panelTypeToPanelComponent[panelType];

  function closePanel() {
    setPanelOpen(false);
  }
  return (
    <>
      {transitions(
        (styles, item) =>
          item && (
            <Overlay
              onDismiss={closePanel}
              style={{ backgroundColor: styles.opacity.to((value) => `hsla(0, 0%, 0%, ${value})`) }}
            >
              <Content
                aria-labelledby="panel-title"
                style={{
                  right: styles.x,
                }}
              >
                <TitleWrapper>
                  <Title id="panel-title">{panelContent?.title ?? ""}</Title>
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

const AnimatedOverlay = animated(DialogOverlay);

const AnimatedContent = animated(DialogContent);

const Overlay = styled(AnimatedOverlay)`
  overflow: hidden;
`;

const Content = styled(AnimatedContent)`
  width: var(--desktop-panel-width);
  height: 100%;
  margin: 0;
  padding: 0;
  position: fixed;
  background: var(--white);
`;

const TitleWrapper = styled.div`
  background: var(--black);
  color: var(--white);
  display: flex;
  justify-content: space-between;
  padding: 25px;
`;

const Title = styled.h1`
  font: var(--header-md);
`;

const CloseButton = styled.button`
  background: transparent;
`;

const CloseIcon = styled(Close)``;
