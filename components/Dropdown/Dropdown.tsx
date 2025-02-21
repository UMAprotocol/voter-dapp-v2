import {
  Menu,
  MenuButton,
  MenuContextValue,
  MenuItem,
  MenuPopover,
} from "@reach/menu-button";
import "@reach/menu-button/styles.css";
import { positionMatchWidth } from "@reach/popover";
import { black, blackOpacity50 } from "constant";
import { capitalizeFirstLetter } from "helpers";
import Chevron from "public/assets/icons/chevron.svg";
import { ReactNode } from "react";
import styled, { CSSProperties, keyframes } from "styled-components";
import { DropdownItemT } from "types";

interface Props {
  items: DropdownItemT[];
  label: ReactNode;
  selected: DropdownItemT | undefined;
  onSelect: (item: DropdownItemT) => void;
  disabled?: boolean;
  textColor?: string;
  borderColor?: string;
}

export function Dropdown({
  items,
  label,
  selected,
  onSelect,
  disabled,
  textColor,
  borderColor = black,
}: Props) {
  const toggleTextColor = selected ? textColor ?? black : blackOpacity50;
  return (
    <Wrapper>
      {({ isExpanded }: MenuContextValue) => (
        <>
          <ToggleButton
            style={
              {
                "--color": toggleTextColor,
                "--border-color": borderColor,
              } as CSSProperties
            }
            aria-disabled={disabled}
          >
            {selected ? selected.label : label}
            <ChevronIcon $isExpanded={isExpanded} />
          </ToggleButton>
          <DropdownList
            data-testid="dropdown"
            position={positionMatchWidth}
            style={{ "--border-color": borderColor } as CSSProperties}
          >
            {items.map((item) => (
              <DropdownItem
                $isSelected={selected?.value === item.value}
                onSelect={() => onSelect(item)}
                key={item.label}
              >
                <Label>{capitalizeFirstLetter(item.label)}</Label>
                {item.secondaryLabel ? (
                  <SecondaryLabel>({item.secondaryLabel})</SecondaryLabel>
                ) : null}
              </DropdownItem>
            ))}
          </DropdownList>
        </>
      )}
    </Wrapper>
  );
}

const slideDown = keyframes`
0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Wrapper = styled(Menu)``;

const ToggleButton = styled(MenuButton)`
  width: 100%;
  max-width: 510px;
  min-width: 224px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: 15px;
  font: var(--text-md);
  color: var(--color);
  background-color: var(--white);
  border: 1.18px solid var(--border-color);
  border-radius: 5px;
  &[aria-disabled="true"] {
    opacity: 0.5;
    border: 1.18px solid var(--black-opacity-50);
    pointer-events: none;
  }
`;

const DropdownList = styled(MenuPopover)`
  width: 100%;
  background-color: var(--white);
  border: 1px solid var(--border-color);
  border-radius: 5px;
  padding: 0;
  animation: ${slideDown} 0.2s ease-in-out;
  z-index: 9999;
`;

const DropdownItem = styled(MenuItem)<{ $isSelected: boolean }>`
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: 15px;
  font: var(--text-md);
  color: var(--black);
  border-radius: 5px;
  background-color: ${({ $isSelected }) =>
    $isSelected ? "var(--grey-50)" : "var(--white)"};
  &:hover {
    background-color: var(--grey-50);
    color: currentColor;
  }
  &:not(:last-child) {
    border-bottom: 1px solid var(--grey-50);
  }
`;

const Label = styled.p``;

const SecondaryLabel = styled.p`
  color: var(--black-opacity-50);
`;

const ChevronIcon = styled(Chevron)<{ $isExpanded: boolean }>`
  transform: rotate(${({ $isExpanded }) => ($isExpanded ? "0deg" : "180deg")});
  transition: transform 0.2s ease-in-out;
`;
