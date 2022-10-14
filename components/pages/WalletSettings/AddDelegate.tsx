import { Button } from "components";
import { usePanelContext } from "hooks";
import { BarText, BarWrapper, Header, Text } from "./styles";

export function AddDelegate() {
  const { openPanel } = usePanelContext();

  return (
    <>
      <Header>Delegate wallet</Header>
      <Text>
        Explanation of how this works Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ea ratione nobis
        reiciendis, aliquid quidem nulla veniam quasi eos ab error?
      </Text>
      <BarWrapper>
        <BarText>No delegate wallet connected</BarText>
        <Button variant="primary" label="Add delegate wallet" onClick={() => openPanel("delegation")} />
      </BarWrapper>
    </>
  );
}
