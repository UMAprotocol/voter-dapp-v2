import { Button } from "components/Button";
import { Dropdown } from "components/Dropdown";
import styled, { CSSProperties } from "styled-components";
import { VotePhaseT, VoteT } from "types/global";
import UMA from "public/assets/icons/uma.svg";
import Polymarket from "public/assets/icons/polymarket.svg";
import Dot from "public/assets/icons/dot.svg";
import { green, red500 } from "constants/colors";
import { TextInput } from "components/Input";
import { useWalletContext } from "hooks/useWalletContext";
import { ethers } from "ethers";

interface Props {
  vote: VoteT;
  moreDetailsAction: () => void;
  selectedVote: string;
  selectVote: (vote: VoteT, value: string) => void;
  phase: VotePhaseT;
}
export function VoteBar({ vote, selectedVote, selectVote, phase, moreDetailsAction }: Props) {
  const { signer } = useWalletContext();

  const { title, origin, options, isCommitted, isRevealed, decryptedVote } = vote;
  const Icon = origin === "UMA" ? UMAIcon : PolymarketIcon;
  const dotColor = (phase === "commit" && isCommitted) || (phase === "reveal" && isRevealed) ? green : red500;

  function formatTitle(title: string) {
    if (title.length <= 45) return title;
    return title.substring(0, 45) + "...";
  }

  function getDecryptedVoteAsNumber() {
    return decryptedVote?.price ? Number(ethers.utils.formatEther(decryptedVote.price)) : undefined;
  }

  return (
    <Wrapper>
      <Dispute>
        <DisputeIconWrapper>
          <Icon />
        </DisputeIconWrapper>
        <DisputeDetailsWrapper>
          <DisputeTitle>{formatTitle(title)}</DisputeTitle>
          <DisputeOrigin>{origin}</DisputeOrigin>
        </DisputeDetailsWrapper>
      </Dispute>
      <Vote>
        {phase === "commit" ? (
          options ? (
            <Dropdown
              label="Choose answer"
              items={options}
              selected={
                options.find((option) => {
                  const existingVote = getDecryptedVoteAsNumber();
                  const valueAsNumber = Number(option.value);
                  const selectedVoteAsNumber = Number(selectedVote);
                  return valueAsNumber === selectedVoteAsNumber || valueAsNumber === existingVote;
                }) ?? null
              }
              onSelect={(option) => selectVote(vote, option.value.toString())}
            />
          ) : (
            <TextInput
              value={selectedVote ?? undefined}
              onChange={(e) => selectVote(vote, e.target.value)}
              disabled={!signer}
            />
          )
        ) : (
          <YourVote>{getDecryptedVoteAsNumber()}</YourVote>
        )}
      </Vote>
      <Status>
        <DotIcon
          style={
            {
              "--dot-color": dotColor,
            } as CSSProperties
          }
        />{" "}
        {phase === "commit" ? (isCommitted ? "Committed" : "Not committed") : isRevealed ? "Revealed" : "Not revealed"}
      </Status>
      <MoreDetails>
        <Button label="More details" onClick={moreDetailsAction} />
      </MoreDetails>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  height: 80px;
  display: grid;
  grid-template-columns: 45% auto auto auto;
  align-items: center;
  justify-items: center;
  padding-right: 30px;
  background: var(--white);
`;

const Dispute = styled.div`
  justify-self: start;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: 30px;
`;

const DisputeDetailsWrapper = styled.div``;

const DisputeIconWrapper = styled.div`
  width: 40px;
  height: 40px;
`;

const DisputeTitle = styled.h3`
  font: var(--header-sm);
`;

const DisputeOrigin = styled.h4`
  font: var(--text-xs);
  color: var(--black-opacity-50);
`;

const Vote = styled.div`
  width: 240px;
`;

const YourVote = styled.p`
  font: var(--text-md);
`;

const Status = styled.div`
  width: 144px;
  display: flex;
  align-items: center;
  gap: 10px;
  font: var(--text-md);
`;

const MoreDetails = styled.div`
  justify-self: end;
`;

const UMAIcon = styled(UMA)``;

const PolymarketIcon = styled(Polymarket)``;

const DotIcon = styled(Dot)`
  circle {
    fill: var(--dot-color);
  }
`;
