import { Button } from "components";
import { usePanelContext } from "hooks";
import { BarText, BarWrapper, Header, Text } from "./styles";

export function AddDelegate() {
  const { openPanel } = usePanelContext();

  return (
    <>
      <Header>Delegate wallet</Header>
      <Text>
        A delegate is a wallet that has been chosen to vote on behalf of another
        party. If acting as a delegate, a delegate can no longer vote for
        themselves. Delegates can commit and reveal votes on behalf of a delegator
        as well as claim and stake reward tokens. A delegate cannot however
        unstake tokens for a delegator. A delegate can only be a delegate for a single
        delegator.
      </Text>
      <BarWrapper>
        <BarText>No delegate wallet selected</BarText>
        <Button
          variant="primary"
          label="Add delegate wallet"
          onClick={() => openPanel("delegation")}
        />
      </BarWrapper>
    </>
  );
}
