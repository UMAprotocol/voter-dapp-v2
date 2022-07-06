import { red, white } from "constants/colors";
import Link from "next/link";
import { ReactNode } from "react";
import styled, { CSSProperties } from "styled-components";

interface Props {
  /**
   * use `primary` for the most important UI element on the page
   */
  variant?: "primary" | "secondary";
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
}

/**
 * Primary UI component for user interaction
 *
 * @param variant use `primary` for the most important UI element on the page
 * @param onClick - behaves as a button when provided
 * @param href - behaves as a link when provided
 * @param label - button label
 * @throws if both onClick and href are provided
 */
export function Button({ variant = "secondary", label, onClick, href }: Props) {
  if (onClick && href) {
    throw new Error("Cannot have both onClick and href. Must behave as either a link or a button.");
  }

  const primaryStyle = {
    "--display": "grid",
    "--place-items": "center",
    "--color": white,
    "--background-color": red,
    "--width": 200 + "px",
    "--height": 50 + "px",
    "--border-radius": 5 + "px",
    "--font-size": 18 + "px",
  } as CSSProperties;

  const secondaryStyle = {
    "--display": "unset",
    "--place-items": "unset",
    "--color": red,
    "--background-color": "transparent",
    "--width": "unset",
    "--height": "unset",
    "--border-radius": "unset",
    "--font-size": 16 + "px",
  } as CSSProperties;

  const style = variant === "primary" ? primaryStyle : secondaryStyle;

  return (
    <>
      {href ? (
        <_Link href={href} style={style}>
          {label}
        </_Link>
      ) : null}
      {onClick ? (
        <_Button onClick={onClick} style={style}>
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
  border-radius: var(--border-radius);
  font: var(--text-md);
  font-size: var(--font-size);
`;

interface ButtonProps {
  onClick: () => void;
  children: ReactNode;
  style: CSSProperties;
}
function _Button({ onClick, children, style }: ButtonProps) {
  return (
    <__Button onClick={onClick} style={style}>
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
  border-radius: var(--border-radius);
  font: var(--text-md);
  font-size: var(--font-size);
`;
