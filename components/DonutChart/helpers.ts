import { InputDataT } from "types/global";

export const degreesToRadians = (degrees: number) => degrees * (Math.PI / 180);
export const radiansToDegrees = (radians: number) => radians / (Math.PI / 180);

export function convertToNumbers(data: InputDataT[]) {
  return data.map(({ value, label }) => {
    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) {
      throw new Error(`Non-numeric string used as value in input data: ${value}`);
    }
    return {
      value: numberValue,
      label,
    };
  });
}

export function computePercentages(data: InputDataT[]) {
  // convert values from strings to numbers if needed
  const asNumbers = convertToNumbers(data);
  // eliminate values of zero or less; protects against division by zero when computing percentages
  const filtered = asNumbers?.filter(({ value }) => value > 0) ?? [];
  const total = filtered.reduce((t, { value = 0 }) => t + value, 0);

  return filtered.map((item) => ({
    ...item,
    percent: item.value / total,
  }));
}

export function computeColors(
  data: {
    percent: number;
    value: number;
    label: string;
  }[]
) {
  const lightest = 90;

  return data.map((item, i) => ({
    ...item,
    color: `hsl(0, 100%, ${determineLightness(lightest, i)}%)`,
  }));
}

function determineLightness(initialLightness: number, index: number) {
  const scalingFactor = 18;
  return initialLightness - index * scalingFactor;
}

/**
 * Find the angle that will produce an arc of a given length at a given radius.
 * Using this to allow for gaps between the segments. Returns angle in radians
 * arcLength = radius * angleInRadians
 *
 * @param {number} arcLength - the sought arc length in local coordinate space
 * @param {number} atRadius - the radius of the arc
 * @returns {number} - the angle in radians of an arc of the given length at the given radius
 */
export const angleForArcLength = (arcLength: number, atRadius: number): number => arcLength / atRadius;
