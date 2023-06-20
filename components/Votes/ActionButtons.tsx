import { Button, IconWrapper, Tooltip } from "components";
import Warning from "public/assets/icons/warning.svg";
import styled from "styled-components";
import { ActionStatus } from "types";
interface Props {
  actionStatus: ActionStatus;
  isAnyDirty: boolean;
  resetSelectedVotes: () => void;
}
export function ActionButtons({
  actionStatus: { infoText, hidden, tooltip, ...buttonProps },
  isAnyDirty,
  resetSelectedVotes,
}: Props) {
  const hasInfoText = !!infoText;
  const hasButtonTooltip = !!tooltip;
  const showPrimaryButton = !hidden;

  const infoTextTooltip = (
    <Tooltip label={infoText?.tooltip}>
      <InfoText>
        <IconWrapper width={20} height={20}>
          <WarningIcon />
        </IconWrapper>
        {infoText?.label}
      </InfoText>
    </Tooltip>
  );

  const primaryButton = hasButtonTooltip ? (
    <Tooltip label={tooltip}>
      <div>
        <Button variant="primary" {...buttonProps} />
      </div>
    </Tooltip>
  ) : (
    <Button variant="primary" {...buttonProps} />
  );

  const resetButton = (
    <>
      <Button
        variant="secondary"
        label="Reset Changes"
        onClick={resetSelectedVotes}
      />
      <ButtonSpacer />
    </>
  );

  return (
    <ButtonOuterWrapper>
      {hasInfoText && infoTextTooltip}
      <ButtonInnerWrapper>
        {isAnyDirty && resetButton}
        {showPrimaryButton && primaryButton}
      </ButtonInnerWrapper>
    </ButtonOuterWrapper>
  );
}

export const VoteListWrapper = styled.div`
  margin-top: var(--margin-top, 35px);
`;

export const Title = styled.h1`
  font: var(--header-md);
  margin-bottom: 20px;
`;

export const ButtonOuterWrapper = styled.div`
  margin-top: 30px;
`;

export const ButtonInnerWrapper = styled.div`
  display: flex;
  justify-content: end;
  gap: 15px;

  button {
    text-transform: capitalize;
  }
`;

export const InfoText = styled.p`
  display: flex;
  gap: 15px;
  width: fit-content;
  margin-left: auto;
  margin-bottom: 15px;
  font: var(--text-md);
`;

export const WarningIcon = styled(Warning)`
  path {
    stroke: var(--black);
    fill: transparent;
  }
`;

export const PaginationWrapper = styled.div`
  margin-block: 30px;
`;

export const ButtonSpacer = styled.div`
  width: 10px;
`;

export const Divider = styled.div`
  height: 1px;
  margin-top: 45px;
  margin-bottom: 45px;
  background: var(--black-opacity-25);
`;

export const RecommittingVotesMessage = styled.p`
  width: fit-content;
  font: var(--text-sm);
  margin-left: auto;
  margin-top: 10px;
`;
