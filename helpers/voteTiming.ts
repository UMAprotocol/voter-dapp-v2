import { numPhases, phaseLength, roundLength } from "constants/voteTiming";

export function computeRoundId() {
  return Math.floor(Date.now() / 1000 / roundLength);
}

export function computePhase() {
  return Math.floor(Date.now() / 1000 / phaseLength) % numPhases;
}

export function getPhase() {
  const phase = computePhase();

  if (phase === 0) {
    return "commit";
  }
  return "reveal";
}

export function computeRoundEndTime() {
  const roundLength = phaseLength * 2;
  return roundLength * (computeRoundId() + 1);
}

export function computePhaseEndTime() {
  const phase = computePhase();

  if (phase === 0) {
    return computeRoundEndTime() - phaseLength;
  } else {
    return computeRoundEndTime();
  }
}

export function computePhaseEndTimeMilliseconds() {
  return computePhaseEndTime() * 1000;
}

export function computeMillisecondsUntilPhaseEnds() {
  const phaseEndTimeMilliseconds = computePhaseEndTimeMilliseconds();
  const diff = phaseEndTimeMilliseconds - Date.now();
  return diff;
}
