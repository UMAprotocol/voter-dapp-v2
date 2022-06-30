import { useRouter } from "next/router";
import styled from "styled-components";
import { NavLink } from "./NavLink";

export function Nav() {
  const { pathname } = useRouter();

  const links = [
    { href: "/", label: "Vote" },
    { href: "/TODO", label: "Settled disputes" },
    { href: "/TODO", label: "Calendar" },
    { href: "/TODO", label: "Docs" },
  ];

  return (
    <Wrapper>
      <_Nav>
        {links.map(({ href, label }) => (
          <NavLink href={href} label={label} active={pathname === href} key={label} />
        ))}
      </_Nav>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  max-width: 384px;
`;

const _Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
`;
