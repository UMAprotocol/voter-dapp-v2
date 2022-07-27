import { Tabs } from "components/Tabs";
import { add } from "date-fns";
import { useState } from "react";
import styled from "styled-components";
import { CooldownTimer } from "./CooldownTimer";
import { Stake } from "./Stake";
import { Unstake } from "./Unstake";

export function StakeUnstakePanel() {
  const [showCooldownTimer, setShowCooldownTimer] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(add(new Date(), { minutes: 1 }));
  const [claimAmount, setClaimAmount] = useState("100.1234");
  const [canClaim, setCanClaim] = useState(true);

  const tabs = [
    {
      title: "Stake",
      content: <Stake />,
    },
    {
      title: "Unstake",
      content: <Unstake canClaim={canClaim} />,
    },
  ];
  return (
    <Wrapper>
      <BalancesWrapper>
        <Balances>
          <Balance>
            <BalanceHeader>Staked balance</BalanceHeader>
            <BalanceAmount>50.123</BalanceAmount>
          </Balance>
          <Balance>
            <BalanceHeader>Unstaked balance</BalanceHeader>
            <BalanceAmount>50.123</BalanceAmount>
          </Balance>
        </Balances>
        {showCooldownTimer && (
          <CooldownTimerWrapper>
            <CooldownTimer
              timeRemaining={timeRemaining}
              amount={claimAmount}
              canClaim={canClaim}
              onClaim={() => console.log("TODO implement onClaim")}
            />
          </CooldownTimerWrapper>
        )}
      </BalancesWrapper>
      <Tabs tabs={tabs} />
    </Wrapper>
  );
}

const Wrapper = styled.div``;

const BalancesWrapper = styled.div`
  display: grid;
  background: var(--red-500);
  color: var(--white);
  padding-top: 25px;
  padding-bottom: 20px;
`;

const Balances = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  place-items: center;
`;

const Balance = styled.div`
  width: 100%;
  text-align: center;
  &:first-child {
    border-right: 1px solid var(--white);
  }
`;

const CooldownTimerWrapper = styled.div`
  margin-top: 30px;
  margin-inline: 30px;
`;

const BalanceHeader = styled.h2`
  font: var(--text-md);
`;

const BalanceAmount = styled.p`
  font: var(--header-lg);
`;
