import { DialogOverlay, DialogContent } from "@reach/dialog";
import "@reach/dialog/styles.css";
import { usePanelContext } from "hooks/usePanelContext";
import { PanelContentT, PanelTypeT } from "types/global";
import { ClaimPanel } from "./ClaimPanel";
import { VotePanel } from "./VotePanel";

const panelTypeToPanelComponent = {
  claim: ClaimPanel,
  vote: VotePanel,
};

export function Panel() {
  const { panelType, panelContent, panelOpen, setPanelOpen } = usePanelContext();

  if (!panelType) return null;

  const PanelComponent = panelTypeToPanelComponent[panelType];

  return (
    <DialogOverlay isOpen={panelOpen} onDismiss={() => setPanelOpen(false)}>
      <DialogContent>
        <PanelComponent content={panelContent} />
      </DialogContent>
    </DialogOverlay>
  );
}
