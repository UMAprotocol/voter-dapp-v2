import { mobileAndUnder, tabletAndUnder } from "constant";
import Warning from "public/assets/icons/warning.svg";
import styled from "styled-components";

export const VotesTableWrapper = styled.div`
  flex: 1;
  margin-top: var(--margin-top, 35px);
  overflow-anchor: none;
`;

export const Title = styled.h1`
  font: var(--header-md);
  margin-bottom: 20px;
`;

// Sticks to the bottom of the viewport while the vote list scrolls, then
// docks below the list. Long rounds push the commit/reveal button far down.
// The border image paints the background and top shadow edge to edge without
// widening the box, so the content stays aligned with the list and the page
// never scrolls sideways. The negative bottom margin cancels the page's 45px
// bottom padding, so the docked bar sits flush on the white footer. The line
// below the box only shows when docked; while stuck it sits off screen.
export const ButtonOuterWrapper = styled.div`
  position: sticky;
  bottom: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 15px 30px;
  margin-top: 30px;
  margin-bottom: -45px;
  padding-block: 15px calc(15px + env(safe-area-inset-bottom));
  border-image: linear-gradient(
      transparent,
      hsla(280, 4%, 15%, 0.04) 8px,
      var(--black-opacity-25) 8px 9px,
      var(--white) 9px
    )
    fill 0 / 0 / 8px 100vw 0;

  /* keep focused rows and inputs clear of the bar when the browser scrolls
     them into view */
  html:has(&) {
    scroll-padding-bottom: 160px;
  }

  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--grey-100);
  }

  @media ${tabletAndUnder} {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    padding-block: 10px calc(10px + env(safe-area-inset-bottom));
  }
`;

export const ActionInfo = styled.div`
  display: grid;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

export const ButtonInnerWrapper = styled.div`
  display: flex;
  justify-content: end;
  gap: 15px;
  margin-left: auto;

  button {
    text-transform: capitalize;
  }

  @media ${tabletAndUnder} {
    gap: 10px;
    margin-left: 0;

    > * {
      flex: 1;
      min-width: 0;
    }

    button {
      width: 100%;
      height: 44px;
      font-size: 16px;
    }
  }
`;

export const InfoText = styled.p`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font: var(--text-md);

  > :first-child {
    flex: none;
  }

  @media ${tabletAndUnder} {
    font: var(--text-sm);
  }
`;

export const HideOnMobile = styled.span`
  @media ${mobileAndUnder} {
    display: none;
  }
`;

export const WarningIcon = styled(Warning)`
  path {
    stroke: var(--black);
    fill: transparent;
  }
`;

export const RecommittingVotesMessage = styled.p`
  font: var(--text-sm);
`;
