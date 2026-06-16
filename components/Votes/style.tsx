import { mobileAndUnder } from "constant";
import Warning from "public/assets/icons/warning.svg";
import styled from "styled-components";

export const ActiveVotesWrapper = styled.div``;

export const VotesTableWrapper = styled.div`
  margin-top: var(--margin-top, 35px);
  overflow-anchor: none;
`;

export const Title = styled.h1`
  font: var(--header-md);
  margin-bottom: 20px;
`;

export const ButtonOuterWrapper = styled.div<{ $stickyOnMobile?: boolean }>`
  margin-top: 30px;

  @media ${mobileAndUnder} {
    ${({ $stickyOnMobile }) =>
      $stickyOnMobile
        ? `
    position: sticky;
    bottom: 0;
    z-index: 5;
    margin-top: 20px;
    padding: 12px var(--page-padding) calc(12px + env(safe-area-inset-bottom));
    background: var(--white);
    border-top: 1px solid var(--black-opacity-25);
    box-shadow: var(--shadow-2);
        `
        : ""}
  }
`;

export const ButtonInnerWrapper = styled.div<{ $stickyOnMobile?: boolean }>`
  display: flex;
  justify-content: end;
  gap: 15px;

  button {
    text-transform: capitalize;
  }

  @media ${mobileAndUnder} {
    ${({ $stickyOnMobile }) =>
      $stickyOnMobile
        ? `
    gap: 12px;

    > * {
      flex: 1;
    }

    button {
      width: 100%;
    }
        `
        : ""}
  }
`;

export const ButtonSpacer = styled.div`
  width: 10px;

  @media ${mobileAndUnder} {
    display: none;
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
