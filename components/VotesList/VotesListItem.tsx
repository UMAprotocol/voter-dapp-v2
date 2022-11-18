import {
  Button,
  Dropdown,
  LoadingSkeleton,
  TextInput,
  Tooltip,
} from "components";
import { green, grey100, red500, tabletAndUnder, tabletMax } from "constant";
import {
  formatVoteStringWithPrecision,
  getPrecisionForIdentifier,
} from "helpers";
import { useWalletContext, useWindowSize } from "hooks";
import NextLink from "next/link";
import Dot from "public/assets/icons/dot.svg";
import Polymarket from "public/assets/icons/polymarket.svg";
import Rolled from "public/assets/icons/rolled.svg";
import UMA from "public/assets/icons/uma.svg";
import { ReactNode, useEffect, useState } from "react";
import styled, { CSSProperties } from "styled-components";
import { ActivityStatusT, DropdownItemT, VotePhaseT, VoteT } from "types";

export interface Props {
  vote: VoteT;
  phase: VotePhaseT;
  selectedVote: string | undefined;
  selectVote: (value: string) => void;
  activityStatus: ActivityStatusT;
  moreDetailsAction: () => void;
  isFetching: boolean;
}
export function VotesListItem({
  vote,
  phase,
  selectedVote,
  selectVote,
  activityStatus,
  moreDetailsAction,
  isFetching,
}: Props) {
  const { signer } = useWalletContext();
  const { width } = useWindowSize();
  const [isCustomInput, setIsCustomInput] = useState(false);
  const {
    decodedIdentifier,
    title,
    origin,
    options,
    isCommitted,
    commitHash,
    isRevealed,
    revealHash,
    decryptedVote,
    correctVote,
    voteNumber,
    isRolled,
    isV1,
  } = vote;
  const maxDecimals = getPrecisionForIdentifier(decodedIdentifier);
  const Icon = origin === "UMA" ? UMAIcon : PolymarketIcon;
  const isTabletAndUnder = width && width <= tabletMax;

  useEffect(() => {
    if (!options) return;

    // if options exist but the existing decrypted vote is not one from the list,
    // then we must be using a custom input
    const decryptedVote = getDecryptedVoteAsFormattedString();
    if (decryptedVote && !findVoteInOptions(decryptedVote)) {
      setIsCustomInput(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, decryptedVote]);

  function onSelectVote(option: DropdownItemT) {
    if (option.value === "custom") {
      setIsCustomInput(true);
    } else {
      selectVote(option.value.toString());
    }
  }

  function getDecryptedVoteAsFormattedString() {
    return decryptedVote?.price !== undefined
      ? formatVoteStringWithPrecision(decryptedVote.price, decodedIdentifier)
      : undefined;
  }

  function getDecryptedVoteAsString() {
    return getDecryptedVoteAsNumber()?.toString();
  }

  function getDecryptedVoteAsNumber() {
    const formattedString = getDecryptedVoteAsFormattedString();
    return formattedString ? Number(formattedString) : undefined;
  }

  function showVoteInput() {
    return activityStatus === "active" && phase === "commit";
  }

  function showYourVote() {
    return (
      (activityStatus === "active" && phase === "reveal") ||
      activityStatus === "past"
    );
  }

  function showCorrectVote() {
    return activityStatus === "past" && correctVote !== undefined;
  }

  function showVoteStatus() {
    return activityStatus === "active";
  }

  function getExistingOrSelectedVoteFromOptions() {
    return options?.find((option) => {
      const existingVote = getDecryptedVoteAsFormattedString();

      // prefer showing the selected vote if it exists
      if (selectedVote !== undefined) {
        return option.value === selectedVote;
      }

      if (existingVote !== undefined) {
        return option.value === existingVote;
      }
    });
  }

  function getYourVote() {
    if (!decryptedVote) return "Did not vote";
    return (
      findVoteInOptions(getDecryptedVoteAsFormattedString())?.label ??
      formatVoteStringWithPrecision(
        decryptedVote?.price?.toString(),
        decodedIdentifier
      )
    );
  }

  function getCorrectVote() {
    if (correctVote === undefined) return;
    const correctVoteAsString = correctVote.toFixed();
    const formatted = formatVoteStringWithPrecision(
      correctVoteAsString,
      decodedIdentifier
    );

    return findVoteInOptions(formatted)?.label ?? formatted;
  }

  function findVoteInOptions(value: string | undefined) {
    return options?.find((option) => {
      return option.value === value;
    });
  }

  function getCommittedOrRevealed() {
    if (phase === "commit") {
      return isCommitted ? "Committed" : "Not committed";
    } else {
      if (!decryptedVote) return "Not committed";
      return isRevealed ? "Revealed" : "Not revealed";
    }
  }

  function getDotColor() {
    if (phase === "commit") {
      return isCommitted ? green : red500;
    } else {
      return isRevealed ? green : red500;
    }
  }

  function getBorderColor() {
    if (activityStatus === "past" || phase === "reveal") return grey100;
    return "transparent";
  }

  function getRelevantTransactionLink(): ReactNode | string {
    if (phase === "commit") {
      return commitHash ? (
        <Link href={`https://goerli.etherscan.io/tx/${commitHash}`}>
          {getCommittedOrRevealed()}
        </Link>
      ) : (
        getCommittedOrRevealed()
      );
    }
    return revealHash ? (
      <Link href={`https://goerli.etherscan.io/tx/${revealHash}`}>
        {getCommittedOrRevealed()}
      </Link>
    ) : (
      getCommittedOrRevealed()
    );
  }

  function formatTitle(title: string) {
    if (title.length <= 45) return title;
    return `${title.substring(0, 45)}...`;
  }

  return (
    <Wrapper as={isTabletAndUnder ? "div" : "tr"}>
      <VoteTitleOuterWrapper as={isTabletAndUnder ? "div" : "td"}>
        <VoteTitleWrapper
          style={
            {
              "--border-color": getBorderColor(),
            } as CSSProperties
          }
        >
          <VoteIconWrapper>
            <Icon />
          </VoteIconWrapper>
          <VoteDetailsWrapper>
            <VoteTitle>{formatTitle(title)}</VoteTitle>
            <VoteDetailsInnerWrapper>
              {isRolled && !isV1 ? (
                <Tooltip label="This vote was included in the previous voting cycle, but did not get enough votes to resolve.">
                  <RolledWrapper>
                    <RolledIconWrapper>
                      <RolledIcon />
                    </RolledIconWrapper>
                    {/* todo: add link to explanation of rolled votes in the docs once its written */}
                    <RolledLink
                      href="https://docs.umaproject.org"
                      target="_blank"
                    >
                      Rolled
                    </RolledLink>
                  </RolledWrapper>
                </Tooltip>
              ) : null}
              <VoteOrigin>
                {origin}{" "}
                {!isV1 && voteNumber && `| Vote #${voteNumber.toString()}`}
              </VoteOrigin>
            </VoteDetailsInnerWrapper>
          </VoteDetailsWrapper>
        </VoteTitleWrapper>
      </VoteTitleOuterWrapper>
      {showVoteInput() ? (
        <VoteInput as={isTabletAndUnder ? "div" : "td"}>
          {options && !isCustomInput ? (
            <Dropdown
              label="Choose answer"
              items={options}
              selected={getExistingOrSelectedVoteFromOptions()}
              onSelect={onSelectVote}
            />
          ) : (
            <TextInput
              value={selectedVote ?? getDecryptedVoteAsString() ?? ""}
              onInput={selectVote}
              maxDecimals={maxDecimals}
              type="number"
              disabled={!signer}
            />
          )}
        </VoteInput>
      ) : null}
      {showYourVote() ? (
        <YourVote as={isTabletAndUnder ? "div" : "td"}>
          <VoteLabel>Your vote</VoteLabel>{" "}
          <LoadingSkeleton isLoading={isFetching} width={100}>
            <VoteText voteText={getYourVote()} />
          </LoadingSkeleton>
        </YourVote>
      ) : null}
      {showCorrectVote() ? (
        <CorrectVote as={isTabletAndUnder ? "div" : "td"}>
          <VoteLabel>Correct vote</VoteLabel>{" "}
          <LoadingSkeleton isLoading={isFetching} width={100}>
            <VoteText voteText={getCorrectVote()} />
          </LoadingSkeleton>
        </CorrectVote>
      ) : null}
      {showVoteStatus() ? (
        <VoteStatusWrapper as={isTabletAndUnder ? "div" : "td"}>
          <VoteLabel>Vote status</VoteLabel>
          <VoteStatus>
            <LoadingSkeleton isLoading={isFetching} width={100} height={24}>
              <>
                <DotIcon
                  style={
                    {
                      "--dot-color": getDotColor(),
                    } as CSSProperties
                  }
                />{" "}
                {getRelevantTransactionLink()}
              </>
            </LoadingSkeleton>
          </VoteStatus>
        </VoteStatusWrapper>
      ) : null}
      <MoreDetailsWrapper
        as={isTabletAndUnder ? "div" : "td"}
        style={
          {
            "--border-color": getBorderColor(),
          } as CSSProperties
        }
      >
        <MoreDetails>
          <Button label="More details" onClick={moreDetailsAction} />
        </MoreDetails>
      </MoreDetailsWrapper>
    </Wrapper>
  );
}

function VoteText({ voteText }: { voteText: string | undefined }) {
  if (!voteText) return <></>;

  const maxVoteTextLength = 15;
  if (voteText.length > maxVoteTextLength) {
    return (
      <Tooltip label={voteText}>
        <VoteTextWrapper>
          {voteText.slice(0, maxVoteTextLength)}...
        </VoteTextWrapper>
      </Tooltip>
    );
  }

  return <span>{voteText}</span>;
}

const VoteTextWrapper = styled.span`
  text-decoration: underline;
  cursor: pointer;
`;

const Wrapper = styled.tr`
  background: var(--white);
  height: 80px;

  @media ${tabletAndUnder} {
    height: auto;
    display: grid;
    gap: 12px;
    align-items: left;
    padding: 15px;
    border-radius: 5px;
  }
`;

const VoteTitleOuterWrapper = styled.td`
  width: 100%;
`;

const VoteTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: 30px;

  @media ${tabletAndUnder} {
    margin-left: 0;
    padding-bottom: 5px;
    border-bottom: 1px solid var(--border-color);
  }
`;

const VoteDetailsWrapper = styled.div``;

const VoteDetailsInnerWrapper = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
`;

const VoteIconWrapper = styled.div`
  width: 40px;
  height: 40px;

  @media ${tabletAndUnder} {
    display: none;
  }
`;

const VoteTitle = styled.h3`
  font: var(--header-sm);

  @media ${tabletAndUnder} {
    margin-bottom: 5px;
  }
`;

const VoteOrigin = styled.h4`
  font: var(--text-xs);
  color: var(--black-opacity-50);
`;

const VoteInput = styled.td``;

const VoteOutputText = styled.td`
  font: var(--text-md);

  @media ${tabletAndUnder} {
    display: flex;
    justify-content: space-between;
  }
`;

const YourVote = styled(VoteOutputText)``;

const CorrectVote = styled(VoteOutputText)`
  padding-left: 30px;

  @media ${tabletAndUnder} {
    padding-left: 0;
  }
`;

const VoteLabel = styled.span`
  display: none;

  @media ${tabletAndUnder} {
    display: inline;
  }
`;

const VoteStatusWrapper = styled.td`
  font: var(--text-md);

  @media ${tabletAndUnder} {
    display: flex;
    justify-content: space-between;
  }
`;

const VoteStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 30px;

  @media ${tabletAndUnder} {
    margin-left: 0;
  }
`;

const MoreDetailsWrapper = styled.td`
  @media ${tabletAndUnder} {
    padding-top: 10px;
    border-top: 1px solid var(--border-color);
  }
`;

const MoreDetails = styled.div`
  width: fit-content;
  margin-left: auto;
  margin-right: 30px;

  @media ${tabletAndUnder} {
    margin-left: unset;
    margin-right: auto;
  }
`;

const UMAIcon = styled(UMA)``;

const PolymarketIcon = styled(Polymarket)``;

const DotIcon = styled(Dot)`
  circle {
    fill: var(--dot-color);
  }
`;

const RolledWrapper = styled.div`
  display: flex;
  align-items: baseline;
  gap: 5px;
`;

const RolledIconWrapper = styled.div`
  width: 7px;
  height: 7px;
`;

const RolledIcon = styled(Rolled)``;

const RolledLink = styled(NextLink)`
  font: var(--text-sm);
  color: var(--red-500);
  text-decoration: underline;
`;

const Link = styled(NextLink)`
  font: var(--text-md);
  color: var(--black);
  text-decoration: underline;
  &:hover {
    color: var(--black-opacity-50);
  }
`;
