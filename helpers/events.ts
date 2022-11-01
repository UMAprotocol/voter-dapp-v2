import Events from "events";
import uuid from "react-uuid";

export const events = new Events();

export function emitSuccessEvent(successEvent: { message: string; pendingId: string }) {
  const id = uuid();
  events.emit("success", { ...successEvent, id });
  return id;
}

export function emitErrorEvent(errorEvent: { message: string; pendingId: string }) {
  const id = uuid();
  events.emit("error", { ...errorEvent, id: uuid() });
  return id;
}

export function emitPendingEvent(pendingEvent: { message: string; transactionHash: string }) {
  const id = uuid();
  events.emit("pending", { ...pendingEvent, id });
  return id;
}
