import { useDelegationContext } from "hooks";
import styled from "styled-components";
import { IsDelegate } from "./IsDelegate";
import { IsDelegator } from "./IsDelegator";
import { NoDelegation } from "./NoDelegation";
import { NoWalletConnected } from "./NoWalletConnected";

export function Wallets() {
  const { getDelegationStatus } = useDelegationContext();
  const delegationStatus = getDelegationStatus();
  return (
    <Wrapper>
      {delegationStatus === "no-wallet-connected" && <NoWalletConnected />}
      {delegationStatus === "no-delegation" && <NoDelegation />}
      {delegationStatus === "delegator" && <IsDelegator />}
      {delegationStatus === "delegate" && <IsDelegate />}
      {delegationStatus === "delegator-pending" && <IsDelegator hasPending={true} />}
      {delegationStatus === "delegate-pending" && <IsDelegate hasPending={true} />}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  background: var(--grey-100);
`;
