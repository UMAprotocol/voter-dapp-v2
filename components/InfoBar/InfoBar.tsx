import { Button } from "components";
import { mobileAndUnder, tabletAndUnder } from "constant";
import { ReactNode } from "react";
import styled from "styled-components";

interface Props {
  label: ReactNode;
  content: ReactNode;
  actionLabel: ReactNode;
  onClick?: () => void;
  href?: string;
}
export function InfoBar({ label, content, actionLabel, onClick, href }: Props) {
  return (
    <Wrapper>
      <Label>{label}</Label>
      <Content>{content}</Content>
      <ButtonWrapper>
        <Button label={actionLabel} onClick={onClick} href={href} />
      </ButtonWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  height: 50px;
  display: flex;
  justify-content: start;
  gap: 30px;
  align-items: center;
  background: var(--grey-100);

  @media ${tabletAndUnder} {
    gap: 5px;
    height: auto;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(3, 1fr);
    border-radius: 10px;
  }
`;

const Label = styled.h1`
  width: 160px;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 15px;
  font: var(--text-md);
  color: var(--white);
  background: var(--black);
  padding-inline: 15px;

  @media ${tabletAndUnder} {
    width: 100%;
    height: 40px;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }
`;

const Content = styled.p`
  font: var(--text-md);
  color: var(--black-opacity-60);

  strong {
    color: var(--black);
  }

  @media ${tabletAndUnder} {
    margin-top: 5px;
    margin-inline: 10px;
  }

  @media ${mobileAndUnder} {
    font: var(--text-sm);
  }
`;

const ButtonWrapper = styled.div`
  margin-left: auto;
  margin-right: 30px;

  @media ${tabletAndUnder} {
    margin-inline: 10px;
    margin-bottom: 5px;
  }
`;
