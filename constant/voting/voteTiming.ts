import { config } from "helpers/config";
export const phaseLength = config.phaseLength;
export const roundLength = phaseLength * 2;
export const numPhases = 2;
export const phaseLengthMilliseconds = phaseLength * 1000;
// how far back to scan for commit/reveal/encrypt events: they are filtered to
// the current round, which is at most `roundLength` old, so ~2 rounds of
// mainnet blocks (12s) is a safe window and keeps getLogs ranges RPC-friendly
export const voteEventsBlockLookback = Math.ceil((roundLength * 2) / 12);
