import { Tabs } from "components/Tabs";
import styled from "styled-components";
import { Stake } from "./Stake";
import { Unstake } from "./Unstake";

export function StakeUnstakePanel() {
  const tabs = [
    {
      title: "Stake",
      content: <Stake />,
    },
    {
      title: "Unstake",
      content: <Unstake />,
    },
  ];

  return (
    <Wrapper>
      <BalancesWrapper>
        <Balance>
          <BalanceHeader>Staked balance</BalanceHeader>
          <BalanceAmount>50.123</BalanceAmount>
        </Balance>
        <Balance>
          <BalanceHeader>Unstaked balance</BalanceHeader>
          <BalanceAmount>50.123</BalanceAmount>
        </Balance>
      </BalancesWrapper>
      <Tabs tabs={tabs} />
    </Wrapper>
  );
}

const Wrapper = styled.div``;

const BalancesWrapper = styled.div`
  height: 120px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  place-items: center;
  background: var(--red);
  color: var(--white);
`;

const Balance = styled.div`
  width: 100%;
  text-align: center;
  &:first-child {
    border-right: 1px solid var(--white);
  }
`;

const BalanceHeader = styled.h2`
  font: var(--text-md);
`;

const BalanceAmount = styled.p`
  font: var(--header-lg);
`;