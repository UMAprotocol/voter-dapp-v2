import { Button, IconWrapper, Tooltip } from "components";
import { ActionStatus } from "types";
import {
  ButtonInnerWrapper,
  ButtonOuterWrapper,
  ButtonSpacer,
  InfoText,
  WarningIcon,
} from "./style";

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
