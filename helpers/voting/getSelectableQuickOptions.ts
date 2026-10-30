import { DropdownItemT } from "types";

export function getSelectableQuickOptions(
  options: DropdownItemT[]
): DropdownItemT[] {
  return options.filter((option) => option.value !== "custom");
}

/** Quick-vote options with the number shown as P<n> and bound to key <n>.
 * Polymarket options keep their declared p-code, so Early request stays P4 when
 * an optional outcome such as p3 is absent. Anything else is numbered by position.
 */
export function getQuickVoteOptions(
  options: DropdownItemT[]
): { option: DropdownItemT; number: number }[] {
  const selectable = getSelectableQuickOptions(options);
  const codes = selectable.map(
    ({ secondaryLabel }) => /^p([1-9])$/i.exec(secondaryLabel ?? "")?.[1]
  );
  const useCodes =
    codes.every((code) => code !== undefined) &&
    new Set(codes).size === codes.length;
  return selectable.map((option, index) => ({
    option,
    number: useCodes ? Number(codes[index]) : index + 1,
  }));
}
