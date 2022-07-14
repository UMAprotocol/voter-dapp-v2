import { CustomCheckboxContainer, CustomCheckboxInput } from "@reach/checkbox";
import "@reach/checkbox/styles.css";
import { black, white } from "constants/colors";
import { ChangeEvent, ReactNode } from "react";
import styled, { CSSProperties } from "styled-components";
import Check from "public/assets/icons/check.svg";

interface Props {
  label: ReactNode;
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  gap?: number;
}
export function Checkbox({ label, checked, onChange, disabled, gap = 15 }: Props) {
  const boxBackgroundColor = checked ? black : white;
  return (
    <Label
      style={
        {
          "--gap": gap + "px",
        } as CSSProperties
      }
    >
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
  gap: var(--gap);
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

  transition: background 0.2s ease-in-out;
`;

const CheckIcon = styled(Check)``;
