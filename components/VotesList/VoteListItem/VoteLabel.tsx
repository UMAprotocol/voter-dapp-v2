import { tabletAndUnder } from "constant";
import { ReactNode } from "react";
import styled from "styled-components";

interface Props {
  children: ReactNode;
  label: string;
}
export function VoteLabel({ children, label }: Props) {
  return (
    <>
      <Label>{label}</Label>
      {children}
    </>
  );
}

const Label = styled.span`
  display: none;

  @media ${tabletAndUnder} {
    display: inline;
  }
`;
