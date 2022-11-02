import { uniqueId } from "lodash";
import { ReactNode } from "react";

export type UniqueIdT = ReturnType<typeof uniqueId>;

export type NotificationT = {
  message: ReactNode;
  id: UniqueIdT;
  transactionHash?: string;
  type: "success" | "error" | "pending";
};

export type PendingNotificationT = NotificationT;

export type SettledEventT = {
  message: ReactNode;
  id: UniqueIdT;
  pendingId: UniqueIdT;
};
