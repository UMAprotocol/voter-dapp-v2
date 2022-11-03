import { defaultPanelWidth, mobileMax } from "constant";
import { useEffect, useState } from "react";
import { useWindowSize } from "./useWindowSize";

export function usePanelWidth() {
  const { width: pageWidth } = useWindowSize();
  const [panelWidth, setPanelWidth] = useState(defaultPanelWidth);

  useEffect(() => {
    if (!pageWidth) return;
    if (pageWidth <= mobileMax) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      setPanelWidth(pageWidth - scrollbarWidth);
    }
  }, [pageWidth]);

  return panelWidth;
}
