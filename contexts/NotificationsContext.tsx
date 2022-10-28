import { createContext, ReactNode, useState } from "react";
import { AddNotificationFn, NotificationT, RemoveNotificationFn } from "types";

export interface NotificationsContextState {
  notifications: NotificationT[];
  addSuccessNotification: AddNotificationFn;
  addErrorNotification: AddNotificationFn;
  addPendingNotification: AddNotificationFn;
  removeNotification: RemoveNotificationFn;
  clearNotifications: () => void;
}

export const defaultNotificationsContextState: NotificationsContextState = {
  notifications: [],
  addSuccessNotification: () => null,
  addErrorNotification: () => null,
  addPendingNotification: () => null,
  removeNotification: () => null,
  clearNotifications: () => null,
};

export const NotificationsContext = createContext(defaultNotificationsContextState);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationT[]>([]);

  function addNotification(notification: NotificationT) {
    setNotifications((prev) => [...prev, notification]);
  }

  function clearNotifications() {
    setNotifications([]);
  }

  function removeNotification(transactionHash: string) {
    setNotifications((prev) => prev.filter((prevNotification) => prevNotification.transactionHash !== transactionHash));
  }

  function addSuccessNotification(description: ReactNode, transactionHash: string) {
    addNotification({
      description,
      transactionHash,
      type: "success",
    });

    setTimeout(() => {
      removeNotification(transactionHash);
    }, 5000);
  }

  function addErrorNotification(description: ReactNode, transactionHash: string) {
    addNotification({
      description,
      transactionHash,
      type: "error",
    });

    setTimeout(() => {
      removeNotification(transactionHash);
    }, 10000);
  }

  function addPendingNotification(description: ReactNode, transactionHash: string) {
    addNotification({
      description,
      transactionHash,
      type: "pending",
    });
  }

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        addSuccessNotification,
        addErrorNotification,
        addPendingNotification,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
