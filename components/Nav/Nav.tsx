import { red500 } from "constant";
import { isExternalLink } from "helpers";
import { usePanelContext } from "hooks";
import NextLink from "next/link";
import { useRouter } from "next/router";
import ExternalLinkIcon from "public/assets/icons/external-link.svg";
import { ReactNode, useEffect } from "react";
import styled, { CSSProperties } from "styled-components";

interface Props {
  links: {
    title: ReactNode;
    href: string;
  }[];
}
export function Nav({ links }: Props) {
  const { closePanel } = usePanelContext();
  const router = useRouter();
  const isActive = (href: string) => router.pathname === href;

  useEffect(() => {
    router.events.on("routeChangeStart", closePanel);

    return () => {
      router.events.off("routeChangeStart", closePanel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Wrapper>
      <_Nav>
        <NavItems>
          {links.map(({ title, href }) => (
            <NavItem
              key={href}
              style={
                {
                  "--border-left-color": isActive(href)
                    ? red500
                    : "transparent",
                } as CSSProperties
              }
            >
              <Link
                href={href}
                target={isExternalLink(href) ? "_blank" : undefined}
              >
                {title}
                {isExternalLink(href) && <ExternalLinkIcon />}
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

const NavItem = styled.li``;

const Link = styled(NextLink)`
  text-decoration: none;
  color: var(--black);
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: 30px;
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
