import { Nav } from "components/Nav";
import styled from "styled-components";
import Discord from "public/assets/icons/discord.svg";
import Discourse from "public/assets/icons/discourse.svg";
import Twitter from "public/assets/icons/twitter.svg";
import Github from "public/assets/icons/github.svg";
import Message from "public/assets/icons/message.svg";
import Logo from "public/assets/icons/logo.svg";
import Link from "next/link";

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

const socialLinks = [
  {
    Icon: Discord,
    href: "https://todo.com",
  },
  {
    Icon: Twitter,
    href: "https://todo.com",
  },
  {
    Icon: Github,
    href: "https://todo.com",
  },
  {
    Icon: Discourse,
    href: "https://todo.com",
  },
  {
    Icon: Message,
    href: "https://todo.com",
  },
];

export function MenuPanel() {
  return (
    <Wrapper>
      <Nav links={links} />
      <FooterWrapper>
        <SocialsWrapper>
          <Socials>
            {socialLinks.map(({ href, Icon }) => (
              <Link key={href} href={href} passHref>
                <A target="_blank">
                  <SocialIconWrapper>
                    <Icon />
                  </SocialIconWrapper>
                </A>
              </Link>
            ))}
          </Socials>
        </SocialsWrapper>
        <PoweredByWrapper>
          <PoweredBy>
            <PoweredByText>Powered by</PoweredByText>
            <UmaIconWrapper>
              <Logo />
            </UmaIconWrapper>
          </PoweredBy>
        </PoweredByWrapper>
      </FooterWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div``;

const FooterWrapper = styled.div``;

const SocialsWrapper = styled.div``;

const Socials = styled.div``;

const A = styled.a``;

const SocialIconWrapper = styled.div`
  width: 24px;
  height: 24px;
`;

const PoweredByWrapper = styled.div``;

const PoweredBy = styled.div``;

const PoweredByText = styled.p``;

const UmaIconWrapper = styled.div`
  width: 34px;
  height: 8.69px;
`;
