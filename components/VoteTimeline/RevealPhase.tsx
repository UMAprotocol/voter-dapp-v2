import Reveal from "public/assets/icons/reveal.svg";
import styled from "styled-components";

interface Props {
  active: boolean;
}
export function RevealPhase({ active }: Props) {
  return (
    <Wrapper>
      <RevealIcon />
    </Wrapper>
  );
}

const Wrapper = styled.div``;
const RevealIcon = styled(Reveal)``;
