import { red100, red500, red600, white } from "constants/colors";
import Link from "next/link";
import { ReactNode } from "react";
import styled, { CSSProperties } from "styled-components";

interface Props {
  /**
   * use `primary` for the most important UI element on the page, `secondary` for the second most, and so on
   */
  variant?: "primary" | "secondary" | "tertiary";
  /**
   * button contents
   */
  label: ReactNode;
  /**
   * optional click handler
   */
  onClick?: () => void;
  /**
   * optional link
   */
  href?: string;
  /**
   * disables the button
   */
  disabled?: boolean;
  /**
   * optionally override the width
   */
  width?: CSSProperties["width"];
  /**
   * optionally override the height
   */
  height?: CSSProperties["height"];
  /**
   * optionally override the font size
   */
  fontSize?: number;
  /**
   * use type = "submit" for when used with a <form>
   */
  type?: "submit" | "button";
}
export function Button({
  variant = "tertiary",
  label,
  onClick,
  href,
  width = 200,
  height = 50,
  fontSize,
  disabled,
  type = "button",
}: Props) {
  if (onClick && href) {
    throw new Error("Cannot have both onClick and href. Must behave as either a link or a button.");
  }

  if (!onClick && !href && type !== "submit") {
    throw new Error(
      "Must have either onClick or href unless acting as a submit button. Must behave as either a link, a button, or a submit button."
    );
  }

  if (href && disabled) {
    throw new Error("`disabled` only makes sense on `button` elements. Cannot be used with `href`. ");
  }

  width = typeof width === "string" ? width : `${width}px`;
  height = typeof height === "string" ? height : `${height}px`;

  const styles = {
    primary: {
      "--display": "grid",
      "--place-items": "center",
      "--color": white,
      "--background-color": red500,
      "--hover-background-color": red600,
      "--width": width,
      "--height": height,
      "--border-radius": 5 + "px",
      "--font-size": (fontSize ? fontSize : 18) + "px",
    } as CSSProperties,
    secondary: {
      "--display": "grid",
      "--place-items": "center",
      "--color": red500,
      "--background-color": white,
      "--hover-background-color": red100,
      "--width": width,
      "--height": height,
      "--border-radius": 5 + "px",
      "--border": `1px solid ${red500}`,
      "--font-size": (fontSize ? fontSize : 18) + "px",
    } as CSSProperties,
    tertiary: {
      "--color": red500,
      "--background-color": "transparent",
      "--font-size": (fontSize ? fontSize : 16) + "px",
    } as CSSProperties,
  };

  const style = styles[variant];

  return (
    <>
      {href ? (
        <_Link href={href} style={style}>
          {label}
        </_Link>
      ) : null}
      {onClick || type === "submit" ? (
        <_Button onClick={onClick} style={style} disabled={disabled} type={type}>
          {label}
        </_Button>
      ) : null}
    </>
  );
}

interface LinkProps {
  href: string;
  children: ReactNode;
  style: CSSProperties;
}
function _Link({ href, children, style }: LinkProps) {
  return (
    <Link href={href} passHref>
      <A style={style}>{children}</A>
    </Link>
  );
}

const A = styled.a`
  display: var(--display);
  place-items: var(--place-items);
  width: var(--width);
  height: var(--height);
  text-decoration: none;
  color: var(--color);
  background-color: var(--background-color);
  border: var(--border);
  border-radius: var(--border-radius);
  font: var(--text-md);
  font-size: var(--font-size);

  &:hover {
    background-color: var(--hover-background-color);
  }

  transition: background-color 0.2s ease-in-out;
`;

interface ButtonProps {
  onClick?: () => void;
  children: ReactNode;
  style: CSSProperties;
  disabled?: boolean;
  type?: "submit" | "button";
}
function _Button({ onClick, children, style, disabled, type }: ButtonProps) {
  return (
    <__Button onClick={onClick} style={style} disabled={disabled} type={type}>
      {children}
    </__Button>
  );
}

const __Button = styled.button`
  display: var(--display);
  place-items: var(--place-items);
  width: var(--width);
  height: var(--height);
  color: var(--color);
  background-color: var(--background-color);
  border: var(--border);
  border-radius: var(--border-radius);
  font: var(--text-md);
  font-size: var(--font-size);

  &:hover {
    &:not(:disabled) {
      background-color: var(--hover-background-color);
    }
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.25;
  }

  transition: opacity, background-color 0.2s ease-in-out;
`;
