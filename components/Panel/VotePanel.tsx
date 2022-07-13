import { Button } from "components/Button";
import styled from "styled-components";
import { PanelContentT } from "types/global";
import Doc from "public/assets/icons/doc.svg";
import Commit from "public/assets/icons/commit.svg";
import Time from "public/assets/icons/time-with-inner-circle.svg";
import Link from "public/assets/icons/link.svg";

interface Props {
  content: PanelContentT;
}
export function VotePanel({ content }: Props) {
  if (!content) return null;

  const { description, options, timestamp, links, discordLink } = content;
  return (
    <Wrapper>
      <SectionWrapper>
        <Title>
          <IconWrapper>
            <DescriptionIcon />
          </IconWrapper>{" "}
          Description
        </Title>
        <Text>{description}</Text>
      </SectionWrapper>
      <SectionWrapper>
        <Title>
          <IconWrapper>
            <VotingIcon />
          </IconWrapper>
          Voting options
        </Title>
        <OptionsList>
          {options.map((option) => (
            <OptionsItem key={option}>
              <Text>{option}</Text>
            </OptionsItem>
          ))}
        </OptionsList>
      </SectionWrapper>
      <SectionWrapper>
        <Title>
          <IconWrapper>
            <TimestampIcon />
          </IconWrapper>
          Timestamp
        </Title>
        <Text>UTC {timestamp.toUTCString()}</Text>
        <Text>UNIX {timestamp.getTime()}</Text>
      </SectionWrapper>
      <SectionWrapper>
        <Title>
          <IconWrapper>
            <LinksIcon />
          </IconWrapper>
          Links
        </Title>
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

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
`;

const DescriptionIcon = styled(Doc)`
  circle {
    fill: var(--red);
  }
`;

const VotingIcon = styled(Commit)`
  circle {
    fill: var(--red);
  }
`;

const TimestampIcon = styled(Time)`
  path {
    stroke: var(--white);
    fill: var(--red);
  }
`;

const LinksIcon = styled(Link)`
  path {
    fill: var(--red);
  }
`;
