import Warning from "public/assets/icons/warning.svg";
import styled from "styled-components";

export const VotesTableWrapper = styled.div`
  margin-top: var(--margin-top, 35px);
  overflow-anchor: none;
`;

export const Title = styled.h1`
  font: var(--header-md);
  margin-bottom: 20px;
`;

export const ButtonOuterWrapper = styled.div`
  margin-top: 30px;
`;

export const ButtonInnerWrapper = styled.div`
  display: flex;
  justify-content: end;
  gap: 15px;

  button {
    text-transform: capitalize;
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

export const ButtonSpacer = styled.div`
  width: 10px;
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
