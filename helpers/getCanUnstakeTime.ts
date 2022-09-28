import { addDays } from "date-fns";

export function getCanUnstakeTime(unstakeRequestTimeAsDate: Date) {
  return addDays(unstakeRequestTimeAsDate, 7);
}
