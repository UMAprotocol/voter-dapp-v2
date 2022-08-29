import { useEffect, useLayoutEffect } from "react";

/** Allows `useEffect`-based logic to be called on the server side.
 *
 * See https://usehooks-ts.com/react-hook/use-isomorphic-layout-effect for more details.
 */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default useIsomorphicLayoutEffect;
