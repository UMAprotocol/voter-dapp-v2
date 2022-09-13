import { Button } from "components/Button";
import { Dropdown } from "components/Dropdown";
import { TextInput } from "components/Input";
import { green, red500 } from "constants/colors";
import { ethers } from "ethers";
import { useWalletContext } from "hooks/contexts";
import Dot from "public/assets/icons/dot.svg";
import Polymarket from "public/assets/icons/polymarket.svg";
import UMA from "public/assets/icons/uma.svg";
import styled, { CSSProperties } from "styled-components";
import { ActivityStatusT, VotePhaseT, VoteT } from "types/global";

export interface Props {
  vote: VoteT;
  phase: VotePhaseT;
  selectedVote: string | undefined;
  selectVote: (vote: VoteT, value: string) => void;
  activityStatus: ActivityStatusT;
  moreDetailsAction: () => void;
}
export function VotesTableRow({ vote, phase, selectedVote, selectVote, activityStatus, moreDetailsAction }: Props) {
  const { signer } = useWalletContext();

  const { title, origin, options, isCommitted, isRevealed, decryptedVote, correctVote } = vote;
  const Icon = origin === "UMA" ? UMAIcon : PolymarketIcon;

  function formatTitle(title: string) {
    if (title.length <= 45) return title;
    return `${title.substring(0, 45)}...`;
  }

  function getDecryptedVoteAsNumber() {
    return decryptedVote?.price ? Number(ethers.utils.formatEther(decryptedVote.price)) : undefined;
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

  function getExistingOrSelectedVote() {
    return (
      options?.find((option) => {
        const existingVote = getDecryptedVoteAsNumber();
        const valueAsNumber = Number(option.value);

        // prefer showing the selected vote if it exists
        if (selectedVote !== undefined) {
          const selectedVoteAsNumber = Number(selectedVote);
          return valueAsNumber === selectedVoteAsNumber;
        }

        if (existingVote !== undefined) {
          return valueAsNumber === existingVote;
        }

        return false;
      }) ?? null
    );
  }

  function getYourVote() {
    if (!decryptedVote) return "Did not vote";
    return findVoteInOptions(getDecryptedVoteAsNumber())?.label ?? decryptedVote?.price?.toString();
  }

  function getCorrectVote() {
    return findVoteInOptions(correctVote)?.label ?? correctVote?.toString();
  }

  function findVoteInOptions(valueAsNumber: number | undefined) {
    return options?.find((option) => {
      const optionValueAsNumber = Number(option.value);
      return optionValueAsNumber === valueAsNumber;
    });
  }

  function getCommittedOrRevealed() {
    if (phase === "commit") {
      return isCommitted ? "Committed" : "Not committed";
    } else {
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

  if (activityStatus === undefined) return null;

  return (
    <Wrapper>
      <VoteTitleOuterWrapper>
        <VoteTitleWrapper>
          <VoteIconWrapper>
            <Icon />
          </VoteIconWrapper>
          <VoteDetailsWrapper>
            <VoteTitle>{formatTitle(title)}</VoteTitle>
            <VoteOrigin>{origin}</VoteOrigin>
          </VoteDetailsWrapper>
        </VoteTitleWrapper>
      </VoteTitleOuterWrapper>
      {showVoteInput() ? (
        <VoteInput>
          {options ? (
            <Dropdown
              label="Choose answer"
              items={options}
              selected={getExistingOrSelectedVote()}
              onSelect={(option) => selectVote(vote, option.value.toString())}
            />
          ) : (
            <TextInput
              value={selectedVote ?? undefined}
              onChange={(e) => selectVote(vote, e.target.value)}
              disabled={!signer}
            />
          )}
        </VoteInput>
      ) : null}
      {showYourVote() ? <YourVote>{getYourVote()}</YourVote> : null}
      {showCorrectVote() ? <CorrectVote>{getCorrectVote()}</CorrectVote> : null}
      {showVoteStatus() ? (
        <VoteStatusWrapper>
          <VoteStatus>
            <DotIcon
              style={
                {
                  "--dot-color": getDotColor(),
                } as CSSProperties
              }
            />{" "}
            {getCommittedOrRevealed()}
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
