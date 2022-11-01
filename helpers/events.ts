import Events from "events";
import { ReactNode } from "react";
import uuid from "react-uuid";

export const events = new Events();

export function emitSuccessEvent(description: ReactNode, transactionHash?: string) {
  events.emit("success", description, uuid(), transactionHash);
}

export function emitErrorEvent(description: ReactNode, transactionHash?: string) {
  events.emit("error", description, uuid(), transactionHash);
}

export function emitPendingEvent(description: ReactNode, transactionHash?: string) {
  events.emit("pending", description, uuid(), transactionHash);
}
