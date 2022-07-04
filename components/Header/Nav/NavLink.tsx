import Link from "next/link";
import { ReactNode } from "react";
import styled, { CSSProperties } from "styled-components";

interface Props {
  href: string;
  label: ReactNode;
  active: boolean;
}

export function NavLink({ href, label, active }: Props) {
  const borderBottom = active ? "2px solid var(--red)" : "none";
  return (
    <Wrapper style={{ "--border-bottom": borderBottom } as CSSProperties}>
      <Link href={href} passHref>
        <A>{label}</A>
      </Link>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: fit-content;
  padding-bottom: 5px;
  border-bottom: var(--border-bottom);
`;

const A = styled.a`
  outline: none;
  text-decoration: none;
  color: var(--black);
  font: var(--text-sm);
`;
