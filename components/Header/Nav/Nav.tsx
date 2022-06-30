import { useRouter } from "next/router";
import styled from "styled-components";
import { NavLink } from "./NavLink";

export function Nav() {
  const { pathname } = useRouter();

  const links = [
    { href: "/", label: "Vote" },
    { href: "/TODO", label: "Settled Disputes" },
    { href: "/TODO", label: "Calendar" },
    { href: "/TODO", label: "Docs" },
  ];

  return (
    <Wrapper>
      <nav>
        {links.map(({ href, label }) => (
          <NavLink href={href} label={label} active={pathname === href} key={label} />
        ))}
      </nav>
    </Wrapper>
  );
}

const Wrapper = styled.div``;
