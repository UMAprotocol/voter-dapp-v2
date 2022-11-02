import { Button, Dropdown, LoadingSkeleton, TextInput, Tooltip } from "components";
import { green, red500 } from "constants/colors";
import { formatVoteStringWithPrecision, getPrecisionForIdentifier } from "helpers";
import { useWalletContext } from "hooks";
import Link from "next/link";
import Dot from "public/assets/icons/dot.svg";
import Polymarket from "public/assets/icons/polymarket.svg";
import Rolled from "public/assets/icons/rolled.svg";
import UMA from "public/assets/icons/uma.svg";
import styled, { CSSProperties } from "styled-components";
import { ActivityStatusT, VotePhaseT, VoteT } from "types";

export interface Props {
  vote: VoteT;
  phase: VotePhaseT;
  selectedVote: string | undefined;
  selectVote: (value: string) => void;
  activityStatus: ActivityStatusT;
  moreDetailsAction: () => void;
  isFetching: boolean;
}
export function VotesTableRow({
  vote,
  phase,
  selectedVote,
  selectVote,
  activityStatus,
  moreDetailsAction,
  isFetching,
}: Props) {
  const { signer } = useWalletContext();

  const {
    decodedIdentifier,
    title,
    origin,
    options,
    isCommitted,
    isRevealed,
    decryptedVote,
    correctVote,
    voteNumber,
    isRolled,
  } = vote;
  const maxDecimals = getPrecisionForIdentifier(decodedIdentifier);
  const Icon = origin === "UMA" ? UMAIcon : PolymarketIcon;

  function formatTitle(title: string) {
    if (title.length <= 45) return title;
    return `${title.substring(0, 45)}...`;
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
    return (activityStatus === "active" && phase === "reveal") || activityStatus === "past";
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
      formatVoteStringWithPrecision(decryptedVote?.price?.toString(), decodedIdentifier)
    );
  }

  function getCorrectVote() {
    if (correctVote === undefined) return;
    const correctVoteAsString = correctVote.toFixed();

    return (
      findVoteInOptions(correctVoteAsString)?.label ??
      formatVoteStringWithPrecision(correctVoteAsString, decodedIdentifier)
    );
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

  return (
    <Wrapper>
      <VoteTitleOuterWrapper>
        <VoteTitleWrapper>
          <VoteIconWrapper>
            <Icon />
          </VoteIconWrapper>
          <VoteDetailsWrapper>
            <VoteTitle>{formatTitle(title)}</VoteTitle>
            <VoteDetailsInnerWrapper>
              {isRolled ? (
                <Tooltip label="This vote was included in the previous voting cycle, but did not get enough votes to resolve.">
                  <RolledWrapper>
                    <RolledIconWrapper>
                      <RolledIcon />
                    </RolledIconWrapper>
                    {/* todo: add link to explanation of rolled votes in the docs once its written */}
                    <Link href="https://docs.umaproject.org" passHref>
                      <RolledLink target="_blank">Rolled</RolledLink>
                    </Link>
                  </RolledWrapper>
                </Tooltip>
              ) : null}
              <VoteOrigin>
                {origin} | Vote #{voteNumber.toString()}
              </VoteOrigin>
            </VoteDetailsInnerWrapper>
          </VoteDetailsWrapper>
        </VoteTitleWrapper>
      </VoteTitleOuterWrapper>
      {showVoteInput() ? (
        <VoteInput>
          {options ? (
            <Dropdown
              label="Choose answer"
              items={options}
              selected={getExistingOrSelectedVoteFromOptions()}
              onSelect={(option) => selectVote(option.value.toString())}
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
        <YourVote>{isFetching ? <LoadingSkeleton width={100} height={22} /> : getYourVote()}</YourVote>
      ) : null}
      {showCorrectVote() ? (
        <CorrectVote>{isFetching ? <LoadingSkeleton width={100} height={22} /> : getCorrectVote()}</CorrectVote>
      ) : null}
      {showVoteStatus() ? (
        <VoteStatusWrapper>
          <VoteStatus>
            {isFetching ? (
              <LoadingSkeleton width={100} height={22} />
            ) : (
              <>
                <DotIcon
                  style={
                    {
                      "--dot-color": getDotColor(),
                    } as CSSProperties
                  }
                />{" "}
                {getCommittedOrRevealed()}
              </>
            )}
          </VoteStatus>
        </VoteStatusWrapper>
      ) : null}
      <MoreDetailsWrapper>
        <MoreDetails>
          <Button label="More details" onClick={moreDetailsAction} />
        </MoreDetails>
      </MoreDetailsWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.tr`
  background: var(--white);
  height: 80px;
`;

const VoteTitleOuterWrapper = styled.td``;

const VoteTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: 30px;
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
`;

const VoteTitle = styled.h3`
  font: var(--header-sm);
`;

const VoteOrigin = styled.h4`
  font: var(--text-xs);
  color: var(--black-opacity-50);
`;

const VoteInput = styled.td``;

const VoteOutputText = styled.td`
  font: var(--text-md);
`;

const YourVote = styled(VoteOutputText)``;

const CorrectVote = styled(VoteOutputText)`
  padding-left: 30px;
`;

const VoteStatusWrapper = styled.td``;

const VoteStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 30px;
  font: var(--text-md);
`;

const MoreDetailsWrapper = styled.td``;

const MoreDetails = styled.div`
  width: fit-content;
  margin-left: auto;
  margin-right: 30px;
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

const RolledLink = styled.a`
  font: var(--text-sm);
  color: var(--red-500);
  text-decoration: underline;
`;
