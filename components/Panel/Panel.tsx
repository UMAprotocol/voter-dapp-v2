import { DialogContent, DialogOverlay } from "@reach/dialog";
import "@reach/dialog/styles.css";
import { black, white } from "constants/colors";
import { desktopPanelWidth } from "constants/containers";
import { usePanelContext } from "hooks/contexts";
import Close from "public/assets/icons/close.svg";
import { animated, useTransition } from "react-spring";
import styled, { CSSProperties } from "styled-components";
import { ClaimPanel } from "./ClaimPanel";
import { MenuPanel } from "./MenuPanel";
import { RemindMePanel } from "./RemindMePanel";
import { StakeUnstakePanel } from "./StakeUnstakePanel/StakeUnstakePanel";
import { VoteHistoryPanel } from "./VoteHistoryPanel";
import { VotePanel } from "./VotePanel";

const panelTypeToPanelComponent = {
  menu: MenuPanel,
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

  const isMenu = panelType === "menu";
  const closeButtonColor = isMenu ? black : white;

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
                <PanelComponent content={panelContent} />
                <CloseButton
                  onClick={closePanel}
                  style={
                    {
                      "--fill": closeButtonColor,
                    } as CSSProperties
                  }
                >
                  <CloseIcon />
                </CloseButton>
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

const CloseButton = styled.button`
  position: absolute;
  top: 30px;
  right: 30px;
  background: transparent;
`;

const CloseIcon = styled(Close)`
  path {
    fill: var(--fill);
  }
`;
