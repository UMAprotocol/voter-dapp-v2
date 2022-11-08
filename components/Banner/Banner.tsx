import { mobileAndUnder } from "constant";
import { ReactNode } from "react";
import styled from "styled-components";

interface Props {
  children: ReactNode;
}
export function Banner({ children }: Props) {
  return (
    <OuterWrapper>
      <InnerWrapper>
        <Text>{children}</Text>
      </InnerWrapper>
    </OuterWrapper>
  );
}

const OuterWrapper = styled.div`
  background: var(--black);
`;

const InnerWrapper = styled.div`
  max-width: var(--page-width);
  height: var(--banner-height);
  display: flex;
  align-items: center;
  padding-left: 45px;
  @media ${mobileAndUnder} {
    max-width: unset;
    padding: 15px;
  }
  margin-inline: auto;
`;

const Text = styled.h1`
  color: var(--white);
  font: var(--header-lg);
`;
