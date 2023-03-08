import {config} from "helpers/config"
export const phaseLength = config.phaseLength;
export const roundLength = phaseLength * 2;
export const numPhases = 2;
export const phaseLengthMilliseconds = phaseLength * 1000;
