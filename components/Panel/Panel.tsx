import "@reach/dialog/styles.css";
import { DialogOverlay, DialogContent } from "@reach/dialog";
import { usePanelContext } from "hooks/usePanelContext";
import styled from "styled-components";
import { ClaimPanel } from "./ClaimPanel";
import { VotePanel } from "./VotePanel";
import Close from "public/assets/icons/close.svg";

const panelTypeToPanelComponent = {
  claim: ClaimPanel,
  vote: VotePanel,
};

export function Panel() {
  const { panelType, panelContent, panelOpen, setPanelOpen } = usePanelContext();

  if (!panelType) return null;

  const PanelComponent = panelTypeToPanelComponent[panelType];

  function closePanel() {
    setPanelOpen(false);
  }
  return (
    <Overlay isOpen={panelOpen} onDismiss={closePanel}>
      <Content>
        <TitleWrapper>
          <Title>{panelContent?.title ?? ""}</Title>
          <CloseButton onClick={closePanel}>
            <CloseIcon />
          </CloseButton>
        </TitleWrapper>
        <PanelComponent content={panelContent} />
      </Content>
    </Overlay>
  );
}

const Overlay = styled(DialogOverlay)``;

const Content = styled(DialogContent)`
  width: 570px;
  height: 100%;
  margin: 0;
  padding: 0;
  right: 0;
  position: absolute;
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
