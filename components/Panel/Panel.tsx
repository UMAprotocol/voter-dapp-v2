import { DialogOverlay, DialogContent } from "@reach/dialog";
import "@reach/dialog/styles.css";
import { PanelTypeT } from "types/global";
import { ClaimPanel } from "./ClaimPanel";
import { VotePanel } from "./VotePanel";

const panelTypeToPanelComponent = {
  claim: ClaimPanel,
  vote: VotePanel,
};

interface Props {
  panelType: PanelTypeT;
  content: { title: string; description: string };
  isOpen: boolean;
  onDismiss: () => void;
}
export function Panel({ panelType, isOpen, onDismiss, content }: Props) {
  if (!panelType) return null;

  const PanelComponent = panelTypeToPanelComponent[panelType];

  return (
    <DialogOverlay isOpen={isOpen} onDismiss={onDismiss}>
      <DialogContent>
        <PanelComponent content={content} />
      </DialogContent>
    </DialogOverlay>
  );
}
