import { mobileAndUnder } from "constant";
import Dot from "public/assets/icons/dot.svg";
import { ReactNode } from "react";
import styled from "styled-components";

export function AllowedAction({ children }: { children: ReactNode }) {
  return (
    <Wrapper>
      <IconWrapper>
        <Icon />
      </IconWrapper>
      <Label>{children}</Label>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const IconWrapper = styled.div`
  margin-left: 5px;
`;

const Icon = styled(Dot)`
  circle {
    fill: var(--green);
  }
`;

const Label = styled.span`
  font: var(--text-sm);

  @media ${mobileAndUnder} {
    font: var(--text-xs);
  }
`;
