import { Button, PanelErrorBanner } from "components";
import { mobileAndUnder } from "constant";
import {
  formatNumberForDisplay,
  parseEtherSafe,
  truncateEthAddress,
} from "helpers";
import AncillaryData from "public/assets/icons/ancillary-data.svg";
import Chat from "public/assets/icons/chat.svg";
import Chevron from "public/assets/icons/chevron.svg";
import Commit from "public/assets/icons/commit.svg";
import Doc from "public/assets/icons/doc.svg";
import Governance from "public/assets/icons/governance.svg";
import LinkIcon from "public/assets/icons/link.svg";
import Time from "public/assets/icons/time-with-inner-circle.svg";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import styled from "styled-components";
import { VoteT } from "types";
import { PanelSectionTitle } from "../styles";

type Props = Pick<
  VoteT,
  | "decodedIdentifier"
  | "description"
  | "ancillaryData"
  | "decodedAncillaryData"
  | "options"
  | "timeAsDate"
  | "links"
  | "discordLink"
  | "decodedAdminTransactions"
>;

export function Details({
  decodedIdentifier,
  description,
  ancillaryData,
  decodedAncillaryData,
  options,
  timeAsDate,
  links,
  discordLink,
  decodedAdminTransactions,
}: Props) {
  const [showDecodedAdminTransactions, setShowDecodedAdminTransactions] =
    useState(false);
  const [showRawAncillaryData, setShowRawAncillaryData] = useState(false);

  function toggleShowDecodedAdminTransactions() {
    setShowDecodedAdminTransactions(!showDecodedAdminTransactions);
  }

  function toggleShowRawAncillaryData() {
    setShowRawAncillaryData(!showRawAncillaryData);
  }

  const optionLabels = options?.map(({ label }) => label);

  return (
    <Wrapper>
      <SectionWrapper>
        <PanelSectionTitle>
          <IconWrapper>
            <DescriptionIcon />
          </IconWrapper>{" "}
          Description
        </PanelSectionTitle>
        <Text>
          <Strong>Identifier: </Strong>
          {decodedIdentifier}
        </Text>
        <Text as="div">
          <ReactMarkdown
            components={{
              a: (props) => <A {...props} target="_blank" />,
            }}
          >
            {description}
          </ReactMarkdown>
        </Text>
      </SectionWrapper>
      <SectionWrapper>
        <PanelSectionTitle>
          <IconWrapper>
            <AncillaryDataIcon />
          </IconWrapper>{" "}
          Decoded ancillary data{" "}
          <ToggleText onClick={toggleShowRawAncillaryData}>
            (view {showRawAncillaryData ? "decoded" : "raw"})
          </ToggleText>
        </PanelSectionTitle>
        <Text>
          {showRawAncillaryData ? (
            <>{ancillaryData}</>
          ) : (
            <>
              {decodedAncillaryData === ""
                ? "The ancillary data for this request is blank."
                : decodedAncillaryData}
            </>
          )}
        </Text>
      </SectionWrapper>
      {decodedAdminTransactions?.transactions ? (
        <SectionWrapper>
          <PanelSectionTitle>
            <IconWrapper>
              <GovernanceIcon />
            </IconWrapper>{" "}
            Admin transaction data
            <ToggleButton onClick={toggleShowDecodedAdminTransactions}>
              {" "}
              <ChevronIcon $isExpanded={showDecodedAdminTransactions} />
            </ToggleButton>
          </PanelSectionTitle>
          {showDecodedAdminTransactions ? (
            <>
              {decodedAdminTransactions.transactions.map(
                ({ to, decodedData, value }, index) => (
                  <>
                    <TransactionText>
                      Transaction <Strong>#{index + 1}</Strong> to{" "}
                      <A href={`https://etherscan.io/address/${to}`}>
                        {truncateEthAddress(to)}
                      </A>
                    </TransactionText>
                    <Pre>{decodedData}</Pre>
                    {value !== "0" && (
                      <Text>
                        <>
                          {formatNumberForDisplay(parseEtherSafe(value))} was
                          sent in this transaction.
                        </>
                      </Text>
                    )}
                  </>
                )
              )}
            </>
          ) : (
            <ToggleText onClick={toggleShowDecodedAdminTransactions}>
              {decodedAdminTransactions.transactions.length} admin transaction
              {decodedAdminTransactions.transactions.length !== 1
                ? "s"
                : ""}{" "}
              hidden. Click to show.
            </ToggleText>
          )}
        </SectionWrapper>
      ) : null}
      {optionLabels && (
        <SectionWrapper>
          <PanelSectionTitle>
            <IconWrapper>
              <VotingIcon />
            </IconWrapper>
            Voting options
          </PanelSectionTitle>
          <OptionsList>
            {optionLabels?.map((label) => (
              <OptionsItem key={label}>{label}</OptionsItem>
            ))}
          </OptionsList>
        </SectionWrapper>
      )}
      <SectionWrapper>
        <PanelSectionTitle>
          <IconWrapper>
            <TimestampIcon />
          </IconWrapper>
          Timestamp
        </PanelSectionTitle>
        <Timestamp>
          <span>UTC</span> <span>{timeAsDate.toUTCString()}</span>
        </Timestamp>
        <Timestamp>
          <span>UNIX</span> <span>{timeAsDate.getTime()}</span>
        </Timestamp>
      </SectionWrapper>
      {links.length > 0 ? (
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
      ) : null}
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
        <PanelErrorBanner errorOrigin="vote" />
      </DiscordLinkWrapper>
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
  &:not(:last-child) {
    border-bottom: 1px solid var(--black-opacity-25);
  }
`;

const Text = styled.p`
  font: var(--text-md);
  &:not(:last-child) {
    margin-bottom: 15px;
  }
`;

const TransactionText = styled(Text)`
  margin-block: 15px;
`;

const Strong = styled.strong`
  font-weight: 700;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  margin-left: auto;
  margin-right: 5px;
`;

const ToggleText = styled.span`
  font: var(--text-md);
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const Pre = styled.pre`
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
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

const AncillaryDataIcon = styled(AncillaryData)`
  path {
    fill: var(--red-500);
  }
`;

const VotingIcon = styled(Commit)`
  circle {
    fill: var(--red-500);
  }
`;

const GovernanceIcon = styled(Governance)`
  circle {
    fill: var(--red-500);
  }
  path {
    fill: var(--red-500);
  }
`;

const TimestampIcon = styled(Time)`
  path {
    stroke: var(--white);
    fill: var(--red-500);
  }
`;

const LinksIcon = styled(LinkIcon)`
  path {
    fill: var(--red-500);
  }
`;

const ChatIcon = styled(Chat)``;

const ChevronIcon = styled(Chevron)<{ $isExpanded: boolean }>`
  transform: rotate(${({ $isExpanded }) => ($isExpanded ? "0deg" : "180deg")});
  transition: transform 0.2s ease-in-out;
`;

const DiscordLinkContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const A = styled.a`
  color: var(--red-500);
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;
