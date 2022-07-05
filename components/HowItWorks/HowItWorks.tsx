import styled from "styled-components";
import { InfoBar } from "components/InfoBar";
import One from "public/assets/icons/one.svg";
import Two from "public/assets/icons/two.svg";
import Three from "public/assets/icons/three.svg";

export function HowItWorks() {
  return (
    <Wrapper>
      <InfoBar
        label={
          <>
            <One />
            Stake UMA
          </>
        }
        content={
          <>
            You are staking <strong>34.567.890</strong> UMA tokens of 54.321.098
          </>
        }
        actionLabel="Stake/Unstake"
        onClick={() => console.log("TODO")}
      />
      <InfoBar
        label={
          <>
            <Two />
            Vote
          </>
        }
        content={
          <>
            You have voted <strong>3 out of 5</strong> latest voting cycles, and are earning <strong>18% APY</strong>
          </>
        }
        actionLabel="Vote history"
        onClick={() => console.log("TODO")}
      />
      <InfoBar
        label={
          <>
            <Three />
            Get rewards
          </>
        }
        content={
          <>
            You have <strong>92,726 UMA</strong> in unclaimed rewards
          </>
        }
        actionLabel="Claim"
        onClick={() => console.log("TODO")}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  div {
    margin-bottom: 5px;
  }
`;
