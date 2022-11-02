import { events } from "helpers";
import { createContext, ReactNode, useEffect, useState } from "react";
import { NotificationT, PendingNotificationT, SettledEventT, UniqueIdT } from "types";

export type NotificationsById = Record<UniqueIdT, NotificationT | undefined>;

export interface NotificationsContextState {
  notifications: NotificationsById;
  removeNotification: (id: UniqueIdT) => void;
  clearNotifications: () => void;
}

export const defaultNotificationsContextState: NotificationsContextState = {
  notifications: {},
  removeNotification: () => null,
  clearNotifications: () => null,
};

export const NotificationsContext = createContext(defaultNotificationsContextState);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationsById>({});

  useEffect(() => {
    function handlePendingEvent({ message, id, transactionHash }: PendingNotificationT) {
      addNotification({
        id,
        message,
        transactionHash,
        type: "pending",
      });
    }

    function handleSuccessEvent({ message, pendingId }: SettledEventT) {
      updatePendingNotification(pendingId, message, "success");

      setTimeout(() => {
        removeNotification(pendingId);
      }, 5000);
    }

    function handleErrorEvent({ message, pendingId }: SettledEventT) {
      updatePendingNotification(pendingId, message, "error");

      setTimeout(() => {
        removeNotification(pendingId);
      }, 5000);
    }

    events.on("success", handleSuccessEvent);
    events.on("error", handleErrorEvent);
    events.on("pending", handlePendingEvent);

    return () => {
      events.removeListener("success", handleSuccessEvent);
      events.removeListener("error", handleErrorEvent);
      events.removeListener("pending", handlePendingEvent);
    };
  }, []);

  function addNotification(notification: NotificationT) {
    setNotifications((prev) => ({ ...prev, [notification.id]: notification }));
  }

  function updatePendingNotification(id: UniqueIdT, message: ReactNode, type: "success" | "error") {
    setNotifications((prev) => ({
      ...prev,
      [id]: {
        message,
        type,
        id,
        transactionHash: prev[id]?.transactionHash,
      },
    }));
  }

  function clearNotifications() {
    setNotifications({});
  }

  function removeNotification(id: UniqueIdT) {
    setNotifications((prev) => ({ ...prev, [id]: undefined }));
  }

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
