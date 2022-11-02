import { black, red500 } from "constant";
import styled, { CSSProperties, keyframes } from "styled-components";

interface Props {
  size?: number;
  thickness?: number;
  variant?: "red" | "black";
}
export function LoadingSpinner({
  size = 200,
  thickness = size / 10,
  variant = "red",
}: Props) {
  const maskSize = size / 2 - thickness;
  const blockSize = thickness + 1;
  const color = variant === "red" ? red500 : black;

  return (
    <Ring
      style={
        {
          "--size": `${size}px`,
          "--mask-size": `${maskSize}px`,
          "--color": color,
        } as CSSProperties
      }
    >
      <Block
        style={
          {
            "--block-size": `${blockSize}px`,
            "--color": color,
          } as CSSProperties
        }
      ></Block>
    </Ring>
  );
}

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const Ring = styled.div`
  position: relative;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: conic-gradient(
    from 180deg at 50% 50%,
    var(--color) 0deg,
    #0000 360deg
  );
  mask: radial-gradient(var(--mask-size), transparent 99%, var(--color) 100%) 0
    0;
  animation: ${rotate} 2.5s linear infinite;
`;

const Block = styled.div`
  width: var(--block-size);
  height: var(--block-size);
  background: var(--color);
  border-radius: calc(var(--block-size) / 4);
  position: absolute;
  bottom: 0;
  left: calc(50% - var(--block-size) / 2);
`;
