import { Button, LoadingSpinner, BulletinList } from "components";
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
import { Bulletin } from "web3/queries/getPolymarketBulletins";

interface Props {
  discussion: VoteDiscussionT | undefined;
  bulletins?: Bulletin[];
  loading: boolean;
  error?: boolean;
}

export function Discussion({ discussion, loading, error, bulletins }: Props) {
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
            <Strong>Warning:</Strong> These comments are from the public UMA
            Protocol Discord server, where anyone can comment. They do not
            necessarily represent the opinions of UMA voters, Risk Labs, or any
            other entity. Be aware that some commenters may attempt to influence
            vote outcomes for their own profit. Always verify any and all claims
            before relying on them to inform your own votes. View our{" "}
            <a
              href="https://docs.uma.xyz/using-uma/voting-walkthrough/voter-guide"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Voter&apos;s Guide
            </a>{" "}
            for best practices.
          </Text>
        )}
      </Disclaimer>
      <TitleSectionWrapper>
        <PanelSectionTitle>
          <IconWrapper>
            <MessageIcon />
          </IconWrapper>{" "}
          Discord Comments
        </PanelSectionTitle>
      </TitleSectionWrapper>
      {loading ? (
        <LoadingSpinnerWrapper>
          <LoadingSpinner size={40} variant="black" />
        </LoadingSpinnerWrapper>
      ) : (
        <>
          {bulletins && bulletins.length > 0 && (
            <BulletinList bulletins={bulletins} />
          )}
          {hasThread ? (
            <>
              {discussion?.thread.map(
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
