import { useDiscussionSummary } from "hooks/queries/votes/useDiscussionSummary";
import { VoteT } from "types";
import Bot from "public/assets/icons/bot.svg";
import { OutcomeData } from "pages/api/fetch-summary";
import { PanelContentWrapper } from "components/Panel/VotePanel/VotePanel";

type Props = {
  query: VoteT;
};

// Helper function to get decoded option label for a p-value
function getDecodedOptionLabel(
  pValue: string,
  options?: { label: string }[]
): string | null {
  if (!options || !pValue.toUpperCase().startsWith("P")) return null;

  const pNumber = parseInt(pValue.substring(1), 10);
  if (isNaN(pNumber) || pNumber < 1 || pNumber > options.length) return null;

  return options[pNumber - 1]?.label || null;
}

// Helper function to process summary text and convert sources to links
function processSummaryText(text: string) {
  // Split by both \ and \n to handle different line break patterns
  const lines = text
    .split(/\s\\\s|\\n|\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      // Remove trailing backslashes and ensure lines end with a period
      let cleanLine = line.replace(/\\+$/, '').trim();
      
      // If line doesn't end with punctuation, add a period
      if (cleanLine && !/[.!?]$/.test(cleanLine)) {
        cleanLine += '.';
      }
      
      return cleanLine;
    })
    .filter((line) => line.length > 0);

  return lines.map((line, lineIndex) => {
    // Find source patterns like [Source: URL] and convert to [source] format
    const sourcePattern = /\[Source:\s*(https?:\/\/[^\]]+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = sourcePattern.exec(line)) !== null) {
      // Add text before the source
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index));
      }

      // Add [source] where "source" is clickable
      parts.push(
        <span key={`${lineIndex}-${match.index}`}>
          [
          <a
            href={match[1]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#17b38c] underline hover:text-[#15a078]"
          >
            source
          </a>
          ]
        </span>
      );

      lastIndex = sourcePattern.lastIndex;
    }

    // Add remaining text after the last source
    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }

    // Check if this line already has a bullet point
    const hasBulletPoint = line.trim().startsWith("•");
    
    // For non-empty content lines, ensure they have bullet points
    let bulletContent;
    
    if (hasBulletPoint) {
      // Handle existing bullet points - remove bullet from processing
      if (parts.length > 0) {
        bulletContent = parts.map((part, partIndex) => {
          if (partIndex === 0 && typeof part === 'string') {
            return part.replace(/^•\s*/, '');
          }
          return part;
        });
      } else {
        bulletContent = line.substring(1).trim();
      }
    } else {
      // Add bullet point to lines that don't have one
      bulletContent = parts.length > 0 ? parts : line;
    }
    
    return (
      <div key={lineIndex} className="mb-3 last:mb-0 flex">
        <span className="mr-2 mt-0 flex-shrink-0">•</span>
        <div className="flex-1">
          {bulletContent}
        </div>
      </div>
    );
  });
}

export function DiscussionSummary({ query }: Props) {
  const { data: summaryData, isLoading, isError } = useDiscussionSummary(query);
  const { options } = query;

  // Format the generated timestamp
  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

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
        {summaryData?.generatedAt && (
          <p className="mb-2 text-sm text-black/50">
            Generated on {formatTimestamp(summaryData.generatedAt)}
          </p>
        )}
        <p className="py-1 text-base text-black/70">
          <span className="text-xl">⚠️</span> This is a convenience feature that
          summarizes Discord discussions using an LLM. This summary does not
          represent the opinion of UMA. Always conduct your own research and due
          diligence before voting.
        </p>
      </div>
      <div className="flex flex-col">
        {Object.entries(summaryData.summary).map(
          (
            [pValue, outcomeData]: [string, OutcomeData],
            index: number,
            array: [string, OutcomeData][]
          ) => {
            const decodedLabel = getDecodedOptionLabel(pValue, options);
            return (
              <div key={pValue}>
                <div className="pb-5">
                  <h3 className="mb-3 text-xl font-bold uppercase tracking-wider">
                    {pValue.toUpperCase()}
                    {decodedLabel ? ` (${decodedLabel})` : ""}
                  </h3>

                  {outcomeData?.summary ? (
                    <div className="text-base leading-relaxed text-black">
                      {processSummaryText(outcomeData.summary)}
                    </div>
                  ) : (
                    <p className="text-base italic leading-relaxed text-gray-500">
                      No comments argued for this outcome
                    </p>
                  )}

                  {outcomeData?.sources && outcomeData.sources.length > 0 && (
                    <div className="mt-3 flex flex-col gap-2">
                      <span className="text-sm font-semibold uppercase tracking-wider ">
                        Sources:
                      </span>
                      <div className="m-0 flex flex-wrap gap-2 p-0">
                        {outcomeData.sources.map(
                          (
                            [source, timestamp]: [string, number],
                            sourceIndex: number
                          ) => (
                            <div
                              key={`${source}-${timestamp}-${sourceIndex}`}
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

                {/* Add horizontal rule between sections, but not after the last one */}
                {index < array.length - 1 && (
                  <hr className="mb-5 border-gray-300" />
                )}
              </div>
            );
          }
        )}
      </div>
    </PanelContentWrapper>
  );
}
