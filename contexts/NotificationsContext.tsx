import { createContext, ReactNode, useState } from "react";
import { NotificationT } from "types";

export interface NotificationsContextState {
  notifications: NotificationT[];
  addNotification: (description: ReactNode, transactionHash: string) => void;
  removeNotification: (transactionHash: string) => void;
  clearNotifications: () => void;
}

const dummyNotifications = [
  {
    description: "Test notification. Committing votes or something",
    transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  },
  {
    description: "Another one. DJ Khaled!",
    transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdee",
  },
];

export const defaultNotificationsContextState: NotificationsContextState = {
  notifications: [],
  addNotification: () => null,
  removeNotification: () => null,
  clearNotifications: () => null,
};

export const NotificationsContext = createContext(defaultNotificationsContextState);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationT[]>(dummyNotifications);

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
