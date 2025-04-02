import { Button, LoadingSpinner } from "components";
import { discordLink, mobileAndUnder, red500 } from "constant";
import { format } from "date-fns";
import { enCA } from "date-fns/locale";
import { addOpacityToHsl } from "helpers";
import Discord from "public/assets/icons/discord.svg";
import ReactMarkdown from "react-markdown";
import styled, { css } from "styled-components";
import { VoteDiscussionT } from "types";
import { PanelSectionTitle } from "../styles";

interface Props {
  discussion: VoteDiscussionT | undefined;
  loading: boolean;
  error?: boolean;
}

export function Discussion({ discussion, loading, error }: Props) {
  const hasThread = Boolean(discussion?.thread?.length);

  return (
    <Wrapper>
      <Disclaimer>
        {error ? (
          <Text>
            <Strong>⚠️ Error:</Strong> The Discord API recently starting rate
            limiting our access; while we work on a solution, please visit the{" "}
            <a
              className="underline"
              target="_blank"
              href="https://discord.com/channels/718590743446290492/964000735073284127"
              rel="noreferrer"
            >
              #evidence-rational
            </a>{" "}
            channel on discord.across.to for the full discussion.
          </Text>
        ) : (
          <Text>
            <Strong>Note:</Strong> These discussions are from the UMA Protocol
            Discord. They do not reflect the opinion of Risk Labs or any other
            entity.
          </Text>
        )}
      </Disclaimer>
      <TitleSectionWrapper>
        <PanelSectionTitle>
          <IconWrapper>
            <MessageIcon />
          </IconWrapper>{" "}
          Discussion
        </PanelSectionTitle>
      </TitleSectionWrapper>
      {loading ? (
        <LoadingSpinnerWrapper>
          <LoadingSpinner size={40} variant="black" />
        </LoadingSpinnerWrapper>
      ) : (
        <>
          {hasThread ? (
            <>
              {discussion?.thread.map(({ message, time }) => (
                <SectionWrapper key={time}>
                  <MessageContentWrapper>
                    <Time>
                      {format(new Date(Number(time) * 1000), "Pp", {
                        // en-CA is the only locale that uses the correct
                        // format for the date
                        // yyyy-mm-dd
                        locale: enCA,
                      })}
                    </Time>
                    <MessageTextWrapper>
                      <ReactMarkdown
                        components={{
                          a: (props) => <A {...props} target="_blank" />,
                          p: (props) => <MessageText {...props} />,
                          pre: (props) => <Pre {...props} />,
                          code: (props) => <Code {...props} />,
                        }}
                      >
                        {message}
                      </ReactMarkdown>
                    </MessageTextWrapper>
                  </MessageContentWrapper>
                </SectionWrapper>
              ))}
            </>
          ) : (
            <Text>No discussion found for this vote.</Text>
          )}
        </>
      )}
      <DiscordLinkButtonWrapper>
        <Button
          variant="primary"
          label="Join discussion on Discord"
          href={discordLink}
          width="100%"
        />
      </DiscordLinkButtonWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin-top: 20px;
  padding-inline: 30px;
  width: calc(var(--panel-width) - 15px);

  @media ${mobileAndUnder} {
    padding-inline: 10px;
  }
`;

const SectionWrapper = styled.div`
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--black-opacity-25);
`;

const TitleSectionWrapper = styled(SectionWrapper)`
  padding-bottom: 5px;
`;

const MessageContentWrapper = styled.div`
  padding-left: 10px;
`;

const MessageTextWrapper = styled.div``;

const handleWordBreak = css`
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
`;

const Text = styled.p`
  font: var(--text-md);
  &:not(:last-child) {
    margin-bottom: 15px;
  }
`;

const MessageText = styled(Text)`
  word-wrap: break-word;
  word-break: break-word;
`;

const codeStyle = css`
  display: block;
  margin-block: 10px;
  padding-inline: 10px;
  padding-top: 10px;
  padding-bottom: 5px;
  border-radius: 5px;
  background: var(--grey-100);
`;

const Pre = styled.pre`
  ${handleWordBreak}
  ${codeStyle}
`;

const Code = styled.code`
  ${handleWordBreak}
  ${codeStyle}
`;

const A = styled.a`
  ${handleWordBreak}
  color: var(--red-500);
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const Strong = styled.strong`
  font-weight: 700;
`;

const Time = styled(Text)`
  display: inline;
`;

const Disclaimer = styled.div`
  padding-block: 12px;
  padding-inline: 20px;
  background: ${addOpacityToHsl(red500, 0.15)};
  border-radius: 5px;
  margin-bottom: 25px;
`;

const MessageIcon = styled(Discord)`
  path {
    fill: var(--red-500);
  }
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
`;

const DiscordLinkButtonWrapper = styled.div`
  margin-top: 35px;
`;

const LoadingSpinnerWrapper = styled.div`
  height: 100px;
  display: grid;
  place-items: center;
`;
