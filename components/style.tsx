import { tabletAndUnder } from "constant";
import styled from "styled-components";

export const PageOuterWrapper = styled.div`
  background: var(--grey-100);
  min-height: var(--full-height);
`;

export const PageInnerWrapper = styled.div`
  max-width: var(--page-width);
  padding-inline: var(--page-padding);
  padding-block: 45px;
  margin-inline: auto;

  @media ${tabletAndUnder} {
    padding-inline: 0;
    padding-block: 10px;
  }
`;

export const Strong = styled.strong`
  color: var(--red-500);
`;

export const LoadingSpinnerWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding-top: 30px;
  display: grid;
  place-items: center;
`;
