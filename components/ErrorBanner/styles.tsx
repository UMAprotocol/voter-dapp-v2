import { mobileAndUnder, tabletAndUnder } from "constant";
import Close from "public/assets/icons/close.svg";
import Warning from "public/assets/icons/warning.svg";
import styled from "styled-components";

export const Wrapper = styled.div`
  background: var(--red-500);
  min-height: 60px;
  max-width: 100vw;
  color: var(--white);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-block: 15px;
`;

export const ErrorMessageWrapper = styled.div`
  width: 100%;
  max-width: var(--page-width);
  padding-inline: var(--page-padding);
  position: relative;
  display: flex;
  align-items: center;
  gap: 5px;
  padding-block: 5px;
  &:not(:last-child) {
    margin-bottom: 5px;
  }

  @media ${tabletAndUnder} {
    padding-inline: 0;
  }
`;

export const ErrorMessage = styled.p`
  font: var(--text-md);

  @media ${mobileAndUnder} {
    font: var(--text-xs);
  }
`;

export const IconWrapper = styled.div`
  width: 15px;
  height: 15px;
`;

export const CloseIcon = styled(Close)`
  path {
    fill: var(--white);
  }
`;

export const WarningIcon = styled(Warning)``;

export const CloseButton = styled.button`
  --icon-height: 15px;
  --icon-offset: 12px;
  --icon-start-right: var(--page-padding);
  --right: calc(var(--icon-start-right) + var(--icon-offset));
  position: absolute;
  top: calc(var(--height) - var(--icon-height) / 2px);
  right: var(--right);
  fill: var(--white);
  background: transparent;

  @media ${tabletAndUnder} {
    --icon-start-right: 0px;
  }
`;
