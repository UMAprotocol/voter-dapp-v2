import styled, { css } from "styled-components";

// Shared styles that can be reused across Panel components

export const handleWordBreak = css`
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
`;

export const Text = styled.p`
  font: var(--text-md);
  &:not(:last-child) {
    margin-bottom: 15px;
  }
`;

export const Strong = styled.strong`
  font-weight: 700;
`;

export const AStyled = styled.a`
  ${handleWordBreak}
  color: var(--red-500);
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;
