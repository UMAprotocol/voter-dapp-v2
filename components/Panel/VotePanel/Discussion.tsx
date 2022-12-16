import { Button } from "components";
import { discordLink, mobileAndUnder, red500 } from "constant";
import { format } from "date-fns";
import { addOpacityToHsl } from "helpers";
import NextImage from "next/image";
import Message from "public/assets/icons/message.svg";
import ReactMarkdown from "react-markdown";
import styled, { css } from "styled-components";
import { DiscordMessageT, DiscordThreadT, VoteT } from "types";
import { PanelSectionTitle } from "../styles";

export function Discussion({ identifier, time }: VoteT) {
  const dummyMessages: DiscordMessageT[] = [
    {
      message:
        "[https://etherscan.io/tx/0x1837b4f9c97f29d3d1dce36jc18f3d4aaebe6686ef006ba9b5e3b8b85aec371b4](https://etherscan.io/tx/0x1837b4f9c97f29d3d1dce36jc18f3d4aaebe6686ef006ba9b5e3b8b85aec371b4)",
      sender: "Ry | UMA",
      senderPicture: "/assets/placeholder-sender-picture.jpeg",
      time: Math.floor(Date.now() / 1000).toString(),
    },
    {
      message: `Longer text afessional boxing match between undefeated WBA, IBF, WBO lightweight champion George Kambosos Jr., and undefeated WBC lightweight champion Devin Haney. The fight will take place on June 5, 2022 at Marvel Stadium in Melbourne, Australia. If George Kambosos Jr. wins this fight, this market will resolve to "Kambosos". 

If Devin Haney wins this fight, this market will resolve to "Haney". If this fight ends in a tie, is not officially designated as a win for either George Kambosos Jr. or Devin Haney, or otherwise is not decided by June 12, 2022, 11:59:59 PM ET, this market will resolve to 50-50
        
Here's my rationale lorem ipsum so I vote 1.`,
      sender: "David | UMA",
      senderPicture: "/assets/placeholder-sender-picture.jpeg",
      time: (Math.floor(Date.now() / 1000) + 1000).toString(),
    },
    {
      message:
        `I will be voting NO (0) because the pool rebalance root is incorrect` +
        "`REQUEST_TIME=1656639124 ts-node ./src/scripts/validateRootBundle.ts --wallet mnemonic" +
        '"expectedPoolRebalanceRoot": "0xe277695f3f39270aa2497edf46b5b32c1514c43e75c5b88d6c97921a83d8a87d"' +
        '"pendingRoot": "0x0770225954b17994684695e74ebb5c8880ccb5d3dddc3ff90a5ec169baee3bd0"`',
      sender: "SomeGuy",
      senderPicture: "/assets/placeholder-sender-picture.jpeg",
      time: (Math.floor(Date.now() / 1000) + 2000).toString(),
    },
  ];

  const dummyThread: DiscordThreadT = {
    identifier,
    time,
    thread: dummyMessages,
  };

  return (
    <Wrapper>
      <Disclaimer>
        <Text>
          <Strong>Note:</Strong> These discussions are from Discord and are not
          the opinions of UMA. Please vote independently based on your belief
          about the truth lorem ipsum dolor.
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
      {dummyThread.thread.map(({ message, sender, senderPicture, time }) => (
        <SectionWrapper key={time}>
          <MessageWrapper>
            <ImageWrapper>
              {senderPicture && (
                <Image
                  src={senderPicture}
                  alt="Discord user avatar"
                  width={20}
                  height={20}
                />
              )}
            </ImageWrapper>
            <MessageContentWrapper>
              <SenderWrapper>
                <Sender>
                  <Strong>{sender}</Strong>
                </Sender>{" "}
                <Time>{format(new Date(Number(time) * 1000), "Pp")}</Time>
              </SenderWrapper>
              <MessageTextWrapper>
                <ReactMarkdown
                  components={{
                    a: (props) => <A {...props} target="_blank" />,
                    p: (props) => <Text {...props} />,
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
      ))}
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
  ${handleWordBreak}
  font: var(--text-md);
  &:not(:last-child) {
    margin-bottom: 15px;
  }
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

const MessageIcon = styled(Message)`
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
