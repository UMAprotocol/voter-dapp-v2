import { tabletMax } from "constant";
import { useWindowSize } from "hooks";
import { ActivityStatusT, VotePhaseT } from "types";
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
  const phase = data[0]?.phase as VotePhaseT | undefined;

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
        <VoteTableHeadings activityStatus={activityStatus} phase={phase} />
      </thead>
      <tbody>
        {data.map((item) => (
          <VoteTableRow key={item.vote.uniqueKey} {...item} />
        ))}
      </tbody>
    </table>
  );
}
