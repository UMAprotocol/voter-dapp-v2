import Commit from "public/assets/icons/commit.svg";
import styled from "styled-components";

interface Props {
  active: boolean;
}
export function CommitPhase({ active }: Props) {
  return (
    <Wrapper>
      <CommitIcon />
    </Wrapper>
  );
}

const Wrapper = styled.div``;
const CommitIcon = styled(Commit)``;
