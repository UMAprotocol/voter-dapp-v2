import { addDays } from "date-fns";

export default function getCanUnstakeTime(unstakeRequestTimeAsDate: Date) {
  return addDays(unstakeRequestTimeAsDate, 7);
}
