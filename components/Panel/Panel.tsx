import { DialogOverlay, DialogContent } from "@reach/dialog";
import "@reach/dialog/styles.css";
import { PanelContentT, PanelTypeT } from "types/global";
import { ClaimPanel } from "./ClaimPanel";
import { VotePanel } from "./VotePanel";

const panelTypeToPanelComponent = {
  claim: ClaimPanel,
  vote: VotePanel,
};

interface Props {
  panelType: PanelTypeT;
  panelContent: PanelContentT;
  isOpen: boolean;
  onDismiss: () => void;
}
export function Panel({ panelType, panelContent, isOpen, onDismiss }: Props) {
  if (!panelType) return null;

  const PanelComponent = panelTypeToPanelComponent[panelType];

  return (
    <DialogOverlay isOpen={isOpen} onDismiss={onDismiss}>
      <DialogContent>
        <PanelComponent content={panelContent} />
      </DialogContent>
    </DialogOverlay>
  );
}
