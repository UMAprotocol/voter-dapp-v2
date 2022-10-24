import styled from "styled-components";

export const PageOuterWrapper = styled.div`
  background: var(--grey-100);
  min-height: calc(100% - (var(--banner-height) + var(--header-height)));
`;

export const PageInnerWrapper = styled.div`
  margin-inline: auto;
  max-width: var(--desktop-max-width);
  padding-inline: 45px;
  padding-block: 45px;
`;