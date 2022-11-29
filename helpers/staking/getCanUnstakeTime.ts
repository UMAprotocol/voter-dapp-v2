import addSeconds from "date-fns/addSeconds";

// set 7 day cooldown as default
const defaultUnstakeCoolDown = 7 * 24 * 60 * 60;

export function getCanUnstakeTime(
  unstakeRequestTimeAsDate: Date,
  unstakeCoolDown = defaultUnstakeCoolDown
) {
  return addSeconds(unstakeRequestTimeAsDate, unstakeCoolDown);
}
