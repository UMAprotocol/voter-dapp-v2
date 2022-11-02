import Events from "events";
import { ReactNode } from "react";
import uniqueId from "lodash/uniqueId";

export const events = new Events();

export function emitSuccessEvent(successEvent: { message: ReactNode; pendingId: string }) {
  const id = uniqueId();
  events.emit("success", { ...successEvent, id });
  return id;
}

export function emitErrorEvent(errorEvent: { message: ReactNode; pendingId: string }) {
  const id = uniqueId();
  events.emit("error", { ...errorEvent, id: uniqueId() });
  return id;
}

export function emitPendingEvent(pendingEvent: { message: ReactNode; transactionHash: string }) {
  const id = uniqueId();
  events.emit("pending", { ...pendingEvent, id });
  return id;
}
