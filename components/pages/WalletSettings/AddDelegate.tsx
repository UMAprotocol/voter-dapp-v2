import { Button } from "components";
import { usePanelContext } from "hooks";
import { BarText, BarWrapper, Header, Text, Warning } from "./styles";

export function AddDelegate() {
  const { openPanel } = usePanelContext();

  return (
    <>
      <Header>Delegate wallet</Header>
      <Text>
        A delegate is a wallet that has been chosen to vote on behalf of another
        party. If acting as a delegate, a delegate can no longer vote for
        themselves. Delegates can commit and reveal votes on behalf of a
        delegator as well as claim and stake reward tokens. A delegate cannot
        however unstake tokens for a delegator. A delegate can only be a
        delegate for a single delegator.
        <br />
        <br />
        <Warning>
          Warning: committed votes can only be revealed by the same wallet that
          committed them. Delegators can not reveal votes committed by their
          delegate.
        </Warning>
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
