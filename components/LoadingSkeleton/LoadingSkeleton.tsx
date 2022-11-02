import { loadingSkeletonOpacity100, white, whiteOpacity10 } from "constant/colors";
import styled, { CSSProperties, keyframes } from "styled-components";

interface Props {
  width?: string | number;
  height?: string | number;
  variant?: "grey" | "white";
}
export function LoadingSkeleton({ width = 30, height = 16, variant = "grey" }: Props) {
  if (typeof width === "number") width = `${width}px`;
  if (typeof height === "number") height = `${height}px`;
  const opaqueColor = variant === "grey" ? loadingSkeletonOpacity100 : white;
  const semiTransparentColor = variant === "grey" ? loadingSkeletonOpacity100 : whiteOpacity10;

  const style = {
    "--width": width,
    "--height": height,
    "--opaque-color": opaqueColor,
    "--semi-transparent-color": semiTransparentColor,
  } as CSSProperties;

  return <Wrapper style={style}></Wrapper>;
}

const shine = keyframes`
  0% {
    opacity: 0.1;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.1;
  }
`;

const Wrapper = styled.span`
  display: inline-block;
  margin-bottom: -2px;
  width: var(--width);
  height: var(--height);
  background: linear-gradient(to right, var(--opaque-color), var(--semi-transparent-color) 100%);
  border-radius: 5px;
  animation: ${shine} 3s linear infinite;
`;
