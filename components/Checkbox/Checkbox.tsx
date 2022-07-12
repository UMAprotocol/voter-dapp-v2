import { CustomCheckboxContainer, CustomCheckboxInput } from "@reach/checkbox";
import "@reach/checkbox/styles.css";
import { black } from "constants/colors";
import { ChangeEvent, ReactNode } from "react";
import styled, { CSSProperties } from "styled-components";
import Check from "public/assets/icons/check.svg";

interface Props {
  label: ReactNode;
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}
export function Checkbox({ label, checked, onChange, disabled }: Props) {
  const boxBackgroundColor = checked ? black : "transparent";
  return (
    <Label>
      <Box
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        style={
          {
            "--box-background-color": boxBackgroundColor,
          } as CSSProperties
        }
      >
        <CustomCheckboxInput />
        {checked && <CheckIcon />}
      </Box>
      {label}
    </Label>
  );
}

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 15px;
  color: var(--black);
  font: var(--text-xs);
`;

const Box = styled(CustomCheckboxContainer)`
  width: 16px;
  height: 16px;
  display: inline-grid;
  place-items: center;
  background: var(--box-background-color);
  border: 1px solid var(--black);
  border-radius: 2px;
`;

const CheckIcon = styled(Check)``;
