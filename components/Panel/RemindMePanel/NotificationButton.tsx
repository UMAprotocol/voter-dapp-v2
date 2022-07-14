import { blackOpacity25, green } from "constants/colors";
import styled, { CSSProperties } from "styled-components";

interface Props {
  clicked: boolean;
  onClick: () => void;
}
export function NotificationButton({ clicked, onClick }: Props) {
  const background = clicked ? green : blackOpacity25;
  const translateX = clicked ? "calc(100% - 5px)" : "2px";

  return (
    <Wrapper
      onClick={onClick}
      style={
        {
          "--background": background,
        } as CSSProperties
      }
    >
      <Switch
        style={
          {
            "--translate-x": translateX,
          } as CSSProperties
        }
      />
    </Wrapper>
  );
}

const Wrapper = styled.button`
  position: relative;
  width: 51px;
  height: 31px;
  background: var(--background);
  border-radius: 16px;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
`;

const Switch = styled.div`
  position: absolute;
  top: 2px;
  transform: translateX(var(--translate-x));
  width: 27px;
  height: 27px;
  background: var(--white);
  border-radius: 16px;
  box-shadow: 0px 3px 7px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s ease-in-out;
`;
