import { Portal } from "@reach/portal";
import { useNotificationsContext } from "hooks";
import styled from "styled-components";
import { Notification } from "./Notification";

export function Notifications() {
  const { notifications, removeNotification } = useNotificationsContext();
  return (
    <Portal>
      <Wrapper>
        {notifications.map((notification, i) => (
          <Notification key={i} {...notification} dismiss={removeNotification} />
        ))}
      </Wrapper>
    </Portal>
  );
}

const Wrapper = styled.div`
  display: grid;
  gap: 10px;
  padding: 15px;
`;
