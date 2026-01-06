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
import styled from "styled-components";
import { VoteListItemProps } from "./shared.types";
import { useVoteListItem } from "./useVoteListItem";
import { useOptimisticGovernorData } from "hooks/queries/votes/useOptimisticGovernorData";
import { getOptimisticGovernorTitle } from "helpers";
import { MultipleValuesInputModal } from "components/Modals/MultipleValuesInputModal";

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
    dropdownOptions,
    isCustomInput,
    multipleInputProps,
    selectedDropdownOption,
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

  const { isOptimisticGovernorVote, explanationText } =
    useOptimisticGovernorData(props.vote.decodedAncillaryData);

  const optimisticGovernorTitle = isOptimisticGovernorVote
    ? getOptimisticGovernorTitle(explanationText)
    : "";

  const voteOrigin = isOptimisticGovernorVote ? "OSnap" : origin;

  return (
    <VoteCard style={style} $darkMode={props.darkMode}>
      <CardHeader>
        <div className="w-full">
          <h3 className="mb-1 line-clamp-2 w-full break-words text-lg font-semibold">
            {optimisticGovernorTitle || titleText}
          </h3>
          <div className="flex flex-wrap items-center gap-2 align-baseline">
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
            <MetaText $darkMode={props.darkMode}>
              {voteOrigin}{" "}
              {!isV1 && resolvedPriceRequestIndex && `| Vote #${resolvedPriceRequestIndex}`}{" "}
              |{" "}
              {format(timeAsDate, "Pp", {
                // en-CA is the only locale that uses the correct
                // format for the date
                // yyyy-mm-dd
                locale: enCA,
              })}
            </MetaText>
          </div>
        </div>
      </CardHeader>
      {<MultipleValuesInputModal {...multipleInputProps} />}
      {showVoteInput() && selectVote ? (
        <div
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
        </div>
      ) : null}

      {showYourVote() ? (
        <div className="flex justify-between gap-2">
          <span>Your vote:</span> <VoteText voteText={getYourVote()} />
        </div>
      ) : null}
      {showCorrectVote() ? (
        <div className="flex justify-between gap-2">
          <span>Correct vote:</span> <VoteText voteText={getCorrectVote()} />
        </div>
      ) : null}
      {showVoteStatus() ? (
        <div className="flex justify-between gap-2">
          <span>Vote status:</span>
          <div className="flex max-w-max items-center gap-1 whitespace-nowrap">
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
    </VoteCard>
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

const VoteCard = styled.div<{ $darkMode?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 100%;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid var(--border-color);
  background: ${({ $darkMode }) => ($darkMode ? "#0f172a" : "var(--white)")};
  color: ${({ $darkMode }) => ($darkMode ? "var(--white)" : "var(--black)")};
  box-shadow: ${({ $darkMode }) =>
    $darkMode ? "0px 16px 32px rgba(0, 0, 0, 0.35)" : "0px 12px 30px rgba(0, 0, 0, 0.06)"};
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;

  h3 {
    color: inherit;
  }
`;

const CardHeader = styled.div`
  width: 100%;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
`;

const MetaText = styled.h4<{ $darkMode?: boolean }>`
  font-size: 12px;
  color: ${({ $darkMode }) => ($darkMode ? "hsla(0, 0%, 85%, 0.85)" : "var(--black-opacity-50)")};
`;
