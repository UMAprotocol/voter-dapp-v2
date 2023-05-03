import {
  Button,
  IconWrapper,
  Pagination,
  Tooltip,
  usePagination,
  useVoteList,
  VoteList,
  VoteTimeline,
} from "components";
import {
  ButtonInnerWrapper,
  ButtonOuterWrapper,
  ButtonSpacer,
  Divider,
  InfoText,
  PaginationWrapper,
  RecommittingVotesMessage,
  Title,
  VotesTableWrapper,
  WarningIcon,
} from "./style";

export function ActiveVotes() {
  const voteListProps = useVoteList("active");
  const { voteList, isAnyDirty, actionStatus, resetSelectedVotes } =
    voteListProps;
  const { showPagination, entriesToShow, ...paginationProps } =
    usePagination(voteList);

  return (
    <>
      <Title> Active votes: </Title>
      <VoteTimeline />
      <VotesTableWrapper>
        <VoteList {...voteListProps} votesToShow={entriesToShow} />
      </VotesTableWrapper>
      {showPagination && (
        <PaginationWrapper>
          <Pagination {...paginationProps} />
        </PaginationWrapper>
      )}
      {isAnyDirty ? (
        <RecommittingVotesMessage>
          * Changes to committed votes need to be re-committed
        </RecommittingVotesMessage>
      ) : null}
      <ButtonOuterWrapper>
        {actionStatus.infoText ? (
          <Tooltip label={actionStatus.infoText.tooltip}>
            <InfoText>
              <IconWrapper width={20} height={20}>
                <WarningIcon />
              </IconWrapper>
              {actionStatus.infoText.label}
            </InfoText>
          </Tooltip>
        ) : null}
        <ButtonInnerWrapper>
          {isAnyDirty ? (
            <>
              <Button
                variant="secondary"
                label="Reset Changes"
                onClick={resetSelectedVotes}
              />
              <ButtonSpacer />
            </>
          ) : undefined}
          {!actionStatus.hidden ? (
            actionStatus.tooltip ? (
              <Tooltip label={actionStatus.tooltip}>
                <div>
                  <Button
                    variant="primary"
                    label={actionStatus.label}
                    onClick={actionStatus.onClick}
                    disabled={actionStatus.disabled}
                  />
                </div>
              </Tooltip>
            ) : (
              <Button
                variant="primary"
                label={actionStatus.label}
                onClick={actionStatus.onClick}
                disabled={actionStatus.disabled}
              />
            )
          ) : null}
        </ButtonInnerWrapper>
      </ButtonOuterWrapper>
      <Divider />
    </>
  );
}
