import { TooltipPopup, useTooltip } from "@reach/tooltip";
import "@reach/tooltip/styles.css";
import { animated, useTransition } from "@react-spring/web";
import { cloneElement } from "react";
import styled from "styled-components";

interface Props {
  "aria-label"?: string;
  children: React.ReactElement;
  label: string;
}
export function Tooltip({ children, ...rest }: Props) {
  const [trigger, tooltip, isVisible] = useTooltip();

  const transitions = useTransition(isVisible, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { mass: 1, tension: 500, friction: 40 },
  });

  return (
    <>
      {cloneElement(children, trigger)}
      {transitions((style, item) => item && <TooltipContent {...tooltip} {...rest} style={style} />)}
    </>
  );
}

const AnimatedTooltipContent = animated(TooltipPopup);

const TooltipContent = styled(AnimatedTooltipContent)`
  padding: 20px;
  font: var(--text-sm);
  color: var(--black);
  background: var(--white);
  border: 1px solid var(--black);
  border-radius: 5px;
  box-shadow: var(--shadow-3);
`;
