import styled from "styled-components";
import { CommitPhase } from "./CommitPhase";
import { RevealPhase } from "./RevealPhase";

interface Props {
  phase: "commit" | "reveal" | null;
}
export function VoteTimeline({ phase }: Props) {
  return (
    <Wrapper>
      <CommitPhase active={phase === "commit"} />
      <RevealPhase active={phase === "reveal"} />
    </Wrapper>
  );
}

const Wrapper = styled.div``;
