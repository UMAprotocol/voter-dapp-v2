"use client";

import { tabletAndUnder } from "constant";
import styled, { CSSProperties } from "styled-components";
import { useIsClient, useLocalStorage } from "usehooks-ts";
import { IconWrapper } from "components";
import Close from "public/assets/icons/close.svg";

interface AnnouncementBannerProps {
  children: React.ReactNode;
  localStorageKey: string;
  style?: CSSProperties;
}

export function AnnouncementBannerWrapper({
  children,
  localStorageKey,
  style,
}: AnnouncementBannerProps) {
  const [show, setShow] = useLocalStorage(localStorageKey, true);
  const isClient = useIsClient();

  if (!isClient || !show) return null;

  function close() {
    setShow(false);
  }

  return (
    <OuterWrapper style={style}>
      <InnerWrapper>
        {children}
        <CloseButton onClick={close}>
          <IconWrapper>
            <CloseIcon />
          </IconWrapper>
        </CloseButton>
      </InnerWrapper>
    </OuterWrapper>
  );
}

const OuterWrapper = styled.div`
  --height: 60px;
  height: var(--height);
  background: var(--black);
  display: grid;
  align-items: center;
  transition: height 0.2s;
  overflow: hidden;
`;

const InnerWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: var(--page-width);
  padding-inline: var(--page-padding);
  margin-inline: auto;
  gap: var(--page-padding);

  @media ${tabletAndUnder} {
    padding-inline: 0;
  }
`;

const CloseIcon = styled(Close)`
  path {
    fill: var(--white);
  }
`;

const CloseButton = styled.button`
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
