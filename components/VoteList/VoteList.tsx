import { tabletMax } from "constant";
import { useWindowSize } from "hooks";
import { ActivityStatusT } from "types";
import { VoteListItem } from "./VoteListItem";
import { VoteTableHeadings } from "./VoteTableHeadings";
import { VoteTableRow } from "./VoteTableRow";
import { VoteListItemProps } from "./shared.types";

interface Props {
  activityStatus: ActivityStatusT;
  data: VoteListItemProps[];
}
export function VoteList({ data, activityStatus }: Props) {
  const { width } = useWindowSize();

  if (!width) return null;

  const isTabletAndUnder = width <= tabletMax;

  if (isTabletAndUnder)
    return (
      <div className="flex flex-col gap-1">
        {data.map((item) => (
          <VoteListItem key={item.vote.uniqueKey} {...item} />
        ))}
      </div>
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
