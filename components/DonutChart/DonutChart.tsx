/* 
Adapted from: https://codesandbox.io/s/yw3zyr0q2j?file=/src/DonutView.jsx
*/
import styled, { CSSProperties } from "styled-components";
import { radiansToDegrees, angleForArcLength, degreesToRadians, computePercentages, computeColors } from "./helpers";

interface Props {
  data: { value: number; label: string }[];
  /**
   * The viewBox size. Coordinates are computed within this coordinate space
   */
  size?: number;
  /**
   * The diameter of the chart's inner hole in local coordinate space units
   */
  hole?: number;
  /**
   * The size of the gap between chart segments, in local coordinate space units
   */
  gapSize?: number;
}
export function DonutChart({ data, size = 200, hole = 160, gapSize = 1 }: Props) {
  /**
   * The center of the viewBox, center of the chart
   */
  const center = size / 2;
  /**
   * The thickness of the chart segments for the given size and hole
   */
  const thickness = (size - hole) / 2;
  /**
   * The outer radius of the chart
   */
  const radiusOuter = size / 2;
  /**
   * The inner radius of the chart
   */
  const radiusInner = radiusOuter - thickness;
  /**
   * Compute the angle offset required to establish the gaps between segments at the inner edge
   */
  const gapAngleOffsetInner = radiansToDegrees(angleForArcLength(gapSize, radiusInner));
  /**
   * Compute the angle offset required to establish the gaps between segments at the outer edge
   */
  const gapAngleOffsetOuter = radiansToDegrees(angleForArcLength(gapSize, radiusOuter));
  /**
   * The minimum angle that won't be swallowed by the gap offsets at the inner edge.
   * Used to compute the minimum value that won't get swallowed (minimumValue defined below)
   */
  const minimumAngleDeg = radiansToDegrees(angleForArcLength(gapSize * 2, radiusInner));

  /**
   * The minimum value that won't get swallowed by the gap offsets at the inner edge
   */
  const minimumValue = minimumAngleDeg / 360;

  /**
   * Computes an x/y coordinate for the given angle and radius
   * @param {number} deg - The angle in degrees
   * @param {number} r  - The radius
   * @returns {Array} - An x/y coordinate for the point at the given angle and radius
   */
  const coords = (deg: number, r: number) => {
    const rad = degreesToRadians(deg);

    return [center - Math.cos(rad) * r, center - Math.sin(rad) * r];
  };

  function makeSegmentPath(
    { paths, subtotal }: { paths: JSX.Element[]; subtotal: number },
    { percent, color }: { percent: number; color: string },
    i: number
  ) {
    const startAngle = subtotal * 360 + 90; // +90 so we start at 12 o'clock
    const endAngle = startAngle + percent * 360;

    // no gaps for values beneath the minimum threshold
    const useGap = percent >= minimumValue;
    const innerGap = useGap ? gapAngleOffsetInner : 0;
    const outerGap = useGap ? gapAngleOffsetOuter : 0;

    const startAngleInner = startAngle + innerGap;
    const startAngleOuter = startAngle + outerGap;
    const endAngleInner = endAngle - innerGap;
    const endAngleOuter = endAngle - outerGap;

    const [x1, y1] = coords(startAngleInner, radiusInner); // start point on inner circle
    const [x2, y2] = coords(startAngleOuter, radiusOuter); // start point on outer circle
    const [x3, y3] = coords(endAngleOuter, radiusOuter); // end point on outer circle
    const [x4, y4] = coords(endAngleInner, radiusInner); // end point on inner circle

    const largeArc = percent > 0.5 ? 1 : 0;
    const sweepOuter = 1;
    const sweepInner = 0;

    const commands = [
      // move to start angle coordinate, inner radius
      `M${x1} ${y1}`,

      // line to start angle coordinate, outer radius
      `L${x2} ${y2}`,

      // arc to end angle coordinate, outer radius
      `A${radiusOuter} ${radiusOuter} 0 ${largeArc} ${sweepOuter} ${x3} ${y3}`,

      // line to end angle coordinate, inner radius
      `L${x4} ${y4}`,

      // arc back to start angle coordinate, inner radius
      `A${radiusInner} ${radiusInner} 0 ${largeArc} ${sweepInner} ${x1} ${y1}`,
    ];

    paths.push(<path key={i} fill={color} stroke="none" d={commands.join(" ")} />);

    return {
      paths,
      subtotal: subtotal + percent,
    };
  }

  const withPercentages = computePercentages(data);
  const withColors = computeColors(withPercentages);

  return data.length ? (
    <Wrapper style={{ "--size": size + "px" } as CSSProperties}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {withColors.reduce(makeSegmentPath, { paths: [], subtotal: 0 }).paths}
      </svg>
    </Wrapper>
  ) : null;
}

const Wrapper = styled.div`
  width: var(--size);
  height: var(--size);
`;
