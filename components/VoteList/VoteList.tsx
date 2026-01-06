import { tabletMax } from "constant";
import { useWindowSize } from "hooks";
import { ActivityStatusT } from "types";
import styled from "styled-components";
import { VoteListItem } from "./VoteListItem";
import { VoteTableHeadings } from "./VoteTableHeadings";
import { VoteTableRow } from "./VoteTableRow";
import { VoteListItemProps } from "./shared.types";

interface Props {
  activityStatus: ActivityStatusT;
  data: VoteListItemProps[];
  variant?: "table" | "grid";
  darkMode?: boolean;
}
export function VoteList({ data, activityStatus, variant = "table", darkMode }: Props) {
  const { width } = useWindowSize();

  if (!width) return null;

  const isTabletAndUnder = width <= tabletMax;

  if (isTabletAndUnder || variant === "grid")
    return (
      <MatrixGrid data-theme={darkMode ? "dark" : "light"}>
        {data.map((item) => (
          <VoteListItem key={item.vote.uniqueKey} {...item} darkMode={darkMode} />
        ))}
      </MatrixGrid>
    );

  return (
    <table className="w-full border-separate border-spacing-y-1">
      <thead>
        <VoteTableHeadings activityStatus={activityStatus} />
      </thead>
      <tbody>
        {data.map((item) => (
          <VoteTableRow key={item.vote.uniqueKey} {...item} />
        ))}
      </tbody>
    </table>
  );
}

const MatrixGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
  width: 100%;
`;
