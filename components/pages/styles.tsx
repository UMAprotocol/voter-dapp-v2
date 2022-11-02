import { mobileAndUnder } from "constants/breakpoints";
import styled from "styled-components";

export const PageOuterWrapper = styled.div`
  background: var(--grey-100);
  min-height: var(--full-height);
`;

export const PageInnerWrapper = styled.div`
  max-width: var(--page-width);
  padding-inline: 45px;
  padding-block: 45px;
  margin-inline: auto;
  @media ${mobileAndUnder} {
    max-width: var(--mobile-page-width);
    padding: 0;
  }
`;

export const Strong = styled.strong`
  color: var(--red-500);
`;

export const LoadingSpinnerWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding-top: 50px;
  display: grid;
  place-items: center;
`;
