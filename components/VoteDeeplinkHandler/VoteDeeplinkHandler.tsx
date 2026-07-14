import { useVoteDeeplink } from "hooks";

// Must render inside PanelProvider and VotesProvider; hooks cannot run in
// MyApp itself because the providers are created there.
export function VoteDeeplinkHandler() {
  useVoteDeeplink();
  return null;
}
