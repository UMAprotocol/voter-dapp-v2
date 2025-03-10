import { DialogContent, DialogOverlay, DialogProps } from "@reach/dialog";
import { cn } from "lib/utils";

export type ModalProps = DialogProps & {
  children: React.ReactNode;
  className?: string;
};

export function Modal({ children, className, ...props }: ModalProps) {
  return (
    <DialogOverlay
      style={
        {
          "--reach-dialog": 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "hsla(0, 0%, 0%, 0.33)",
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          overflow: "auto",
          padding: "12px",
        } as React.CSSProperties
      }
      {...props}
    >
      <DialogContent
        className={cn(
          "m-auto w-full rounded-[5px] bg-[#EFEFEF] p-4 shadow-md",
          className
        )}
      >
        {children}
      </DialogContent>
    </DialogOverlay>
  );
}
