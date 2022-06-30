import Link from "next/link";
import { ReactNode } from "react";
import styled from "styled-components";

interface Props {
  href: string;
  label: ReactNode;
  active: boolean;
}

export function NavLink({ href, label, active }: Props) {
  return (
    <Wrapper>
      <Link href={href} passHref>
        <A>{label}</A>
      </Link>
    </Wrapper>
  );
}

const Wrapper = styled.div``;

const A = styled.a``;
