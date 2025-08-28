import { useDiscussionSummary } from "hooks/queries/votes/useDiscussionSummary";
import { VoteT } from "types";
import Robot from "public/assets/icons/robot.svg";
import { OutcomeData } from "types";
import { PanelContentWrapper } from "components/Panel/VotePanel/VotePanel";
import styled from "styled-components";
import { addOpacityToHsl } from "helpers";
import { red500 } from "constant";
import {
  PanelSectionTitle,
  PanelSectionSubTitle,
} from "components/Panel/styles";
import { Text, Strong, AStyled } from "components/Panel/shared-styles";

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
      let cleanLine = line.replace(/\\+$/, "").trim();

      // If line doesn't end with punctuation, add a period
      if (cleanLine && !/[.!?]$/.test(cleanLine)) {
        cleanLine += ".";
      }

      return cleanLine;
    })
    .filter((line) => line.length > 0);

  return lines.map((line, lineIndex) => {
    // Handle both [Source: URL] and markdown [text](URL) patterns
    const sourcePattern = /\[Source:\s*(https?:\/\/[^\]]+)\]/g;
    const markdownPattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;

    const parts = [];
    let lastIndex = 0;
    let elementKey = 0;

    // Create a combined pattern to find all link patterns
    const allMatches = [];

    // Find all [Source: URL] patterns
    let match;
    while ((match = sourcePattern.exec(line)) !== null) {
      allMatches.push({
        index: match.index,
        length: match[0].length,
        url: match[1],
        text: "source",
        type: "source",
      });
    }

    // Reset regex and find all markdown [text](URL) patterns
    markdownPattern.lastIndex = 0;
    while ((match = markdownPattern.exec(line)) !== null) {
      allMatches.push({
        index: match.index,
        length: match[0].length,
        url: match[2],
        text: match[1],
        type: "markdown",
      });
    }

    // Sort matches by index to process them in order
    allMatches.sort((a, b) => a.index - b.index);

    // Process all matches
    for (const linkMatch of allMatches) {
      // Add text before the link
      if (linkMatch.index > lastIndex) {
        parts.push(line.slice(lastIndex, linkMatch.index));
      }

      // Add the clickable link
      if (linkMatch.type === "source") {
        parts.push(
          <span key={`${lineIndex}-${elementKey++}`}>
            [
            <AStyled
              href={linkMatch.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {linkMatch.text}
            </AStyled>
            ]
          </span>
        );
      } else {
        // Markdown link
        parts.push(
          <AStyled
            key={`${lineIndex}-${elementKey++}`}
            href={linkMatch.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkMatch.text}
          </AStyled>
        );
      }

      lastIndex = linkMatch.index + linkMatch.length;
    }

    // Add remaining text after the last link
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
          if (partIndex === 0 && typeof part === "string") {
            return part.replace(/^•\s*/, "");
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
      <div key={lineIndex} className="mb-3 flex last:mb-0">
        <span className="mr-2 mt-0 flex-shrink-0">•</span>
        <div className="flex-1">{bulletContent}</div>
      </div>
    );
  });
}

export function DiscussionSummary({ query }: Props) {
  const {
    data: summaryData,
    isLoading,
    isError,
    isGenerating,
  } = useDiscussionSummary(query);
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

  // Handle loading state
  if (isLoading) {
    return (
      <PanelContentWrapper>
        <div className="flex items-start justify-start">
          <p className="text-lg text-black/70">Loading discussion summary...</p>
        </div>
      </PanelContentWrapper>
    );
  }

  // Handle actual errors (network issues, server errors, etc.)
  if (isError) {
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

  // Handle disabled summary
  if (summaryData === "disabled") {
    return (
      <PanelContentWrapper>
        <div className="flex flex-col items-start justify-start">
          <p className="text-lg text-black/70">
            AI summary is disabled for this market.
          </p>
        </div>
      </PanelContentWrapper>
    );
  }

  // Handle no summary available - go directly to generating state on first null
  // We show the generating state immediately when the cache returns null (404),
  // even before the hook flips isGenerating to true, to avoid a flash of the
  // "No discussion" message.
  if (summaryData === null || isGenerating) {
    return (
      <PanelContentWrapper>
        <div className="flex flex-col items-start justify-start">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#17b38c] border-t-transparent" />
            <p className="text-lg font-medium text-black/70">
              Generating AI summary...
            </p>
          </div>
          <p className="text-base text-black/50">
            This appears to be an older vote or one were there is not yet a
            summary. We&apos;re generating a fresh summary of the discussion for
            you. This typically takes 10-30 seconds but can take longer for
            complex votes with many comments. It will automatically load here
            when generated.
          </p>
        </div>
      </PanelContentWrapper>
    );
  }

  return (
    <PanelContentWrapper>
      <Disclaimer>
        <Text>
          <Strong>Warning:</Strong> This is a convenience feature that
          summarizes Discord discussions using an LLM. This summary does not
          represent the opinion of UMA. Always conduct your own research before
          voting.
        </Text>
        {summaryData?.generatedAt && (
          <TextMuted>
            Generated on {formatTimestamp(summaryData.generatedAt)}
          </TextMuted>
        )}
      </Disclaimer>
      <PanelSectionTitle>
        <IconWrapper>
          <SummaryIcon />
        </IconWrapper>
        AI Summary
      </PanelSectionTitle>
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
                  <OutcomeTitle>
                    {pValue.toUpperCase()}
                    {decodedLabel ? ` (${decodedLabel})` : ""}
                  </OutcomeTitle>

                  {outcomeData?.summary ? (
                    <div className="text-base leading-relaxed text-black">
                      {processSummaryText(outcomeData.summary)}
                    </div>
                  ) : (
                    <p className="text-base italic leading-relaxed text-gray-500">
                      No comments argued for this outcome
                    </p>
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

// Using shared styles from components/Panel/shared-styles.ts

const Disclaimer = styled.div`
  padding-block: 12px;
  padding-inline: 20px;
  background: ${addOpacityToHsl(red500, 0.15)};
  border-radius: 5px;
  margin-bottom: 25px;
`;

const TextMuted = styled(Text)`
  color: rgba(0, 0, 0, 0.5);
  margin-top: 4px;
`;

const SummaryIcon = styled(Robot)`
  path {
    fill: var(--red-500);
  }
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
`;

const OutcomeTitle = styled(PanelSectionSubTitle)`
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
`;
