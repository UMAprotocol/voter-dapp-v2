import { Button, LoadingSpinner, BulletinList } from "components";
import { discordLink, mobileAndUnder, red500 } from "constant";
import { format } from "date-fns";
import { enCA } from "date-fns/locale";
import { addOpacityToHsl } from "helpers";
import NextImage from "next/image";
import Discord from "public/assets/icons/discord.svg";
import ReactMarkdown from "react-markdown";
import styled, { css } from "styled-components";
import {
  Text,
  Strong,
  AStyled,
  handleWordBreak,
} from "components/Panel/shared-styles";
import { VoteDiscussionT } from "types";
import { PanelSectionTitle } from "../styles";
import { Bulletin } from "web3/queries/getPolymarketBulletins";

interface Props {
  discussion: VoteDiscussionT | undefined;
  bulletins?: Bulletin[];
  loading: boolean;
  error?: boolean;
}

interface MessageItemProps {
  message: string;
  sender: string;
  senderPicture?: string;
  time: number;
  id: string;
  replies?: MessageItemProps[];
  isReply?: boolean;
  isLastReply?: boolean;
}

function MessageItem({
  message,
  sender,
  senderPicture,
  time,
  id: _id,
  replies,
  isReply = false,
  isLastReply = false,
}: MessageItemProps) {
  const hasReplies = replies && replies.length > 0;

  return (
    <MessageItemWrapper isReply={isReply} hasReplies={hasReplies}>
      {hasReplies && <ThreadParentLine />}
      {isReply && !isLastReply && <ThreadChildLine />}
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
      {hasReplies && (
        <RepliesWrapper>
          {replies.map((reply, idx) => (
            <MessageItem
              key={reply.id}
              {...reply}
              isReply={true}
              isLastReply={idx === replies.length - 1}
            />
          ))}
        </RepliesWrapper>
      )}
    </MessageItemWrapper>
  );
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
              {discussion?.thread.map((messageData, index, array) => (
                <SectionWrapper
                  key={messageData.id}
                  hasReplies={Boolean(messageData.replies?.length)}
                  isLast={index === array.length - 1}
                >
                  <MessageItem {...messageData} />
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

const SectionWrapper = styled.div<{ hasReplies?: boolean; isLast?: boolean }>`
  padding-bottom: 20px;
  margin-bottom: 20px;
  ${({ hasReplies, isLast }) => {
    // Only add border if message has no replies AND it's not the last message
    if (!hasReplies && !isLast) {
      return `border-bottom: 1px solid var(--black-opacity-25);`;
    }
    return "";
  }}
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

// handleWordBreak and Text imported from shared-styles

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

const A = AStyled;

const Sender = styled(Text)`
  display: inline;
`;

// Strong imported from shared-styles

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

const MessageItemWrapper = styled.div<{
  isReply: boolean;
  hasReplies?: boolean;
}>`
  position: relative;
  ${({ isReply }) =>
    isReply &&
    `
    margin-left: 30px;
    padding-top: 10px;
    padding-left: 15px;
  `}
`;

const ThreadParentLine = styled.span`
  position: absolute;
  left: 18px;
  top: 34px;
  width: 2px;
  height: calc(100% - 20px - 36px - 8px);
  border-bottom: 2px solid var(--black-opacity-25);
  border-left: 2px solid var(--black-opacity-25);
  border-radius: 0px 0px 0px 16px;
  width: 24px;
`;

const ThreadChildLine = styled.span`
  position: absolute;
  left: -10px;
  top: 24px;
  width: 24px;
  height: 2px;
  background: var(--black-opacity-25);
`;

const RepliesWrapper = styled.div`
  margin-top: 10px;
`;
