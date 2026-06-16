import { tabletAndUnder } from "constant";
import { ReactNode } from "react";
import styled from "styled-components";

interface Props {
  children: ReactNode;
  subtitle?: ReactNode;
}
export function Banner({ children, subtitle }: Props) {
  return (
    <OuterWrapper>
      <InnerWrapper>
        <Text>{children}</Text>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </InnerWrapper>
    </OuterWrapper>
  );
}

const OuterWrapper = styled.div`
  background: var(--black);
`;

const InnerWrapper = styled.div`
  max-width: var(--page-width);
  min-height: var(--banner-height);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-block: 12px;
  padding-left: var(--page-padding);
  @media ${tabletAndUnder} {
    padding-inline: 0;
  }
  margin-inline: auto;
`;

const Text = styled.h1`
  color: var(--white);
  font: var(--header-lg);
`;

const Subtitle = styled.p`
  color: var(--white);
  font: var(--text-md);
  margin-top: 6px;
  opacity: 0.85;
`;
