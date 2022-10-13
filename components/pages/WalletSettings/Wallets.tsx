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
      {(delegationStatus === "delegator" || delegationStatus === "delegator-pending") && <IsDelegator />}
      {(delegationStatus === "delegate" || delegationStatus === "delegate-pending") && <IsDelegate />}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  background: var(--grey-100);
`;
