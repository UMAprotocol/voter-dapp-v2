import Events from "events";
import { ReactNode } from "react";
import uuid from "react-uuid";

export const events = new Events();

export function emitSuccessEvent(successEvent: { message: ReactNode; pendingId: string }) {
  const id = uuid();
  events.emit("success", { ...successEvent, id });
  return id;
}

export function emitErrorEvent(errorEvent: { message: ReactNode; pendingId: string }) {
  const id = uuid();
  events.emit("error", { ...errorEvent, id: uuid() });
  return id;
}

export function emitPendingEvent(pendingEvent: { message: ReactNode; transactionHash: string }) {
  const id = uuid();
  events.emit("pending", { ...pendingEvent, id });
  return id;
}
