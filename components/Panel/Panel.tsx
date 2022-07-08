import { DialogOverlay, DialogContent } from "@reach/dialog";
import "@reach/dialog/styles.css";
import { ClaimPanel } from "./ClaimPanel";
import { VotePanel } from "./VotePanel";

interface Props {
  PanelComponent: typeof ClaimPanel | typeof VotePanel | null;
  isOpen: boolean;
  onDismiss: () => void;
}
export function Panel({ PanelComponent, isOpen, onDismiss }: Props) {
  return (
    <DialogOverlay isOpen={isOpen} onDismiss={onDismiss}>
      <DialogContent>{PanelComponent && <PanelComponent />}</DialogContent>
    </DialogOverlay>
  );
}
