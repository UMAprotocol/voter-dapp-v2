import { red500 } from "constants/colors";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import styled, { CSSProperties } from "styled-components";

interface Props {
  links: {
    title: ReactNode;
    href: string;
  }[];
}
export function Nav({ links }: Props) {
  const { pathname } = useRouter();
  const isActive = (href: string) => pathname === href;
  const isExternalLink = (href: string) => !href.startsWith("/");

  return (
    <Wrapper>
      <_Nav>
        <NavItems>
          {links.map(({ title, href }) => (
            <NavItem
              key={href}
              style={
                {
                  "--border-left-color": isActive(href) ? red500 : "transparent",
                } as CSSProperties
              }
            >
              <Link href={href} passHref>
                <A target={isExternalLink(href) ? "_blank" : undefined}>{title}</A>
              </Link>
            </NavItem>
          ))}
        </NavItems>
      </_Nav>
    </Wrapper>
  );
}

const Wrapper = styled.div``;

const _Nav = styled.nav``;

const NavItems = styled.ul`
  list-style: none;
`;

const NavItem = styled.li`
  height: 50px;
  display: flex;
  align-items: center;
  padding-left: 30px;
  background: var(--white);
  border-left: 3px solid var(--border-left-color);
  border-bottom: 1px solid var(--grey-50);
  font: var(--text-md);
  cursor: pointer;

  &:hover {
    background: var(--grey-50);
  }

  transition: background 0.2s ease-in-out;
`;

const A = styled.a`
  text-decoration: none;
  color: var(--black);
`;
