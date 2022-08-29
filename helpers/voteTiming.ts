import { numPhases, phaseLength, roundLength } from "constants/voteTiming";

/** Computes the round ID with the current time */
export function computeRoundId() {
  return Math.floor(Date.now() / 1000 / roundLength);
}

/** Computes the phase with the current time */
export function computePhase() {
  return Math.floor(Date.now() / 1000 / phaseLength) % numPhases;
}

/** Returns a string of the current phase */
export function getPhase() {
  const phase = computePhase();

  if (phase === 0) {
    return "commit";
  }
  return "reveal";
}

/** Computes the time when the voting round (commit and reveal) will end in Unix seconds */
export function computeRoundEndTime() {
  const roundLength = phaseLength * 2;
  return roundLength * (computeRoundId() + 1);
}

/** Computes the time the current phase of the voting round (commit or reveal) will end in Unix seconds */
export function computePhaseEndTime() {
  const phase = computePhase();

  if (phase === 0) {
    // when phase is `commit`, the phase ends when we are halfway through the round
    return computeRoundEndTime() - phaseLength;
  } else {
    // when phase is `reveal`, the phase ends when we are at the end of the round
    return computeRoundEndTime();
  }
}

/** Computes the time the current phase of the voting round (commit or reveal) will end in milliseconds */
export function computePhaseEndTimeMilliseconds() {
  return computePhaseEndTime() * 1000;
}

/** Computes the number of milliseconds until the current phase of the voting round (commit or reveal) will end */
export function computeMillisecondsUntilPhaseEnds() {
  const phaseEndTimeMilliseconds = computePhaseEndTimeMilliseconds();
  const diff = phaseEndTimeMilliseconds - Date.now();
  return diff;
}
