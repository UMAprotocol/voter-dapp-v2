import { Button } from "components/Button";
import { formatDistanceToNowStrict } from "date-fns";
import Time from "public/assets/icons/time.svg";
import styled from "styled-components";

interface Props {
  timeRemaining: Date | null;
  amount: string;
  canClaim: boolean;
  onClaim: () => void;
}
export function CooldownTimer({ timeRemaining, amount, canClaim, onClaim }: Props) {
  const formattedTimeRemaining = timeRemaining && formatDistanceToNowStrict(timeRemaining);
  const cooldownDescription = "in cooldown period";
  const claimDescription = "ready to claim";
  const description = canClaim ? claimDescription : cooldownDescription;

  return (
    <Wrapper>
      <TimeIcon />
      <AmountDescriptionWrapper>
        <Amount>
          <strong>{amount}</strong> UMA
        </Amount>{" "}
        <Description>{description}</Description>
      </AmountDescriptionWrapper>
      {canClaim ? (
        <ClaimButtonWrapper>
          <Button variant="primary" label="Claim tokens" onClick={onClaim} width={150} height={35} />
        </ClaimButtonWrapper>
      ) : (
        <TimeRemaining>{formattedTimeRemaining} left</TimeRemaining>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  height: 50px;
  display: flex;
  gap: 15px;
  align-items: center;
  margin-inline: 30px;
  padding-left: 15px;
  padding-right: 20px;
  border-radius: 5px;
  background: var(--white);
  font: var(--text-md);
`;

const AmountDescriptionWrapper = styled.span``;

const Amount = styled.span``;

const Description = styled.span``;

const TimeRemaining = styled.div`
  margin-left: auto;
  color: var(--red);
`;

const TimeIcon = styled(Time)``;

const ClaimButtonWrapper = styled.div`
  margin-left: auto;
`;
