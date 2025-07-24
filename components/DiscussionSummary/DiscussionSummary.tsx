import { useDiscussionSummary } from "hooks/queries/votes/useDiscussionSummary";
import { VoteT } from "types";
import Bot from "public/assets/icons/bot.svg";
import { OutcomeData } from "pages/api/fetch-summary";
import { PanelContentWrapper } from "components/Panel/VotePanel/VotePanel";

type Props = {
  query: VoteT;
};

export function DiscussionSummary({ query }: Props) {
  const { data: summaryData, isLoading, isError } = useDiscussionSummary(query);

  if (!summaryData && isError) {
    return (
      <PanelContentWrapper>
        <div className="flex flex-col items-start justify-start">
          <p className="text-lg text-black/70">
            Failed to load discussion summary. Please try again later.
          </p>
        </div>
      </PanelContentWrapper>
    );
  }

  if (!summaryData && isLoading) {
    return (
      <PanelContentWrapper>
        <div className="flex items-start justify-start">
          <p className="text-lg text-black/70">Loading discussion summary...</p>
        </div>
      </PanelContentWrapper>
    );
  }

  return (
    <PanelContentWrapper>
      <div className="mb-5 flex flex-col gap-1 rounded-lg border border-[#17b38c80] bg-[#17b38c35] p-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#17b38c33]">
            <Bot className="h-4 w-4 text-[#17b38c]" />
          </span>

          <span className="text-lg font-semibold text-[#17B38C]">
            AI Summary
          </span>
        </div>
        <p className="py-1 text-base text-black/70">
          <span className="text-xl">⚠️</span> This is a convenience feature that
          summarizes Discord discussions. This summary does not represent the
          opinion of UMA. Always conduct your own research and due diligence
          before voting.
        </p>
      </div>
      <div className="flex flex-col gap-5">
        {Object.entries(summaryData.summary).map(
          ([pValue, outcomeData]: [string, OutcomeData]) => {
            if (
              !outcomeData?.summary &&
              (!outcomeData?.sources || outcomeData.sources.length === 0)
            ) {
              return null;
            }

            return (
              <div key={pValue}>
                <h3 className="text-xl font-bold uppercase tracking-wider">
                  {pValue}
                </h3>

                {outcomeData?.summary && (
                  <p className="text-base leading-relaxed text-black">
                    {outcomeData.summary}
                  </p>
                )}

                {outcomeData?.sources && outcomeData.sources.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-semibold uppercase tracking-wider ">
                      Sources:
                    </span>
                    <div className="m-0 flex flex-wrap gap-2 p-0">
                      {outcomeData.sources.map(
                        (
                          [source, timestamp]: [string, number],
                          index: number
                        ) => (
                          <div
                            key={`${source}-${timestamp}-${index}`}
                            className="flex items-center justify-center gap-1 rounded-full border border-[#17b38c80] bg-[#17b38c33] px-2 py-[2px] text-sm text-black"
                          >
                            <span className="h-2 w-2 rounded-full bg-[#17b38c]" />
                            <span className="text-center font-medium">
                              {source}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>
    </PanelContentWrapper>
  );
}
