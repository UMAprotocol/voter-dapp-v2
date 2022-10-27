import { Portal } from "@reach/portal";
import { useNotificationsContext } from "hooks";
import { Notification } from "./Notification";

export function Notifications() {
  const { notifications, removeNotification } = useNotificationsContext();
  return (
    <Portal>
      {notifications.map((notification, i) => (
        <Notification key={i} {...notification} dismiss={removeNotification} />
      ))}
    </Portal>
  );
}
