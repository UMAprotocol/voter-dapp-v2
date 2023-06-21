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

export function VoteListItem(props: VoteListItemProps) {
  const {
    style,
    titleText,
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
    origin,
    moreDetailsAction,
  } = useVoteListItem(props);

  return (
    <div
      style={style}
      className="grid h-auto w-full items-start gap-[12px] rounded bg-white p-3"
    >
      <div className="w-full rounded-l">
        <div className="align-center flex border-b-[--border-color] pb-1">
          <div>
            <h3 className="mb-1 text-lg font-semibold">{titleText}</h3>
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
      </div>
      {showVoteInput() && selectVote ? (
        <div>
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
        </div>
      ) : null}
      {showYourVote() ? (
        <div className="flex justify-between">
          <span>Your vote</span> <VoteText voteText={getYourVote()} />
        </div>
      ) : null}
      {showCorrectVote() ? (
        <div className="flex justify-between">
          <span>Correct vote</span> <VoteText voteText={getCorrectVote()} />
        </div>
      ) : null}
      {showVoteStatus() ? (
        <div className="flex justify-between">
          <span>Vote status</span>
          <div className="flex max-w-max items-center gap-2 whitespace-nowrap">
            <Loader isLoading={isLoading} width="6vw">
              <Dot className="fill-[--dot-color]" />{" "}
              {getRelevantTransactionLink()}
              {isDirty ? "*" : ""}
            </Loader>
          </div>
        </div>
      ) : null}
      <div className="border-t-[--border-color] pt-2">
        <div className="mr-auto w-fit">
          <Button label="More details" onClick={moreDetailsAction} />
        </div>
      </div>
    </div>
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
