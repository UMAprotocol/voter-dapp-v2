import { events } from "helpers";
import { createContext, ReactNode, useEffect, useState } from "react";
import { NotificationT, UuidT } from "types";

export interface NotificationsContextState {
  notifications: NotificationT[];
  removeNotification: (id: UuidT) => void;
  clearNotifications: () => void;
}

export const defaultNotificationsContextState: NotificationsContextState = {
  notifications: [],
  removeNotification: () => null,
  clearNotifications: () => null,
};

export const NotificationsContext = createContext(defaultNotificationsContextState);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationT[]>([]);

  useEffect(() => {
    function addSuccessNotification(description: ReactNode, id: UuidT, transactionHash?: string) {
      addNotification({
        description,
        id,
        transactionHash,
        type: "success",
      });

      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    }

    function addErrorNotification(description: ReactNode, id: UuidT, transactionHash?: string) {
      addNotification({
        description,
        id,
        transactionHash,
        type: "error",
      });

      setTimeout(() => {
        removeNotification(id);
      }, 10000);
    }

    function addPendingNotification(description: ReactNode, id: UuidT, transactionHash: string) {
      addNotification({
        description,
        id,
        transactionHash,
        type: "pending",
      });
    }

    events.on("success", addSuccessNotification);
    events.on("error", addErrorNotification);
    events.on("pending", addPendingNotification);

    return () => {
      events.removeListener("success", addSuccessNotification);
      events.removeListener("error", addErrorNotification);
      events.removeListener("pending", addPendingNotification);
    };
  }, []);

  function addNotification(notification: NotificationT) {
    setNotifications((prev) => [...prev, notification]);
  }

  function clearNotifications() {
    setNotifications([]);
  }

  function removeNotification(id: UuidT) {
    setNotifications((prev) => prev.filter((prevNotification) => prevNotification.id !== id));
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
