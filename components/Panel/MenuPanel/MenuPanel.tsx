import { Nav } from "components/Nav";
import styled from "styled-components";

const links = [
  {
    title: "Vote",
    href: "/",
  },
  {
    title: "Settled Disputes & Votes",
    href: "/settled",
  },
  {
    title: "Two Key Voting",
    href: "/two-key",
  },
  {
    title: "Optimistic Oracle",
    href: "https://oracle.umaproject.org",
  },
  {
    title: "Docs",
    href: "https://docs.umaproject.org",
  },
];

export function MenuPanel() {
  return (
    <Wrapper>
      <Nav links={links} />
    </Wrapper>
  );
}

const Wrapper = styled.div``;
