import { DialogContent, DialogOverlay } from "@reach/dialog";
import "@reach/dialog/styles.css";
import { black, white } from "constant";
import { usePanelContext, usePanelWidth } from "hooks";
import Close from "public/assets/icons/close.svg";
import { CSSProperties } from "react";
import { animated, useTransition } from "react-spring";
import styled from "styled-components";
import { ClaimPanel } from "./ClaimPanel";
import { DelegationPanel } from "./DelegationPanel";
import { HistoryPanel } from "./HistoryPanel";
import { MenuPanel } from "./MenuPanel";
import { RemindMePanel } from "./RemindMePanel";
import { StakeUnstakePanel } from "./StakeUnstakePanel/StakeUnstakePanel";
import { VotePanel } from "./VotePanel";

const panelTypeToPanelComponent = {
  menu: MenuPanel,
  claim: ClaimPanel,
  vote: VotePanel,
  stake: StakeUnstakePanel,
  remind: RemindMePanel,
  history: HistoryPanel,
  delegation: DelegationPanel,
};

export function Panel() {
  const { panelType, panelContent, panelOpen, closePanel } = usePanelContext();
  const panelWidth = usePanelWidth();

  const transitions = useTransition(panelOpen, {
    from: { opacity: 0, right: -panelWidth },
    enter: { opacity: 0.75, right: 0 },
    leave: { opacity: 0, right: -panelWidth },
  });

  if (!panelType) return null;

  const PanelComponent = panelTypeToPanelComponent[panelType];

  const isMenu = panelType === "menu";
  const closeButtonColor = isMenu ? black : white;

  return (
    <>
      {transitions(
        ({ opacity, right }, isOpen) =>
          isOpen && (
            <Overlay
              onDismiss={() => closePanel(true)}
              style={{
                backgroundColor: opacity.to(
                  (value) => `hsla(280, 4%, 15%, ${value})`
                ),
              }}
            >
              <Content
                aria-labelledby="panel-title"
                style={
                  {
                    "--right": right.to((value) => `${value}px`),
                    "--panel-width": `${panelWidth}px`,
                  } as CSSProperties
                }
              >
                <PanelComponent content={panelContent} />
                <CloseButton
                  onClick={() => closePanel()}
                  style={
                    {
                      "--fill": closeButtonColor,
                    } as CSSProperties
                  }
                >
                  <IconWrapper>
                    <CloseIcon />
                  </IconWrapper>
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
  right: var(--right);
  width: var(--panel-width);
  min-height: 100%;
  margin: 0;
  padding: 0;
  position: fixed;
  top: 0;
  bottom: 0;
  background: var(--white);
  overflow-y: scroll;
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
const IconWrapper = styled.div`
  width: 15px;
  height: 15px;
`;
