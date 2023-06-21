import {
  Button,
  Dropdown,
  Loader,
  LoadingSkeleton,
  TextInput,
  Tooltip,
} from "components";
import { format } from "date-fns";
import { enCA } from "date-fns/locale";
import NextLink from "next/link";
import Dot from "public/assets/icons/dot.svg";
import Rolled from "public/assets/icons/rolled.svg";
import { VoteListItemProps } from "./shared.types";
import { useVoteListItem } from "./useVoteListItem";

export function VoteTableRow(props: VoteListItemProps) {
  const {
    style,
    Icon,
    titleText,
    origin,
    isRolled,
    isV1,
    rollCount,
    resolvedPriceRequestIndex,
    timeAsDate,
    showVoteInput,
    selectVote,
    options,
    isCustomInput,
    getExistingOrSelectedVoteFromOptions,
    onSelectVote,
    selectedVote,
    getDecryptedVoteAsString,
    exitCustomInput,
    maxDecimals,
    showYourVote,
    getYourVote,
    showCorrectVote,
    getCorrectVote,
    showVoteStatus,
    isLoading,
    getRelevantTransactionLink,
    isDirty,
    moreDetailsAction,
  } = useVoteListItem(props);

  return (
    <tr className="h-[80px] rounded bg-white" style={style}>
      <td className="rounded-l px-[--cell-padding]">
        <div className="flex items-center gap-[--cell-padding]">
          <div className="min-w-[--title-icon-size]">
            <div className="w-[--title-icon-size]">
              <Icon />
            </div>
          </div>
          <div>
            <h3 className="max-w-[500px] overflow-hidden text-ellipsis text-lg font-semibold">
              {titleText}
            </h3>
            <div className="flex gap-2 align-baseline">
              {isRolled && !isV1 ? (
                <Tooltip label="This vote was included in the previous voting cycle, but did not get enough votes to resolve.">
                  <div className="flex gap-1 align-baseline">
                    <div className="h-[7px] w-[7px]">
                      <Rolled />
                    </div>
                    <NextLink
                      className="text-sm text-red-500 underline"
                      href="https://docs.umaproject.org/protocol-overview/dvm-2.0#rolled-votes"
                      target="_blank"
                    >
                      Roll #{rollCount}
                    </NextLink>
                  </div>
                </Tooltip>
              ) : null}
              <h4 className="text-xs text-black-opacity-50">
                {origin}{" "}
                {!isV1 &&
                  resolvedPriceRequestIndex &&
                  `| Vote #${resolvedPriceRequestIndex}`}{" "}
                |{" "}
                {format(timeAsDate, "Pp", {
                  // en-CA is the only locale that uses the correct
                  // format for the date
                  // yyyy-mm-dd
                  locale: enCA,
                })}
              </h4>
            </div>
          </div>
        </div>
      </td>
      {showVoteInput() && selectVote ? (
        <td className="pr-[--cell-padding]">
          {options && !isCustomInput ? (
            <Dropdown
              label="Choose answer"
              items={options}
              selected={getExistingOrSelectedVoteFromOptions()}
              onSelect={onSelectVote}
            />
          ) : (
            <TextInput
              value={selectedVote ?? getDecryptedVoteAsString() ?? ""}
              onInput={selectVote}
              onClear={isCustomInput ? exitCustomInput : undefined}
              maxDecimals={maxDecimals}
              type="number"
            />
          )}
        </td>
      ) : null}
      {showYourVote() ? (
        <td className="whitespace-nowrap pr-[--cell-padding]">
          <VoteText voteText={getYourVote()} />
        </td>
      ) : null}
      {showCorrectVote() ? (
        <td className="whitespace-nowrap pr-[--cell-padding]">
          <VoteText voteText={getCorrectVote()} />
        </td>
      ) : null}
      {showVoteStatus() ? (
        <td className="pr-[--cell-padding]">
          <div className="flex min-w-max items-center gap-2 whitespace-nowrap">
            <Loader isLoading={isLoading} width="6vw">
              <>
                <Dot className="fill-[--dot-color]" />{" "}
                {getRelevantTransactionLink()}
                {isDirty ? "*" : ""}
              </>
            </Loader>
          </div>
        </td>
      ) : null}
      <td className="rounded-r pr-[--cell-padding]">
        <div className="ml-auto w-fit">
          <Button label="More details" onClick={moreDetailsAction} />
        </div>
      </td>
    </tr>
  );
}

function VoteText({ voteText }: { voteText: string | undefined }) {
  if (voteText === undefined) return <LoadingSkeleton width="8vw" />;

  const maxVoteTextLength = 15;
  if (voteText.length > maxVoteTextLength) {
    return (
      <Tooltip label={voteText}>
        <span className="cursor-pointer underline">
          {voteText.slice(0, maxVoteTextLength)}...
        </span>
      </Tooltip>
    );
  }

  return <span>{voteText}</span>;
}
