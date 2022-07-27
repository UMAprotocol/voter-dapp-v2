import { Button } from "components/Button";
import { Dropdown } from "components/Dropdown";
import { useState } from "react";
import styled, { CSSProperties } from "styled-components";
import { DisputeOrigins, DropdownItemT, VoteT } from "types/global";
import UMA from "public/assets/icons/uma.svg";
import Polymarket from "public/assets/icons/polymarket.svg";
import Dot from "public/assets/icons/dot.svg";
import { green, red500 } from "constants/colors";

interface Props {
  vote: VoteT;
  moreDetailsAction: () => void;
}
export function VoteBar({ vote, moreDetailsAction }: Props) {
  const { dispute, voteOptions, isCommitted } = vote;
  const [selectedVote, setSelectedVote] = useState<DropdownItemT | null>(null);

  const Icon = dispute.origin === DisputeOrigins.UMA ? UMAIcon : PolymarketIcon;

  const dotColor = isCommitted ? green : red500;

  return (
    <Wrapper>
      <Dispute>
        <DisputeIconWrapper>
          <Icon />
        </DisputeIconWrapper>
        <DisputeDetailsWrapper>
          <DisputeTitle>{dispute.title}</DisputeTitle>
          <DisputeOrigin>{dispute.origin}</DisputeOrigin>
        </DisputeDetailsWrapper>
      </Dispute>
      <Vote>
        <Dropdown
          label="Choose answer"
          items={voteOptions}
          selected={selectedVote}
          onSelect={(vote) => setSelectedVote(vote)}
        />
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
