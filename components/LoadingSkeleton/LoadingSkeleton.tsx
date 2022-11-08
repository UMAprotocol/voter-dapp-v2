import { loadingSkeletonOpacity100, white, whiteOpacity10 } from "constant";
import { cloneElement } from "react";
import styled, { CSSProperties, keyframes } from "styled-components";

interface Props {
  children: JSX.Element;
  isLoading: boolean;
  height?: CSSProperties["height"];
  width?: CSSProperties["width"];
  variant?: "grey" | "white";
}
export function LoadingSkeleton({
  children,
  isLoading,
  width,
  height,
  variant = "grey",
}: Props) {
  const opaqueColor = variant === "grey" ? loadingSkeletonOpacity100 : white;
  const semiTransparentColor =
    variant === "grey" ? loadingSkeletonOpacity100 : whiteOpacity10;

  const style = {
    "--opaque-color": opaqueColor,
    "--semi-transparent-color": semiTransparentColor,
    "--width": getDimension(width),
    "--height": getDimension(height),
  } as CSSProperties;

  const placeholder = cloneElement(children, {
    children: <Placeholder>INVISIBLE</Placeholder>,
  });

  function getDimension(dimension: number | string | undefined) {
    if (dimension === undefined) return;

    return typeof dimension === "number" ? `${dimension}px` : dimension;
  }

  return isLoading ? (
    <Wrapper style={style}>{placeholder}</Wrapper>
  ) : (
    <>{children}</>
  );
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

const Placeholder = styled.span`
  display: inline-block;
  opacity: 0;
`;

const Wrapper = styled.span`
  display: inline-block;
  width: var(--width, 90%);
  height: var(--height, 90%);
  background: linear-gradient(
    to right,
    var(--opaque-color),
    var(--semi-transparent-color) 100%
  );
  border-radius: 5px;
  animation: ${shine} 3s linear infinite;
`;
