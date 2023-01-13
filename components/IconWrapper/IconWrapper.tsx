import { ReactNode } from "react";

export function IconWrapper({
  width = 15,
  height = 15,
  children,
}: {
  width?: number;
  height?: number;
  children: ReactNode;
}) {
  return <span style={{ width, height }}>{children}</span>;
}
