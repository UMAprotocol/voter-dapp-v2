import { black, gray100, red, white } from "constants/colors";
import { textMd, textSm, textXs } from "constants/fonts";
import styled, { CSSProperties } from "styled-components";

interface Props {
  /**
   * Is this the principal call to action on the page?
   */
  primary?: boolean;
  /**
   * How large should the button be?
   */
  size?: "small" | "medium" | "large";
  /**
   * Button contents
   */
  label: string;
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

/**
 * Primary UI component for user interaction
 */
export function Button({ primary = false, size = "medium", label, ...props }: Props) {
  const color = primary ? white : black;
  const backgroundColor = primary ? red : gray100;
  const boxShadow = primary ? "" : "rgba(0, 0, 0, 0.15) 0px 0px 0px 1px inset";
  const font = size === "small" ? textXs : size === "medium" ? textSm : textMd;
  const paddingBlock = size === "small" ? 10 : size === "medium" ? 11 : 12;
  const paddingInline = size === "small" ? 16 : size === "medium" ? 20 : 24;
  return (
    <_Button
      {...props}
      style={
        {
          "--color": color,
          "--background-color": backgroundColor,
          "--box-shadow": boxShadow,
          "--font": font,
          "--padding-block": paddingBlock + "px",
          "--padding-inline": paddingInline + "px",
        } as CSSProperties
      }
    >
      {label}
    </_Button>
  );
}

const _Button = styled.button`
  font-family: "Nunito Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-weight: 700;
  border: 0;
  border-radius: 3em;
  cursor: pointer;
  display: inline-block;
  line-height: 1;
  color: var(--color);
  background-color: var(--background-color);
  box-shadow: var(--box-shadow);
  font: var(--font);
  padding-block: var(--padding-block);
  padding-inline: var(--padding-inline);
`;
