import { Button, LoadingSpinner } from "components";
import { discordLink, mobileAndUnder, red500 } from "constant";
import { format } from "date-fns";
import { enCA } from "date-fns/locale";
import { addOpacityToHsl } from "helpers";
import NextImage from "next/image";
import Discord from "public/assets/icons/discord.svg";
import ReactMarkdown from "react-markdown";
import styled, { css } from "styled-components";
import { VoteDiscussionT } from "types";
import { PanelSectionTitle } from "../styles";

interface Props {
  discussion: VoteDiscussionT;
  loading: boolean;
}
export function Discussion({ discussion, loading }: Props) {
  const hasThread = Boolean(discussion?.thread?.length);

  return (
    <Wrapper>
      <Disclaimer>
        <Text>
          <Strong>Note:</Strong> These discussions are from the UMA Protocol
          Discord. They do not reflect the opinion of Risk Labs or any other
          entity.
        </Text>
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
              {discussion.thread.map(
                ({ message, sender, senderPicture, time }) => (
                  <SectionWrapper key={time}>
                    <MessageWrapper>
                      <ImageWrapper>
                        {senderPicture ? (
                          <Image
                            src={senderPicture}
                            alt="Discord user avatar"
                            width={20}
                            height={20}
                          />
                        ) : null}
                      </ImageWrapper>
                      <MessageContentWrapper>
                        <SenderWrapper>
                          <Sender>
                            <Strong>{sender}</Strong>
                          </Sender>{" "}
                          <Time>
                            {format(new Date(Number(time) * 1000), "Pp", {
                              locale: enCA,
                            })}
                          </Time>
                        </SenderWrapper>
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
                    </MessageWrapper>
                  </SectionWrapper>
                )
              )}
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

const MessageWrapper = styled.div`
  display: grid;
  grid-template-columns: 20px 1fr;
  gap: 10px;
  padding-left: 10px;
`;

const MessageContentWrapper = styled.div``;

const MessageTextWrapper = styled.div``;

const ImageWrapper = styled.div`
  width: 20px;
  height: 20px;
  margin-top: 5px;
  border-radius: 50%;
  background: var(--grey-100);
`;

const Image = styled(NextImage)`
  border-radius: 50%;
`;

const SenderWrapper = styled.div``;

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

const Sender = styled(Text)`
  display: inline;
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
