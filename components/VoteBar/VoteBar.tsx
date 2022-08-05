import { Button } from "components/Button";
import { Dropdown } from "components/Dropdown";
import { useState } from "react";
import styled, { CSSProperties } from "styled-components";
import { DropdownItemT, VoteT } from "types/global";
import UMA from "public/assets/icons/uma.svg";
import Polymarket from "public/assets/icons/polymarket.svg";
import Dot from "public/assets/icons/dot.svg";
import { green, red500 } from "constants/colors";
import { TextInput } from "components/Input";
import { useWalletContext } from "hooks/useWalletContext";

interface Props {
  vote: VoteT;
  moreDetailsAction: () => void;
}
export function VoteBar({ vote, moreDetailsAction }: Props) {
  const [selectedVote, setSelectedVote] = useState<DropdownItemT | null>(null);
  const [textVote, setTextVote] = useState("");
  const { signer } = useWalletContext();

  const { title, origin, options, isCommitted, isGovernance } = vote;
  const isPolymarket = origin === "Polymarket";
  const isDropdown = isPolymarket || isGovernance;
  const Icon = origin === "UMA" ? UMAIcon : PolymarketIcon;
  const dotColor = isCommitted ? green : red500;

  return (
    <Wrapper>
      <Dispute>
        <DisputeIconWrapper>
          <Icon />
        </DisputeIconWrapper>
        <DisputeDetailsWrapper>
          <DisputeTitle>{title}</DisputeTitle>
          <DisputeOrigin>{origin}</DisputeOrigin>
        </DisputeDetailsWrapper>
      </Dispute>
      <Vote>
        {isDropdown ? (
          <Dropdown
            label="Choose answer"
            items={options}
            selected={selectedVote}
            onSelect={(vote) => setSelectedVote(vote)}
          />
        ) : (
          <TextInput value={textVote} onChange={(e) => setTextVote(e.target.value)} disabled={!signer} />
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
        {isCommitted ? "Committed" : "Not committed"}
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
