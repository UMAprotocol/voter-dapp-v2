import Across from "public/assets/icons/across.svg";
import Polymarket from "public/assets/icons/polymarket.svg";
import UMAGovernance from "public/assets/icons/uma-governance.svg";
import UMA from "public/assets/icons/uma.svg";

export const projectIcons: Record<string, JSX.Element> = {
  Across: <Across />,
  Polymarket: <Polymarket />,
  "UMA Governance": <UMAGovernance />,
  UMA: <UMA />,
};

export function getProjectIcon(project: string | null | undefined) {
  if (!project || !(project in projectIcons)) return <UMA />;
  return projectIcons[project];
}
