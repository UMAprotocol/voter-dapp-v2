import { Button } from "components/Button";
import styled from "styled-components";
import { Header, Text } from "./styles";

export function AddDelegate({ addDelegate }: { addDelegate: () => void }) {
  return (
    <>
      <Header>Delegate wallet</Header>
      <Text>
        Explanation of how this works Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ea ratione nobis
        reiciendis, aliquid quidem nulla veniam quasi eos ab error?
      </Text>
      <Wrapper>
        <Text>No delegate wallet connected</Text>
        <Button variant="primary" label="Add delegate wallet" onClick={addDelegate} />
      </Wrapper>
    </>
  );
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
