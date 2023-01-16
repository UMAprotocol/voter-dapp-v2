import { ReactNode } from "react";
import { CSSProperties } from "styled-components";

export function IconWrapper({
  width = 15,
  height = 15,
  display = "block",
  children,
}: {
  width?: number;
  height?: number;
  display?: CSSProperties["display"];
  children: ReactNode;
}) {
  return <span style={{ width, height, display }}>{children}</span>;
}
