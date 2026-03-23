import { DropdownItemT } from "types";

export function getSelectableQuickOptions(
  options: DropdownItemT[]
): DropdownItemT[] {
  return options.filter((option) => option.value !== "custom");
}
