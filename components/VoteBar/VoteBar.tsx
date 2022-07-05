import { Button } from "components/Button";
import { Dropdown } from "components/Dropdown";
import { useState } from "react";
import styled from "styled-components";
import { DisputeOriginT, DisputeT, DropdownItemT } from "types/global";
import UMA from "public/assets/icons/uma.svg";
import Polymarket from "public/assets/icons/polymarket.svg";

interface Props {
  dispute: DisputeT;
  voteOptions: DropdownItemT[];
  isCommitted: boolean;
  moreDetailsAction: () => void;
}
export function VoteBar({ dispute, voteOptions, isCommitted, moreDetailsAction }: Props) {
  const [vote, setVote] = useState<DropdownItemT | null>(null);

  const Icon = dispute.origin === DisputeOriginT.UMA ? UMAIcon : PolymarketIcon;

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
        <Dropdown label="Choose answer" items={voteOptions} selected={vote} onSelect={(vote) => setVote(vote)} />
      </Vote>
      <Status>{isCommitted ? "Committed" : "Not committed"}</Status>
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
`;

const Dispute = styled.div`
  justify-self: start;
`;

const DisputeDetailsWrapper = styled.div``;

const DisputeIconWrapper = styled.div``;

const DisputeTitle = styled.h3``;

const DisputeOrigin = styled.h4``;

const Vote = styled.div`
  width: 240px;
`;

const Status = styled.div``;

const MoreDetails = styled.div``;

const UMAIcon = styled(UMA)``;

const PolymarketIcon = styled(Polymarket)``;
