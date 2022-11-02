import { Button } from "components";
import { formatDistanceToNowStrict } from "date-fns";
import { BigNumber } from "ethers";
import { formatNumberForDisplay } from "helpers";
import Time from "public/assets/icons/time.svg";
import styled from "styled-components";

interface Props {
  cooldownEnds: Date | null | undefined;
  pendingUnstake: BigNumber | undefined;
  canClaim: boolean;
  onClaim: () => void;
}
export function CooldownTimer({
  cooldownEnds,
  pendingUnstake,
  canClaim,
  onClaim,
}: Props) {
  const formattedCooldownEnds =
    cooldownEnds && formatDistanceToNowStrict(cooldownEnds);
  const cooldownDescription = "in cooldown period";
  const claimDescription = "ready to claim";
  const description = canClaim ? claimDescription : cooldownDescription;

  return (
    <Wrapper>
      <IconWrapper>
        <TimeIcon />
      </IconWrapper>
      <AmountDescriptionWrapper>
        <Amount>
          <Strong>{formatNumberForDisplay(pendingUnstake)}</Strong> UMA
        </Amount>{" "}
        <Description>{description}</Description>
      </AmountDescriptionWrapper>
      {canClaim ? (
        <ClaimButtonWrapper>
          <Button
            variant="primary"
            label="Claim tokens"
            onClick={onClaim}
            width={150}
            height={35}
          />
        </ClaimButtonWrapper>
      ) : (
        <TimeRemaining>{formattedCooldownEnds} left</TimeRemaining>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  grid-area: "cooldown";
  width: 100%;
  height: 50px;
  display: flex;
  gap: 15px;
  align-items: center;
  padding-left: 15px;
  padding-right: 20px;
  border-radius: 5px;
  background: var(--white);
  font: var(--text-md);
`;

const AmountDescriptionWrapper = styled.span`
  color: var(--black);
`;

const Amount = styled.span``;

const Description = styled.span``;

const TimeRemaining = styled.div`
  margin-left: auto;
  color: var(--red-500);
`;

const IconWrapper = styled.div`
  width: 14px;
  height: 14px;
`;

const TimeIcon = styled(Time)``;

const ClaimButtonWrapper = styled.div`
  margin-left: auto;
`;

const Strong = styled.strong`
  font-weight: 700;
`;
