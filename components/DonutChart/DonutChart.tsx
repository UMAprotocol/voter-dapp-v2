/* 
  Adapted from: https://codesandbox.io/s/yw3zyr0q2j?file=/src/DonutView.jsx
*/
const degreesToRadians = (d: number) => d * (Math.PI / 180);
const radiansToDegrees = (r: number) => r / (Math.PI / 180);

/**
 * Find the angle that will produce an arc of a given length at a given radius.
 * Using this to allow for gaps between the segments. Returns angle in radians
 * arcLength = radius * angleInRadians
 *
 * @param {number} arcLength - the sought arc length in local coordinate space
 * @param {number} atRadius - the radius of the arc
 * @returns {number} - the angle in radians of an arc of the given length at the given radius
 */
const angleForArcLength = (arcLength: number, atRadius: number): number => arcLength / atRadius;

/**
 * The viewBox size. Coordinates are computed within this coordinate space
 */
const size = 100;

/**
 * The center of the viewBox, center of the chart
 */
const center = size / 2;

/**
 * The diameter of the chart's inner hole in local coordinate space units
 */
const hole = 55;

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
 * The size of the gap between chart segments, in local coordinate space units
 */
const gapSize = 1;

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
type Item = { value: number; label: string; color: string };
interface Props {
  colors: string[];
  items: Item[];
}
export function DonutChart({ colors = [], items }: Props) {
  function makeSegment(
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

    const fill = color || colors[i % colors.length];
    const fillProp = fill ? { fill } : {};

    paths.push(<path key={i} className="donut-chart-segment" {...fillProp} stroke="none" d={commands.join(" ")} />);

    return {
      paths,
      subtotal: subtotal + percent,
    };
  }

  function computePercentages(series: Item[]) {
    // eliminate values of zero or less; protects against division by zero when computing percentages
    const filtered = (series || []).filter(({ value }) => value > 0);
    const total = filtered.reduce((t, { value = 0 }) => t + value, 0);

    return filtered.map((item) => ({
      ...item,
      percent: item.value / total,
    }));
  }

  const itemsWithPercentages = computePercentages(items);

  return (
    <>
      {items.length ? (
        <div className="donut-chart-container">
          <div className="donut-chart">
            <svg viewBox={`0 0 ${size} ${size}`}>
              {itemsWithPercentages.reduce(makeSegment, { paths: [], subtotal: 0 }).paths}
            </svg>
          </div>
          <ul className="donut-chart-legend">
            {itemsWithPercentages.map(({ value, percent, label }) => (
              <li key={`${value}-${label}`}>
                <span className="donut-chart-legend-label">{label}</span>
                {/* <span className={cx('donut-chart-legend-value', legendValue)}>{value}</span> */}
                <span className="donut-chart-legend-percent">({Math.round(percent * 100)}%)</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}
