import { useDelegationContext } from "hooks";
import styled from "styled-components";
import { IsDelegate } from "./IsDelegate";
import { IsDelegator } from "./IsDelegator";
import { NoDelegation } from "./NoDelegation";
import { NoWalletConnected } from "./NoWalletConnected";
import { Signatures } from "./Signatures";

export function Wallets() {
  const {
    isNoWalletConnected,
    isNoDelegation,
    isDelegate,
    isDelegator,
    isDelegatePending,
    isDelegatorPending,
  } = useDelegationContext();

  return (
    <Wrapper>
      {isNoWalletConnected && <NoWalletConnected />}
      {isNoDelegation && <NoDelegation />}
      {isDelegator && <IsDelegator />}
      {isDelegate && <IsDelegate />}
      {isDelegatorPending && <IsDelegator hasPending={true} />}
      {isDelegatePending && <IsDelegate hasPending={true} />}
      <Signatures />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  background: var(--grey-100);
`;
