import styled from "styled-components";

export const PanelWrapper = styled.div`
  min-height: 100%;
  display: grid;
  grid-template-rows: auto 1fr auto;
`;

export const PanelSectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  font: var(--header-sm);
  font-weight: 700;
`;

export const PanelSectionText = styled.p`
  font: var(--text-sm);
  margin-bottom: 20px;
`;

export const PanelWarningText = styled(PanelSectionText)`
  color: var(--red-500);
`;
