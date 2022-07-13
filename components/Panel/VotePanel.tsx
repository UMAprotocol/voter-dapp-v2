import { Button } from "components/Button";
import styled from "styled-components";
import { PanelContentT } from "types/global";

interface Props {
  content: PanelContentT;
}
export function VotePanel({ content }: Props) {
  if (!content) return null;

  const { description, options, timestamp, links, discordLink } = content;
  return (
    <Wrapper>
      <SectionWrapper>
        <Title>Description</Title>
        <Text>{description}</Text>
      </SectionWrapper>
      <SectionWrapper>
        <Title>Voting options</Title>
        <OptionsList>
          {options.map((option) => (
            <OptionsItem key={option}>
              <Text>{option}</Text>
            </OptionsItem>
          ))}
        </OptionsList>
      </SectionWrapper>
      <SectionWrapper>
        <Title>Timestamp</Title>
        <Text>UTC {timestamp.toUTCString()}</Text>
        <Text>UNIX {timestamp.getTime()}</Text>
      </SectionWrapper>
      <SectionWrapper>
        <Title>Links</Title>
        <LinksList>
          {links.map(({ href, label }) => (
            <LinkItem key={label}>
              <Button href={href} label={label} />
            </LinkItem>
          ))}
        </LinksList>
      </SectionWrapper>
      <DiscordLinkWrapper>
        <Button href={discordLink} label="Join discussion on Discord" />
      </DiscordLinkWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div``;

const SectionWrapper = styled.div``;

const Title = styled.h3``;

const Text = styled.p``;

const OptionsList = styled.ol``;

const OptionsItem = styled.li``;

const LinksList = styled.ul``;

const LinkItem = styled.li``;

const DiscordLinkWrapper = styled.div``;
