import styled from "styled-components";

export function NotificationButton() {
  return (
    <Wrapper>
      <Switch />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 51px;
  height: 31px;
  background: var(--green);
`;

const Switch = styled.button``;
