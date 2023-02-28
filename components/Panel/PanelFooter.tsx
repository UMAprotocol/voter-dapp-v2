import NextLink from "next/link";
import Discord from "public/assets/icons/discord.svg";
import Discourse from "public/assets/icons/discourse.svg";
import Github from "public/assets/icons/github.svg";
import Logo from "public/assets/icons/logo.svg";
import Medium from "public/assets/icons/medium.svg";
import Twitter from "public/assets/icons/twitter.svg";
import styled from "styled-components";

const socialLinks = [
  {
    Icon: Discord,
    href: "https://discord.com/invite/jsb9XQJ",
  },
  {
    Icon: Twitter,
    href: "https://twitter.com/umaprotocol",
  },
  {
    Icon: Github,
    href: "https://github.com/UMAprotocol",
  },
  {
    Icon: Medium,
    href: "https://medium.com/uma-project",
  },
  {
    Icon: Discourse,
    href: "https://discourse.uma.xyz",
  },
];

export function PanelFooter() {
  return (
    <Wrapper>
      <SocialsWrapper>
        <Socials>
          {socialLinks.map(({ href, Icon }) => (
            <Link key={href} href={href} target="_blank">
              <SocialIconWrapper>
                <Icon />
              </SocialIconWrapper>
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
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: grid;
  gap: 24px;
  margin-top: 48px;
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

const Link = styled(NextLink)``;

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

const UmaIconWrapper = styled.span`
  display: inline-block;
  width: 34px;
  height: 8.69px;
`;
