import { useState, useEffect } from "react";
import { AllSummariesResponse } from "./api/fetch-all-cached-summaries";

type ErrorResponse = { error?: unknown };

interface WarmSummaryResponse {
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

function isAllSummariesResponse(value: unknown): value is AllSummariesResponse {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as { summaries?: unknown; fetchedAt?: unknown };
  return Array.isArray(obj.summaries) && typeof obj.fetchedAt === "string";
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in (value as Record<string, unknown>)
  );
}

interface SummaryRowProps {
  summary: AllSummariesResponse["summaries"][0];
}

function formatTimestamp(unixTimestamp: string): string {
  const date = new Date(parseInt(unixTimestamp) * 1000);
  return date.toLocaleString();
}

function formatDuration(ms: number): string {
  if (!ms || ms < 0) return "0.0s";
  const seconds = (ms / 1000).toFixed(1);
  return `${seconds}s`;
}

function formatAsDMY(dateInput: string | number | Date): string {
  let date: Date;
  if (typeof dateInput === "string") {
    if (/^\d+$/.test(dateInput)) {
      date = new Date(parseInt(dateInput) * 1000);
    } else {
      date = new Date(dateInput);
    }
  } else if (typeof dateInput === "number") {
    date = new Date(dateInput);
  } else {
    date = dateInput;
  }

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

function formatSummaryBullets(text: string): string[] {
  if (!text) return [];

  // Handle text that contains bullet points
  // Split by • that appears at start of string or after a newline
  const parts = text.split(/\n•\s*/);

  // Handle the first part - it might start with • or not
  const firstPart = parts[0];
  const bullets: string[] = [];

  if (firstPart.startsWith("• ")) {
    // First part starts with bullet
    bullets.push(firstPart.substring(2).trim());
  } else if (firstPart.trim().length > 0) {
    // First part doesn't start with bullet but has content
    // Check if it's actually multiple bullets without newlines
    if (firstPart.includes("• ")) {
      // Split by bullet points not at the start
      const subBullets = firstPart.split(/•\s*/);
      bullets.push(
        ...subBullets.filter((b) => b.trim().length > 0).map((b) => b.trim())
      );
    } else {
      bullets.push(firstPart.trim());
    }
  }

  // Add remaining parts (these all came after \n•)
  bullets.push(
    ...parts
      .slice(1)
      .map((b) => b.trim())
      .filter((b) => b.length > 0)
  );

  return bullets;
}

function renderMarkdownContent(text: string): string {
  if (!text) return "";

  // Convert markdown links [text](url) to HTML links
  let formatted = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Handle any remaining bare URLs
  formatted = formatted.replace(
    /(^|[^"])(https?:\/\/[^\s<>"{}|\\^`[\]]+?)(?=[.!?;,]*(?:\s|$))/gi,
    '$1<a href="$2" target="_blank" rel="noopener noreferrer">link</a>'
  );

  return formatted;
}

function SummaryRow({ summary }: SummaryRowProps) {
  const [expanded, setExpanded] = useState(false);

  const hasContent =
    summary.data.P1.summary ||
    summary.data.P2.summary ||
    summary.data.P3.summary ||
    summary.data.P4.summary ||
    summary.data.Uncategorized.summary;

  // Use new fields if available, fall back to old ones (safely typed)
  const legacyMessageCount: unknown = (
    summary.data as unknown as { messageCount?: unknown }
  ).messageCount;
  const legacySourceCount: unknown = (
    summary.data as unknown as { sourceCount?: unknown }
  ).sourceCount;

  const commentCount =
    typeof summary.data.totalComments === "number"
      ? summary.data.totalComments
      : typeof legacyMessageCount === "number"
      ? legacyMessageCount
      : 0;
  const sourceCount =
    typeof summary.data.outputSources === "number"
      ? summary.data.outputSources
      : typeof legacySourceCount === "number"
      ? legacySourceCount
      : 0;
  const uniqueUsers =
    typeof summary.data.uniqueUsers === "number" ? summary.data.uniqueUsers : 0;
  const droppedReplies =
    typeof summary.data.droppedRepliesCount === "number"
      ? summary.data.droppedRepliesCount
      : 0;

  // Derive missing users from missingCommentDetails
  const missingUsers = summary.data.missingCommentDetails
    ? Array.from(
        new Set(summary.data.missingCommentDetails.map((c) => c.sender))
      )
    : [];

  const hasMismatch = missingUsers.length > 0;
  const missingCount =
    missingUsers.length || Math.abs(commentCount - sourceCount);

  return (
    <div className="summary-row">
      <div className="summary-header" onClick={() => setExpanded(!expanded)}>
        <div className="header-main">
          <h3 className="title">
            {summary.title}
            {hasMismatch && (
              <span
                className="warning-indicator"
                title={
                  missingUsers.length > 0
                    ? `Missing users: ${missingUsers.join(", ")}`
                    : `${missingCount} ${
                        commentCount > sourceCount
                          ? "missing sources"
                          : "extra sources"
                      }`
                }
              >
                ⚠️
              </span>
            )}
          </h3>
          <div className="metadata">
            <span className="generated-time">
              Generated: {formatAsDMY(summary.data.generatedAt)}
            </span>
            <span className="separator">•</span>
            <span className="proposal-time">
              Proposal: {formatAsDMY(summary.time)}
            </span>
            <span className="separator">•</span>
            <span className={`comments ${hasMismatch ? "mismatch" : ""}`}>
              {commentCount} comments
            </span>
            {uniqueUsers > 0 && (
              <>
                <span className="separator">•</span>
                <span className="unique-users">{uniqueUsers} users</span>
              </>
            )}
            <span className="separator">•</span>
            <span className={`sources ${hasMismatch ? "mismatch" : ""}`}>
              {sourceCount} in summary
            </span>
            {missingUsers.length > 0 && (
              <>
                <span className="separator">•</span>
                <span className="mismatch-info">
                  {missingUsers.length} missing
                </span>
              </>
            )}
            {droppedReplies > 0 && (
              <>
                <span className="separator">•</span>
                <span className="dropped-replies">
                  {droppedReplies} replies dropped
                </span>
              </>
            )}
            {summary.data.model && (
              <>
                <span className="separator">•</span>
                <span className="model">{summary.data.model}</span>
              </>
            )}
          </div>
        </div>
        <button className="expand-btn">{expanded ? "▼" : "▶"}</button>
      </div>

      {expanded && (
        <div className="summary-content">
          <div className="key-info">
            <div className="info-item full-width">
              <strong>Redis Key:</strong> <code>{summary.key}</code>
            </div>
            <div className="info-item">
              <strong>Identifier:</strong> {summary.identifier}
            </div>
            <div className="info-item">
              <strong>Generated:</strong>{" "}
              {new Date(summary.data.generatedAt).toLocaleString()} (
              {Math.floor(new Date(summary.data.generatedAt).getTime() / 1000)})
            </div>
            <div className="info-item">
              <strong>Cached:</strong>{" "}
              {new Date(summary.data.cachedAt).toLocaleString()} (
              {Math.floor(new Date(summary.data.cachedAt).getTime() / 1000)})
            </div>
            <div className="info-item">
              <strong>Total Comments:</strong> {commentCount}
            </div>
            <div className="info-item">
              <strong>Unique Users:</strong> {uniqueUsers || "N/A"}
            </div>
            <div className="info-item">
              <strong>Sources in Summary:</strong> {sourceCount}
            </div>
            {droppedReplies > 0 && (
              <div className="info-item">
                <strong>Dropped Replies:</strong> {droppedReplies}
              </div>
            )}
            <div className="info-item">
              <strong>Hash:</strong>{" "}
              <code>{summary.data.commentsHash.substring(0, 12)}...</code>
            </div>
            <div className="info-item">
              <strong>Prompt Version:</strong> {summary.data.promptVersion}
            </div>
            {summary.data.summaryBatchSize > 0 && (
              <div className="info-item">
                <strong>Batch Size:</strong> {summary.data.summaryBatchSize}
              </div>
            )}
          </div>

          {hasContent && (
            <div className="outcomes">
              {summary.data.P1.summary && (
                <div className="outcome">
                  <h4>P1 ({summary.data.P1.sources.length} sources)</h4>
                  <ul>
                    {formatSummaryBullets(summary.data.P1.summary).map(
                      (bullet, i) => (
                        <li
                          key={i}
                          dangerouslySetInnerHTML={{
                            __html: renderMarkdownContent(bullet),
                          }}
                        />
                      )
                    )}
                  </ul>
                  {summary.data.P1.sources.length > 0 && (
                    <details className="sources-list">
                      <summary>
                        View sources ({summary.data.P1.sources.length})
                      </summary>
                      <div className="sources-grid">
                        {summary.data.P1.sources.map(
                          ([username, timestamp], i) => (
                            <span key={i} className="source-item">
                              <strong>{username}</strong>
                              <span className="source-time">
                                {new Date(timestamp * 1000).toLocaleString()}
                              </span>
                            </span>
                          )
                        )}
                      </div>
                    </details>
                  )}
                </div>
              )}

              {summary.data.P2.summary && (
                <div className="outcome">
                  <h4>P2 ({summary.data.P2.sources.length} sources)</h4>
                  <ul>
                    {formatSummaryBullets(summary.data.P2.summary).map(
                      (bullet, i) => (
                        <li
                          key={i}
                          dangerouslySetInnerHTML={{
                            __html: renderMarkdownContent(bullet),
                          }}
                        />
                      )
                    )}
                  </ul>
                  {summary.data.P2.sources.length > 0 && (
                    <details className="sources-list">
                      <summary>
                        View sources ({summary.data.P2.sources.length})
                      </summary>
                      <div className="sources-grid">
                        {summary.data.P2.sources.map(
                          ([username, timestamp], i) => (
                            <span key={i} className="source-item">
                              <strong>{username}</strong>
                              <span className="source-time">
                                {new Date(timestamp * 1000).toLocaleString()}
                              </span>
                            </span>
                          )
                        )}
                      </div>
                    </details>
                  )}
                </div>
              )}

              {summary.data.P3.summary && (
                <div className="outcome">
                  <h4>P3 ({summary.data.P3.sources.length} sources)</h4>
                  <ul>
                    {formatSummaryBullets(summary.data.P3.summary).map(
                      (bullet, i) => (
                        <li
                          key={i}
                          dangerouslySetInnerHTML={{
                            __html: renderMarkdownContent(bullet),
                          }}
                        />
                      )
                    )}
                  </ul>
                  {summary.data.P3.sources.length > 0 && (
                    <details className="sources-list">
                      <summary>
                        View sources ({summary.data.P3.sources.length})
                      </summary>
                      <div className="sources-grid">
                        {summary.data.P3.sources.map(
                          ([username, timestamp], i) => (
                            <span key={i} className="source-item">
                              <strong>{username}</strong>
                              <span className="source-time">
                                {new Date(timestamp * 1000).toLocaleString()}
                              </span>
                            </span>
                          )
                        )}
                      </div>
                    </details>
                  )}
                </div>
              )}

              {summary.data.P4.summary && (
                <div className="outcome">
                  <h4>P4 ({summary.data.P4.sources.length} sources)</h4>
                  <ul>
                    {formatSummaryBullets(summary.data.P4.summary).map(
                      (bullet, i) => (
                        <li
                          key={i}
                          dangerouslySetInnerHTML={{
                            __html: renderMarkdownContent(bullet),
                          }}
                        />
                      )
                    )}
                  </ul>
                  {summary.data.P4.sources.length > 0 && (
                    <details className="sources-list">
                      <summary>
                        View sources ({summary.data.P4.sources.length})
                      </summary>
                      <div className="sources-grid">
                        {summary.data.P4.sources.map(
                          ([username, timestamp], i) => (
                            <span key={i} className="source-item">
                              <strong>{username}</strong>
                              <span className="source-time">
                                {new Date(timestamp * 1000).toLocaleString()}
                              </span>
                            </span>
                          )
                        )}
                      </div>
                    </details>
                  )}
                </div>
              )}

              {summary.data.Uncategorized?.summary && (
                <div className="outcome">
                  <h4>
                    Uncategorized ({summary.data.Uncategorized.sources.length}{" "}
                    sources)
                  </h4>
                  <ul>
                    {formatSummaryBullets(
                      summary.data.Uncategorized.summary
                    ).map((bullet, i) => (
                      <li
                        key={i}
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdownContent(bullet),
                        }}
                      />
                    ))}
                  </ul>
                  {summary.data.Uncategorized.sources.length > 0 && (
                    <details className="sources-list">
                      <summary>
                        View sources (
                        {summary.data.Uncategorized.sources.length})
                      </summary>
                      <div className="sources-grid">
                        {summary.data.Uncategorized.sources.map(
                          ([username, timestamp], i) => (
                            <span key={i} className="source-item">
                              <strong>{username}</strong>
                              <span className="source-time">
                                {new Date(timestamp * 1000).toLocaleString()}
                              </span>
                            </span>
                          )
                        )}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          )}

          {summary.data.missingCommentDetails &&
            summary.data.missingCommentDetails.length > 0 && (
              <div className="missing-section">
                <div className="missing-comments">
                  <h4>
                    Missing Comments (
                    {summary.data.missingCommentDetails.length})
                  </h4>
                  <div className="missing-list">
                    {summary.data.missingCommentDetails.map((comment, i) => (
                      <div key={i} className="missing-comment">
                        <strong>{comment.sender}</strong> at{" "}
                        {new Date(comment.time * 1000).toLocaleString()}:
                        <p>{comment.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export default function AllSummaries() {
  const [summaries, setSummaries] = useState<AllSummariesResponse["summaries"]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string>("");
  const [warming, setWarming] = useState(false);
  const [warmElapsedMs, setWarmElapsedMs] = useState(0);
  const [warmSuccess, setWarmSuccess] = useState<boolean | null>(null);
  const [warmResult, setWarmResult] = useState<WarmSummaryResponse | null>(
    null
  );
  const [warmError, setWarmError] = useState<string | null>(null);

  useEffect(() => {
    void fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/fetch-all-cached-summaries");

      if (!response.ok) {
        const errorDataUnknown = await response.json();
        const message =
          isErrorResponse(errorDataUnknown) &&
          typeof errorDataUnknown.error === "string"
            ? errorDataUnknown.error
            : "Failed to fetch summaries";
        throw new Error(message);
      }

      const dataUnknown = await response.json();
      if (!isAllSummariesResponse(dataUnknown)) {
        throw new Error("Invalid response format from server");
      }
      const sortedByGenerated = [...dataUnknown.summaries].sort((a, b) => {
        const aTime = new Date(a.data.generatedAt).getTime();
        const bTime = new Date(b.data.generatedAt).getTime();
        return bTime - aTime; // Most recent first
      });
      setSummaries(sortedByGenerated);
      setLastFetched(dataUnknown.fetchedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const warmSummaries = async () => {
    if (warming) return;
    setWarming(true);
    setWarmElapsedMs(0);
    setWarmSuccess(null);
    setWarmResult(null);
    setWarmError(null);

    const start = Date.now();
    const timer = setInterval(() => {
      setWarmElapsedMs(Date.now() - start);
    }, 100);

    try {
      const response = await fetch("/api/warm-summary", { method: "POST" });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to warm summaries");
      }
      const data = (await response.json()) as
        | WarmSummaryResponse
        | ErrorResponse;
      if (isErrorResponse(data) && typeof data.error === "string") {
        throw new Error(data.error);
      }
      setWarmResult(data as WarmSummaryResponse);
      setWarmSuccess(true);
    } catch (err) {
      setWarmError(err instanceof Error ? err.message : "An error occurred");
      setWarmSuccess(false);
    } finally {
      clearInterval(timer);
      setWarmElapsedMs(Date.now() - start);
      setWarming(false);
    }
  };

  return (
    <div className="container">
      <style jsx>{`
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e0e0e0;
        }

        h1 {
          color: #333;
          font-size: 28px;
          margin: 0;
        }

        .header-info {
          text-align: right;
          color: #666;
          font-size: 14px;
        }

        .refresh-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 8px;
        }

        .refresh-btn:hover {
          background: #0056b3;
        }

        .refresh-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .warm-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 8px;
          margin-left: 8px;
        }

        .warm-btn:hover {
          background: #c82333;
        }

        .warm-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .loading,
        .error {
          text-align: center;
          padding: 40px;
          font-size: 16px;
        }

        .error {
          color: #dc3545;
        }

        .summary-count {
          margin-bottom: 20px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 4px;
          font-size: 14px;
          color: #666;
        }

        :global(.summary-row) {
          margin-bottom: 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          background: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        :global(.summary-header) {
          padding: 15px 20px;
          background: #f8f9fa;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background 0.2s;
        }

        :global(.summary-header:hover) {
          background: #e9ecef;
        }

        :global(.header-main) {
          flex: 1;
        }

        :global(.title) {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        :global(.warning-indicator) {
          font-size: 16px;
          cursor: help;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        :global(.metadata) {
          color: #666;
          font-size: 13px;
        }

        :global(.metadata .mismatch) {
          color: #ff6b35;
          font-weight: 600;
        }

        :global(.mismatch-info) {
          color: #ff6b35;
          font-weight: 600;
        }

        :global(.unique-users) {
          color: #007bff;
          font-weight: 500;
        }

        :global(.dropped-replies) {
          color: #999;
          font-size: 12px;
        }

        :global(.separator) {
          margin: 0 8px;
          color: #ccc;
        }

        :global(.expand-btn) {
          background: none;
          border: none;
          font-size: 16px;
          color: #666;
          cursor: pointer;
          padding: 5px 10px;
          transition: transform 0.2s;
        }

        :global(.summary-content) {
          padding: 20px;
          border-top: 1px solid #e0e0e0;
        }

        :global(.key-info) {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 10px;
          margin-bottom: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        :global(.info-item) {
          font-size: 13px;
          color: #555;
        }

        :global(.info-item.full-width) {
          grid-column: 1 / -1;
          word-break: break-all;
        }

        :global(.info-item strong) {
          color: #333;
          margin-right: 5px;
        }

        :global(.info-item code) {
          background: #e9ecef;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: "Courier New", monospace;
          font-size: 12px;
        }

        :global(.outcomes) {
          margin-top: 20px;
        }

        :global(.outcome) {
          margin-bottom: 25px;
        }

        :global(.outcome h4) {
          color: #333;
          font-size: 16px;
          margin: 0 0 10px 0;
          padding: 8px 12px;
          background: #e8f4fd;
          border-left: 4px solid #007bff;
        }

        :global(.outcome ul) {
          margin: 10px 0;
          padding-left: 25px;
        }

        :global(.outcome li) {
          margin-bottom: 12px;
          line-height: 1.6;
          color: #444;
          word-break: break-word;
        }

        :global(.outcome a) {
          color: #007bff;
          text-decoration: none;
          word-break: break-all;
        }

        :global(.outcome a:hover) {
          text-decoration: underline;
        }

        :global(.sources-list) {
          margin-top: 15px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        :global(.sources-list summary) {
          cursor: pointer;
          font-size: 13px;
          color: #666;
          font-weight: 600;
          padding: 5px;
          user-select: none;
        }

        :global(.sources-list summary:hover) {
          color: #333;
        }

        :global(.sources-grid) {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 10px;
          margin-top: 10px;
          padding: 10px;
        }

        :global(.source-item) {
          display: flex;
          flex-direction: column;
          padding: 8px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          font-size: 12px;
        }

        :global(.source-item strong) {
          color: #333;
          margin-bottom: 2px;
          word-break: break-word;
        }

        :global(.source-time) {
          color: #999;
          font-size: 11px;
        }

        :global(.missing-section) {
          margin-top: 25px;
          padding: 15px;
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 4px;
        }

        :global(.missing-comments) {
          margin-bottom: 0;
        }

        :global(.missing-comments h4) {
          color: #856404;
          margin: 0 0 15px 0;
          font-size: 16px;
        }

        :global(.missing-comment) {
          margin-bottom: 15px;
          padding: 10px;
          background: white;
          border-radius: 4px;
          font-size: 13px;
        }

        :global(.missing-comment strong) {
          color: #856404;
        }

        :global(.missing-comment p) {
          margin: 5px 0 0 0;
          color: #666;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        .empty-state h2 {
          color: #999;
          font-size: 20px;
          margin-bottom: 10px;
        }

        .warm-status {
          margin-top: 8px;
          font-size: 13px;
          color: #666;
        }

        .warm-status .success {
          color: #28a745;
          font-weight: 600;
          margin-right: 6px;
        }

        .warm-status .error {
          color: #dc3545;
          font-weight: 600;
          margin-right: 6px;
        }
      `}</style>

      <div className="header">
        <div>
          <h1>All Discord Thread Summaries</h1>
        </div>
        <div className="header-info">
          {lastFetched && (
            <div>Last fetched: {new Date(lastFetched).toLocaleString()}</div>
          )}
          <div>
            <button
              className="refresh-btn"
              onClick={() => void fetchSummaries()}
              disabled={loading || warming}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
            <button
              className="warm-btn"
              onClick={() => void warmSummaries()}
              disabled={warming}
              title="Scan recent on-chain requests and warm cached summaries"
            >
              {warming ? "Warming..." : "Warm Summaries"}
            </button>
          </div>
          {(warming || warmSuccess !== null) && (
            <div className="warm-status">
              {warming && (
                <span>⏳ Warming... {formatDuration(warmElapsedMs)}</span>
              )}
              {!warming && warmSuccess === true && (
                <span>
                  <span className="success">✔</span>
                  Done in {formatDuration(warmElapsedMs)}
                  {warmResult
                    ? ` — processed ${warmResult.processed}, errors ${warmResult.errors}`
                    : ""}
                </span>
              )}
              {!warming && warmSuccess === false && (
                <span>
                  <span className="error">✖</span>
                  Failed in {formatDuration(warmElapsedMs)}
                  {warmError ? ` — ${warmError}` : ""}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {loading && <div className="loading">Loading summaries...</div>}

      {error && <div className="error">Error: {error}</div>}

      {!loading && !error && summaries.length > 0 && (
        <>
          <div className="summary-count">
            Found {summaries.length} cached{" "}
            {summaries.length === 1 ? "summary" : "summaries"}
          </div>
          {summaries.map((summary) => (
            <SummaryRow key={summary.key} summary={summary} />
          ))}
        </>
      )}

      {!loading && !error && summaries.length === 0 && (
        <div className="empty-state">
          <h2>No summaries found</h2>
          <p>There are no cached summaries in the database.</p>
        </div>
      )}
    </div>
  );
}
