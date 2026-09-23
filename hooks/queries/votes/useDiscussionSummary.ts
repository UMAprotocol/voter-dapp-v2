import { useQuery } from "@tanstack/react-query";
import { discussionSummaryKey } from "constant";
import { L1Request } from "types";
import {
  getDiscussionSummary,
  triggerSummaryGeneration,
} from "web3/queries/votes/getDiscussionSummary";
import { useEffect, useRef, useState } from "react";

export function useDiscussionSummary({ identifier, time, title }: L1Request) {
  const [isGenerating, setIsGenerating] = useState(false);
  const generationTriggeredRef = useRef(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingStartTimeRef = useRef<number | null>(null);
  const hasReceivedDataRef = useRef(false);
  const MAX_POLLING_TIME = 60000; // 60 seconds max polling

  const query = useQuery({
    queryKey: [discussionSummaryKey, identifier, time, title],
    queryFn: () => getDiscussionSummary({ identifier, time, title }),
    onSuccess: (data) => {
      // If we received valid data or disabled state, stop generating/polling
      if (data && data !== null && data !== "disabled") {
        hasReceivedDataRef.current = true;
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        setIsGenerating(false);
        pollingStartTimeRef.current = null;
        return;
      }

      // If summary is disabled, don't try to generate
      if (data === "disabled") {
        hasReceivedDataRef.current = true;
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        setIsGenerating(false);
        pollingStartTimeRef.current = null;
        return;
      }

      // If there is no cached summary, trigger generation immediately and start polling
      if (
        data === null &&
        !generationTriggeredRef.current &&
        !hasReceivedDataRef.current
      ) {
        generationTriggeredRef.current = true;
        setIsGenerating(true);
        pollingStartTimeRef.current = Date.now();

        triggerSummaryGeneration({ identifier, time, title })
          .then(() => {
            if (!hasReceivedDataRef.current) {
              pollingIntervalRef.current = setInterval(() => {
                if (
                  hasReceivedDataRef.current ||
                  (pollingStartTimeRef.current &&
                    Date.now() - pollingStartTimeRef.current > MAX_POLLING_TIME)
                ) {
                  if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                    pollingIntervalRef.current = null;
                  }
                  setIsGenerating(false);
                  return;
                }
                void query.refetch();
              }, 500);
            }
          })
          .catch((error) => {
            console.error("Failed to trigger summary generation:", error);
            setIsGenerating(false);
          });
      }
    },
    onError: (err) => console.error(err),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: (failureCount) => failureCount < 3,
  });

  // Reset state when the input key changes (new market)
  useEffect(() => {
    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    // Reset flags for new query key
    generationTriggeredRef.current = false;
    hasReceivedDataRef.current = false;
    pollingStartTimeRef.current = null;
    setIsGenerating(false);
  }, [identifier, time, title]);

  useEffect(() => {
    // If we already have data or disabled state, mark it and don't do anything else
    if (query.data && query.data !== null) {
      hasReceivedDataRef.current = true;
      // Clean up any existing polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        setIsGenerating(false);
        pollingStartTimeRef.current = null;
      }
      return;
    }

    // If we don't have a summary (null) after the first fetch, trigger generation immediately
    if (
      query.isFetched &&
      (query.data === null || query.data === undefined) &&
      !generationTriggeredRef.current &&
      !hasReceivedDataRef.current
    ) {
      generationTriggeredRef.current = true;
      setIsGenerating(true);
      pollingStartTimeRef.current = Date.now();

      // Trigger summary generation
      triggerSummaryGeneration({ identifier, time, title })
        .then(() => {
          // Only start polling if we still don't have data
          if (!hasReceivedDataRef.current) {
            // Start polling every 500ms
            pollingIntervalRef.current = setInterval(() => {
              // Check if we've exceeded max polling time or already have data
              if (
                hasReceivedDataRef.current ||
                (pollingStartTimeRef.current &&
                  Date.now() - pollingStartTimeRef.current > MAX_POLLING_TIME)
              ) {
                // Stop polling after timeout or when data is received
                if (pollingIntervalRef.current) {
                  clearInterval(pollingIntervalRef.current);
                  pollingIntervalRef.current = null;
                  setIsGenerating(false);
                }
                return;
              }

              void query.refetch();
            }, 500);
          }
        })
        .catch((error) => {
          console.error("Failed to trigger summary generation:", error);
          setIsGenerating(false);
        });
    }

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [query.data, query.isFetched, identifier, time, title, query.refetch]);

  return {
    ...query,
    isGenerating,
  };
}
