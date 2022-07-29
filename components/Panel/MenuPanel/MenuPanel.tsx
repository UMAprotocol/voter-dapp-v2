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
      <AccountWrapper>Account</AccountWrapper>
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
            Powered by
            <UmaIconWrapper>
              <Logo />
            </UmaIconWrapper>
          </PoweredBy>
        </PoweredByWrapper>
      </FooterWrapper>
    </Wrapper>
  );
}

const AccountWrapper = styled.div`
  height: 160px;
  background: var(--grey-100);
`;

const Wrapper = styled.div`
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr auto;
`;

const FooterWrapper = styled.div`
  display: grid;
  gap: 24px;
  margin-bottom: 24px;
`;

const SocialsWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const Socials = styled.div`
  width: fit-content;
  display: flex;
  gap: 32px;
`;

const A = styled.a``;

const SocialIconWrapper = styled.div`
  width: 24px;
  height: 24px;
`;

const PoweredByWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const PoweredBy = styled.p`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--red-500);
  font: var(--text-xs);
`;

const UmaIconWrapper = styled.div`
  width: 34px;
  height: 8.69px;
`;
