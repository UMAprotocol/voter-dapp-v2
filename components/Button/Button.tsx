import Link from "next/link";
import { ReactNode } from "react";
import styled from "styled-components";

interface Props {
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
 * @param onClick - behaves as a button when provided
 * @param href - behaves as a link when provided
 * @param label - button label
 * @throws if both onClick and href are provided
 */
export function Button({ label, onClick, href }: Props) {
  if (onClick && href) {
    throw new Error("Cannot have both onClick and href. Must behave as either a link or a button.");
  }

  return (
    <>
      {href ? <_Link href={href}>{label}</_Link> : null}
      {onClick ? <_Button onClick={onClick}>{label}</_Button> : null}
    </>
  );
}

interface LinkProps {
  href: string;
  children: ReactNode;
}
function _Link({ href, children }: LinkProps) {
  return (
    <Link href={href} passHref>
      <A>{children}</A>
    </Link>
  );
}

const A = styled.a`
  text-decoration: none;
  color: var(--red);
  font: var(--text-md);
`;

interface ButtonProps {
  onClick: () => void;
  children: ReactNode;
}
function _Button({ onClick, children }: ButtonProps) {
  return <__Button onClick={onClick}>{children}</__Button>;
}

const __Button = styled.button`
  color: var(--red);
  background: transparent;
  font: var(--text-md);
`;
