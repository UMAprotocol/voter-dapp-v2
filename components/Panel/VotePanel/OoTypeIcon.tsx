import OptimisticOracle from "public/assets/icons/optimistic-oracle.svg";
import styled from "styled-components";
import { OracleTypeT } from "types";
import { getOracleTypeDisplayName } from "constant";

export function OoTypeIcon({ ooType }: { ooType: OracleTypeT | undefined }) {
  if (!ooType) return null;

  const displayName = getOracleTypeDisplayName(ooType);

  return (
    <Wrapper>
      <IconWrapper>
        <OoIcon />
      </IconWrapper>
      <DisplayName>{displayName}</DisplayName>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  height: 35px;
  width: max-content;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-inline: 10px;
  padding-block: 8px;
  border: 1px solid var(--grey-100);
  border-radius: 5px;
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 12px;
`;

const OoIcon = styled(OptimisticOracle)``;

const DisplayName = styled.p`
  font: var(--text-sm);
`;
