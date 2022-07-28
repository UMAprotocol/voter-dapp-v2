import Link from "next/link";
import { ReactNode } from "react";
import styled from "styled-components";

interface Props {
  links: {
    title: ReactNode;
    href: string;
  };
}
export function Nav({ links }: Props) {
  return (
    <Wrapper>
      <_Nav></_Nav>
    </Wrapper>
  );
}

const Wrapper = styled.div``;

const _Nav = styled.nav``;

const NavItems = styled.ul``;

const NavItem = styled.li``;

const NavLink = styled(Link)``;

const A = styled.a``;
