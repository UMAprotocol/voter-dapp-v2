import { Button } from "components/Button";
import styled from "styled-components";
import Doc from "public/assets/icons/doc.svg";
import Commit from "public/assets/icons/commit.svg";
import Time from "public/assets/icons/time-with-inner-circle.svg";
import Link from "public/assets/icons/link.svg";
import Chat from "public/assets/icons/chat.svg";
import { PanelSectionTitle } from "../styles";

interface Props {
  description: string;
  options: string[];
  timestamp: Date;
  links: { href: string; label: string }[];
  discordLink: string;
}

export function Details({ description, options, timestamp, links, discordLink }: Props) {
  return (
    <Wrapper>
      <SectionWrapper>
        <PanelSectionTitle>
          <IconWrapper>
            <DescriptionIcon />
          </IconWrapper>{" "}
          Description
        </PanelSectionTitle>
        <Text>{description}</Text>
      </SectionWrapper>
      <SectionWrapper>
        <PanelSectionTitle>
          <IconWrapper>
            <VotingIcon />
          </IconWrapper>
          Voting options
        </PanelSectionTitle>
        <OptionsList>
          {options.map((option) => (
            <OptionsItem key={option}>{option}</OptionsItem>
          ))}
        </OptionsList>
      </SectionWrapper>
      <SectionWrapper>
        <PanelSectionTitle>
          <IconWrapper>
            <TimestampIcon />
          </IconWrapper>
          Timestamp
        </PanelSectionTitle>
        <Timestamp>
          <span>UTC</span> <span>{timestamp.toUTCString()}</span>
        </Timestamp>
        <Timestamp>
          <span>UNIX</span> <span>{timestamp.getTime()}</span>
        </Timestamp>
      </SectionWrapper>
      <SectionWrapper>
        <PanelSectionTitle>
          <IconWrapper>
            <LinksIcon />
          </IconWrapper>
          Links
        </PanelSectionTitle>
        <LinksList>
          {links.map(({ href, label }) => (
            <LinkItem key={label}>
              <Button href={href} label={label} />
            </LinkItem>
          ))}
        </LinksList>
      </SectionWrapper>
      <DiscordLinkWrapper>
        <Button
          href={discordLink}
          variant="primary"
          width="100%"
          height={45}
          fontSize={16}
          label={
            <DiscordLinkContent>
              <IconWrapper>
                <ChatIcon />
              </IconWrapper>{" "}
              Join the discussion on Discord
            </DiscordLinkContent>
          }
        />
      </DiscordLinkWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin-top: 20px;
  padding-inline: 30px;
`;

const SectionWrapper = styled.div`
  padding-bottom: 20px;
  margin-bottom: 20px;
  &:not(:last-child) {
    border-bottom: 1px solid var(--black-opacity-25);
  }
`;

const Text = styled.p`
  font: var(--text-md);
`;

const Timestamp = styled(Text)`
  display: flex;
  gap: 30px;
`;

const OptionsList = styled.ol`
  margin-left: 5px;
  list-style-position: inside;
  font: var(--text-md);
`;

const OptionsItem = styled.li``;

const LinksList = styled.ul`
  list-style: none;
`;

const LinkItem = styled.li``;

const DiscordLinkWrapper = styled.div`
  margin-bottom: 60px;
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
`;

const DescriptionIcon = styled(Doc)`
  circle {
    fill: var(--red-500);
  }
`;

const VotingIcon = styled(Commit)`
  circle {
    fill: var(--red-500);
  }
`;

const TimestampIcon = styled(Time)`
  path {
    stroke: var(--white);
    fill: var(--red-500);
  }
`;

const LinksIcon = styled(Link)`
  path {
    fill: var(--red-500);
  }
`;

const ChatIcon = styled(Chat)``;

const DiscordLinkContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;