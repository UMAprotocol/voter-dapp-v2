import { Button, PanelErrorBanner, BulletinList } from "components";
import { getOracleTypeDisplayName, supportedChains } from "constant";
import {
  checkIfIsPolymarket,
  decodeHexString,
  formatNumberForDisplay,
  getQuestionId,
  makeBlockExplorerLink,
  makeTransactionHashLink,
  parseEtherSafe,
  truncateEthAddress,
  getClaimDescription,
} from "helpers";
import { config } from "helpers/config";
import { useOptimisticGovernorData } from "hooks/queries/votes/useOptimisticGovernorData";
import {
  useAssertionClaim,
  useAugmentedVoteData,
  usePolymarketBulletins,
} from "hooks";
import PolymarketIcon from "public/assets/icons/polymarket.svg";

import ExternalLinkIcon from "public/assets/icons/external-link.svg";
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
import { OracleTypeT, SupportedChainIds, VoteT } from "types";
import { PanelSectionSubTitle, PanelSectionTitle } from "../styles";
import { ChainIcon } from "./ChainIcon";
import { OoTypeIcon } from "./OoTypeIcon";
import { usePolymarketLink } from "hooks/queries/votes";
import { PanelContentWrapper } from "./VotePanel";

export function Details(query: VoteT) {
  const {
    decodedIdentifier,
    description,
    ancillaryData,
    decodedAncillaryData,
    options,
    time,
    timeAsDate,
    discordLink,
    decodedAdminTransactions,
    umipOrUppLink,
    assertionChildChainId,
    assertionAsserter,
    assertionId,
    ancillaryDataL2,
  } = query;
  const [showDecodedAdminTransactions, setShowDecodedAdminTransactions] =
    useState(false);
  const [showRawAncillaryData, setShowRawAncillaryData] = useState(false);
  const [showRawClaimData, setShowRawClaimData] = useState(false);
  const [showDecodedAncillaryData, setShowDecodedAncillaryData] =
    useState(false);
  const { isOptimisticGovernorVote, explanationText, rules, ipfs } =
    useOptimisticGovernorData(decodedAncillaryData);
  const { data: claim } = useAssertionClaim(assertionChildChainId, assertionId);
  const isClaim = !!claim;
  const showAncillaryData = !isClaim;
  const { data: bulletins } = usePolymarketBulletins(ancillaryDataL2);

  const claimDescription = claim
    ? getClaimDescription(decodeHexString(claim))
    : "";

  function toggleShowDecodedAdminTransactions() {
    setShowDecodedAdminTransactions(!showDecodedAdminTransactions);
  }

  function toggleShowRawAncillaryData() {
    setShowRawAncillaryData(!showRawAncillaryData);
    setShowDecodedAncillaryData(false);
  }
  function toggleShowDecodedAncillaryData() {
    setShowDecodedAncillaryData(!showDecodedAncillaryData);
    setShowRawAncillaryData(false);
  }
  function toggleShowRawClaimData() {
    setShowRawClaimData(!showRawClaimData);
  }

  const augmentedDataResponse = useAugmentedVoteData({
    time,
    identifier: decodedIdentifier,
    ancillaryData: ancillaryDataL2,
  });
  const augmentedData = augmentedDataResponse.data;

  function makeOoRequestLink() {
    if (!augmentedData?.ooRequestUrl) return;

    return {
      href: augmentedData.ooRequestUrl,
      label: "Optimistic Oracle UI",
    };
  }

  function makeAsserterLink() {
    if (!assertionAsserter || !assertionChildChainId) return;

    return {
      label: "Asserter",
      href: makeBlockExplorerLink(
        assertionAsserter,
        assertionChildChainId,
        "address"
      ),
    };
  }

  const optionLabels = options?.map(({ label }) => label);
  const links = [
    makeAsserterLink(),
    umipOrUppLink,
    augmentedData?.l1RequestTxHash &&
    augmentedData?.l1RequestTxHash !== "rolled"
      ? makeTransactionHashLink(
          `${config.properName} DVM request`,
          augmentedData?.l1RequestTxHash,
          config.chainId
        )
      : undefined,
    augmentedData?.originatingChainTxHash &&
    augmentedData.originatingChainId &&
    augmentedData.originatingOracleType
      ? makeTransactionHashLink(
          `${
            supportedChains[
              augmentedData.originatingChainId as SupportedChainIds
            ]
          } ${getOracleTypeDisplayName(
            augmentedData.originatingOracleType
          )} Request`,
          augmentedData.originatingChainTxHash,
          augmentedData.originatingChainId
        )
      : undefined,
    makeOoRequestLink(),
  ].filter(Boolean);

  const hash = augmentedData?.originatingChainTxHash ?? "";

  const shouldFetch =
    checkIfIsPolymarket(decodedIdentifier, decodedAncillaryData) &&
    Boolean(hash) &&
    Boolean(config.chainId === 1); // skip testnet

  const { data: polymarketLink } = usePolymarketLink(
    getQuestionId({
      decodedAncillaryData,
    }),
    shouldFetch
  );
  return (
    <PanelContentWrapper>
      <SectionWrapper>
        <RequestInfoIcons>
          <ChainIcon
            chainId={
              augmentedData?.originatingChainId as SupportedChainIds | undefined
            }
          />
          <OoTypeIcon
            ooType={
              augmentedData?.originatingOracleType as OracleTypeT | undefined
            }
          />
          <IdentifierPill>
            <span>{decodedIdentifier}</span>
          </IdentifierPill>
        </RequestInfoIcons>

        <PanelSectionTitle>
          <IconWrapper>
            <DescriptionIcon />
          </IconWrapper>{" "}
          Description{" "}
          {polymarketLink && (
            <a
              className="ml-auto inline-flex h-[35px] place-items-center gap-2 rounded-md border border-transparent px-2 py-1 text-sm font-normal transition-colors hover:border-grey-500 hover:underline"
              rel="noreferrer"
              target="_blank"
              href={polymarketLink}
            >
              <PolymarketIcon className="h-4 w-4" />
              See on Polymarket
              <ExternalLinkIcon />
            </a>
          )}
        </PanelSectionTitle>
        <DecodedTextAsMarkdown>{description}</DecodedTextAsMarkdown>
        {bulletins && bulletins.length > 0 && (
          <BulletinList bulletins={bulletins} />
        )}
      </SectionWrapper>
      {isClaim && (
        <SectionWrapper>
          <PanelSectionTitle>
            <IconWrapper>
              <AncillaryDataIcon />
            </IconWrapper>{" "}
            Assertion Claim{" "}
            <ToggleText onClick={toggleShowRawClaimData}>
              (view {showRawClaimData ? "decoded" : "raw"})
            </ToggleText>
          </PanelSectionTitle>
          <DecodedTextAsMarkdown>
            {showRawClaimData ? claim : claimDescription}
          </DecodedTextAsMarkdown>
        </SectionWrapper>
      )}
      {showAncillaryData && (
        <SectionWrapper>
          <PanelSectionTitle>
            <IconWrapper>
              <AncillaryDataIcon />
            </IconWrapper>{" "}
            Ancillary Data
          </PanelSectionTitle>
          <div style={{ marginBottom: "10px" }}>
            <ToggleText
              onClick={toggleShowDecodedAncillaryData}
              style={{
                marginRight: "15px",
                textDecoration: showDecodedAncillaryData ? "underline" : "none",
              }}
            >
              View Decoded
            </ToggleText>
            <ToggleText
              onClick={toggleShowRawAncillaryData}
              style={{
                textDecoration: showRawAncillaryData ? "underline" : "none",
              }}
            >
              View Raw
            </ToggleText>
          </div>
          {showDecodedAncillaryData && (
            <Pre>
              {decodedAncillaryData === ""
                ? "The ancillary data for this request is blank."
                : decodedAncillaryData}
            </Pre>
          )}
          {showRawAncillaryData && <Pre>{ancillaryData}</Pre>}
        </SectionWrapper>
      )}
      {isOptimisticGovernorVote && ipfs && (
        <SectionWrapper>
          <PanelSectionTitle>
            <IconWrapper>
              <DescriptionIcon />
            </IconWrapper>{" "}
            Additional Text Data
          </PanelSectionTitle>
          <Text className="ml-2">
            <PanelSectionSubTitle>Proposal</PanelSectionSubTitle>
            <Button
              href={`https://snapshot.org/#/${ipfs.data.message.space}/proposal/${ipfs.hash}`}
              label={ipfs.data.message.title}
            />
            {explanationText && (
              <>
                <PanelSectionSubTitle className="mt-2">
                  Explanation
                </PanelSectionSubTitle>
                <Button
                  href={`https://ipfs.io/ipfs/${explanationText}`}
                  label={explanationText}
                />
              </>
            )}
            {rules && (
              <>
                <PanelSectionSubTitle className="mt-2">
                  Rules
                </PanelSectionSubTitle>
                {rules}
              </>
            )}
          </Text>
        </SectionWrapper>
      )}
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
                      <A
                        href={`https://etherscan.io/address/${to}`}
                        target="_blank"
                      >
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
          Proposal Timestamp
        </PanelSectionTitle>
        <Timestamp>
          <span>UTC</span> <span>{timeAsDate.toUTCString()}</span>
        </Timestamp>
        <Timestamp>
          <span>UNIX</span> <span>{time}</span>
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
    </PanelContentWrapper>
  );
}

function DecodedTextAsMarkdown({ children }: { children: string }) {
  // Check if text already contains markdown links
  const hasMarkdownLinks = /\[([^\]]+)\]\(([^)]+)\)/.test(children);

  // Only convert plain text URLs if no markdown links are present
  const processedText = hasMarkdownLinks
    ? children
    : (() => {
        // Convert plain text URLs to markdown links
        // Match URLs but handle punctuation at the end properly
        const urlRegex = /https?:\/\/[^\s]+/g;
        return children.replace(urlRegex, (fullMatch) => {
          // Check if this URL is already part of a markdown link
          const matchIndex = children.indexOf(fullMatch);
          const beforeUrl = children.substring(0, matchIndex);
          const afterUrl = children.substring(matchIndex + fullMatch.length);

          // If URL is preceded by ]( and followed by ), it's already markdown
          if (beforeUrl.endsWith("](") && afterUrl.startsWith(")")) {
            return fullMatch; // Don't modify
          }

          // Remove trailing punctuation that's likely not part of the URL
          let cleanUrl = fullMatch;
          const trailingPunctuation = /[.,;:!?)\]]+$/;
          const trailingMatch = cleanUrl.match(trailingPunctuation);

          if (trailingMatch) {
            // Special case: if URL ends with ) but doesn't have matching (, keep the )
            const hasOpenParen = cleanUrl.includes("(");
            if (trailingMatch[0] === ")" && hasOpenParen) {
              // Keep the ) as it's part of the URL
            } else {
              // Remove trailing punctuation
              cleanUrl = cleanUrl.replace(trailingPunctuation, "");
            }
          }

          return `[${cleanUrl}](${cleanUrl})${fullMatch.substring(
            cleanUrl.length
          )}`;
        });
      })();

  return (
    <Text as="div">
      <ReactMarkdown
        components={{
          a: (props) => <A {...props} target="_blank" />,
          p: (props) => <p style={{ marginBottom: "1em" }}>{props.children}</p>,
        }}
      >
        {processedText}
      </ReactMarkdown>
    </Text>
  );
}

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
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
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
  margin-bottom: 20px;
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

const RequestInfoIcons = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: start;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const IdentifierPill = styled.div`
  height: 35px;
  width: max-content;
  display: flex;
  align-items: center;
  padding-inline: 10px;
  padding-block: 8px;
  border: 1px solid var(--grey-100);
  border-radius: 5px;
  font: var(--text-sm);
  font-family: monospace;
`;
