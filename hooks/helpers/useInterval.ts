import { useIsomorphicLayoutEffect } from "hooks/helpers";
import { useEffect, useRef } from "react";

/** Allows declarative use of `setInterval` in React hooks
 *
 * See https://usehooks-ts.com/react-hook/use-interval and https://overreacted.io/making-setinterval-declarative-with-react-hooks/ for more details.
 */
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  // Remember the latest callback if it changes.
  useIsomorphicLayoutEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    // Note: 0 is a valid value for delay.
    if (!delay && delay !== 0) {
      return;
    }

    const id = setInterval(() => savedCallback.current(), delay);

    return () => clearInterval(id);
  }, [delay]);
}

export default useInterval;
