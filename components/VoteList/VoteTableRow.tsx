import {
  Dropdown,
  Loader,
  LoadingSkeleton,
  TextInput,
  Tooltip,
} from "components";
import { format } from "date-fns";
import { enCA } from "date-fns/locale";
import { getOptimisticGovernorTitle } from "helpers";
import { useOptimisticGovernorData } from "hooks/queries/votes/useOptimisticGovernorData";
import NextLink from "next/link";
import Clickable from "public/assets/icons/clickable.svg";
import Dot from "public/assets/icons/dot.svg";
import OSnap from "public/assets/icons/osnap.svg";
import Rolled from "public/assets/icons/rolled.svg";
import styled from "styled-components";
import { VoteListItemProps } from "./shared.types";
import { useVoteListItem } from "./useVoteListItem";
import { mobileAndUnder } from "constant";
import { MultipleValuesInputModal } from "components/Modals/MultipleValuesInputModal";

const OSnapIcon = styled(OSnap)``;

const TitleIconWrapper = styled.div`
  width: 40px;
  height: 40px;

  @media ${mobileAndUnder} {
    width: max(40px, 5%);
    height: max(40px, 5%);
  }
`;

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
    isCustomInput,
    multipleInputProps,
    dropdownOptions,
    selectedDropdownOption,
  } = useVoteListItem(props);

  const { isOptimisticGovernorVote, explanationText } =
    useOptimisticGovernorData(props.vote.decodedAncillaryData);

  const optimisticGovernorTitle = isOptimisticGovernorVote
    ? getOptimisticGovernorTitle(explanationText)
    : "";

  const voteOrigin = isOptimisticGovernorVote ? "OSnap" : origin;

  return (
    <tr
      className="group min-h-[80px] cursor-pointer rounded bg-white"
      style={style}
      onClick={moreDetailsAction}
    >
      <td className="rounded-l p-[--cell-padding]">
        <div className="flex items-center gap-[--cell-padding]">
          <div className="min-w-[--title-icon-size]">
            <div className="w-[--title-icon-size]">
              {isOptimisticGovernorVote ? (
                <TitleIconWrapper>
                  <OSnapIcon />
                </TitleIconWrapper>
              ) : (
                <Icon />
              )}
            </div>
          </div>
          <div>
            <h3 className="line-clamp-2 max-w-[500px] break-words text-lg font-semibold transition duration-300 group-hover:text-red-500">
              {optimisticGovernorTitle || titleText}
            </h3>
            <div className="flex gap-2 align-baseline">
              {isRolled && !isV1 ? (
                <Tooltip label="This vote was included in the previous voting cycle, but did not get enough votes to resolve.">
                  <div className="flex gap-1">
                    <div className="w-[7px] self-center">
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
                {voteOrigin}{" "}
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
      {<MultipleValuesInputModal {...multipleInputProps} />}
      {showVoteInput() && selectVote ? (
        <td
          className="cursor-default pr-[--cell-padding]"
          onClick={(e) => e.stopPropagation()}
        >
          {dropdownOptions && !isCustomInput ? (
            <Dropdown
              label="Choose answer"
              items={dropdownOptions}
              selected={selectedDropdownOption}
              onSelect={onSelectVote}
            />
          ) : (
            <TextInput
              value={selectedVote ?? getDecryptedVoteAsString() ?? ""}
              onInput={selectVote}
              onClear={() => exitCustomInput()}
              maxDecimals={maxDecimals}
              type="number"
            />
          )}
        </td>
      ) : null}
      {showYourVote() ? (
        <td className="min-w-[100px] whitespace-nowrap pr-[--cell-padding]">
          <VoteText voteText={getYourVote()} />
        </td>
      ) : null}
      {showCorrectVote() ? (
        <td className="min-w-[100px] whitespace-nowrap pr-[--cell-padding]">
          <VoteText voteText={getCorrectVote()} />
        </td>
      ) : null}
      {showVoteStatus() ? (
        <td className="pr-[--cell-padding]">
          <div
            className="flex min-w-max cursor-default items-center gap-2 whitespace-nowrap"
            onClick={(e) => e.stopPropagation()}
          >
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
      <td
        className="cursor-pointer rounded-r pr-[--cell-padding]"
        aria-label="More details"
      >
        <div className="ml-auto w-fit">
          <Clickable className="transition-[fill] duration-300 group-hover:fill-red-500 [&>path]:transition-[stroke] group-hover:[&>path]:stroke-white" />
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
