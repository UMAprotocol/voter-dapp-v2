import { Button } from "components";
import { formatDistanceToNowStrict } from "date-fns";
import { BigNumber } from "ethers";
import { formatNumberForDisplay } from "helpers";
import Time from "public/assets/icons/time.svg";
import styled from "styled-components";

interface Props {
  cooldownEnds: Date | null | undefined;
  pendingUnstake: BigNumber | undefined;
  isReadyToUnstake: boolean;
  onExecuteUnstake: () => void;
}
export function CooldownTimer({
  cooldownEnds,
  pendingUnstake,
  isReadyToUnstake,
  onExecuteUnstake,
}: Props) {
  const formattedCooldownEnds =
    cooldownEnds && formatDistanceToNowStrict(cooldownEnds);
  const cooldownDescription = "being unstaked";
  const unstakeDescription = "ready to claim";
  const description = isReadyToUnstake
    ? unstakeDescription
    : cooldownDescription;

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
      {isReadyToUnstake ? (
        <UnstakeButtonWrapper>
          <Button
            variant="primary"
            label="Claim tokens"
            onClick={onExecuteUnstake}
            width={150}
            height={35}
          />
        </UnstakeButtonWrapper>
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

const UnstakeButtonWrapper = styled.div`
  margin-left: auto;
`;

const Strong = styled.strong`
  font-weight: 700;
`;
