import { createContext, ReactNode, useState } from "react";
import { NotificationT } from "types";

export interface NotificationsContextState {
  notifications: NotificationT[];
  addNotification: (description: ReactNode, transactionHash: string) => void;
  removeNotification: (transactionHash: string) => void;
  clearNotifications: () => void;
}

export const defaultNotificationsContextState: NotificationsContextState = {
  notifications: [],
  addNotification: () => null,
  removeNotification: () => null,
  clearNotifications: () => null,
};

export const NotificationsContext = createContext(defaultNotificationsContextState);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationT[]>([]);

  function addNotification(description: ReactNode, transactionHash: string) {
    setNotifications((prev) => [...prev, { description, transactionHash }]);
  }

  function clearNotifications() {
    setNotifications([]);
  }

  function removeNotification(transactionHash: string) {
    setNotifications((prev) => prev.filter((prevNotification) => prevNotification.transactionHash !== transactionHash));
  }

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
