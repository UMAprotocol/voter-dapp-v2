// Scrolls a vote row into view and flashes its highlight. The element must
// already be mounted: callers don't invoke this speculatively but set
// PanelContext's voteScrollTarget, which the row consumes in an effect once
// it has actually rendered (it may still be mounting during a page redirect
// or pagination jump).
export function scrollToAndHighlightVote(uniqueKey: string) {
  // uniqueKey embeds the decoded identifier — arbitrary on-chain bytes, so
  // escape it or a quote/backslash in it makes querySelector throw
  const el = document.querySelector(
    `[data-vote-key="${CSS.escape(uniqueKey)}"]`
  );
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.remove("vote-highlight");
  void (el as HTMLElement).offsetWidth;
  el.classList.add("vote-highlight");
  setTimeout(() => el.classList.remove("vote-highlight"), 1500);
}
