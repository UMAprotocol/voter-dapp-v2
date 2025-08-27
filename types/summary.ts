// Shared types for summary-related API endpoints and components

export interface OutcomeData {
  summary: string;
  sources: [string, number][];
}

export interface StructuredSummary {
  P1: OutcomeData;
  P2: OutcomeData;
  P3: OutcomeData;
  P4: OutcomeData;
  Uncategorized?: OutcomeData;
}

export interface SummaryResponse {
  summary: StructuredSummary;
  generatedAt: string;
  commentsHash: string;
  promptVersion: string;
  summaryBatchSize: number;
  totalComments?: number;
  uniqueUsers?: number;
  outputSources?: number;
  droppedRepliesCount?: number;
}

// Interface for update-summary API response
export interface UpdateSummaryResponse {
  updated: boolean;
  cached: boolean;
  generatedAt: string;
  commentsHash: string;
  promptVersion: string;
  processingTimeMs: number;
}

// Interface for warm-summary API response
export interface WarmSummaryResponse {
  success: boolean;
  processed: number;
  skipped: number;
  errors: number;
  totalEvents: number;
  processingTimeMs: number;
  details: {
    successfulUpdates: string[];
    skippedUpdates: string[];
    errorUpdates: { url: string; error: string }[];
  };
}

// OpenAI JSON response interface for parsing AI responses
export interface OpenAIJsonResponse {
  summary?: {
    P1?: OutcomeData | string;
    P2?: OutcomeData | string;
    P3?: OutcomeData | string;
    P4?: OutcomeData | string;
    Uncategorized?: OutcomeData | string;
  };
  P1?: OutcomeData | string;
  P2?: OutcomeData | string;
  P3?: OutcomeData | string;
  P4?: OutcomeData | string;
  Uncategorized?: OutcomeData | string;
  sources?: Record<string, [string, number][]>;
}
