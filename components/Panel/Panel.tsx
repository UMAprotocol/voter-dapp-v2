import { black, white } from "constant";
import { usePanelContext, usePanelWidth } from "hooks";
import Close from "public/assets/icons/close.svg";
import { CSSProperties, useEffect, useRef } from "react";
import { FocusOn } from "react-focus-on";
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
  const contentRef = useRef<HTMLDivElement | null>(null);

  const transitions = useTransition(panelOpen, {
    from: { opacity: 0 },
    enter: { opacity: 0.75 },
    leave: { opacity: 0 },
  });

  useEffect(() => {
    if (panelOpen) {
      contentRef?.current?.scrollTo({ top: 0 });
    }
  }, [panelOpen]);

  const PanelComponent = panelTypeToPanelComponent[panelType];

  const isMenu = panelType === "menu";
  const closeButtonColor = isMenu ? black : white;

  return (
    <>
      {transitions(
        ({ opacity }, isOpen) =>
          isOpen && (
            <Overlay
              onClick={() => closePanel()}
              style={{
                backgroundColor: opacity.to(
                  (value) => `hsla(280, 4%, 15%, ${value})`
                ),
              }}
            ></Overlay>
          )
      )}
      <FocusOn
        enabled={panelOpen}
        onClickOutside={() => closePanel()}
        onEscapeKey={() => closePanel()}
        preventScrollOnFocus={true}
      >
        <Content
          ref={contentRef}
          role="dialog"
          aria-labelledby="panel-title"
          style={
            {
              "--right": `${panelOpen ? 0 : panelWidth}px`,
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
      </FocusOn>
    </>
  );
}

const AnimatedOverlay = animated.div;

const Overlay = styled(AnimatedOverlay)`
  background: var(--black-opacity-75);
  opacity: var(--opacity);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
`;

const Content = styled.div`
  right: 0;
  transform: translateX(var(--right));
  width: var(--panel-width);
  min-height: 100%;
  margin: 0;
  padding: 0;
  position: fixed;
  top: 0;
  bottom: 0;
  background: var(--white);
  overflow-y: scroll;
  transition: transform 400ms;
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
