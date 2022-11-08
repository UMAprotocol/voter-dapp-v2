import styled from "styled-components";
import { AllowedAction } from "./AllowedAction";

interface Props {
  status: "delegator" | "delegate" | "none";
}
export function AllowedActions({ status }: Props) {
  return (
    <Wrapper>
      {(status === "delegator" || status === "none") && (
        <>
          <AllowedAction>Staking</AllowedAction>
          <AllowedAction>Voting</AllowedAction>
          <AllowedAction>Claiming Rewards</AllowedAction>
        </>
      )}
      {status === "delegate" && (
        <>
          <AllowedAction>Voting</AllowedAction>
          <AllowedAction>Claiming & Restake</AllowedAction>
        </>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: max-content;
  display: flex;
  align-items: center;
  gap: 15px;
`;
