import { LoadingSkeleton } from "components";
import type { ComponentProps, ReactNode } from "react";
type LoadingSkeletonProps = ComponentProps<typeof LoadingSkeleton>;

type UnknownOrUndefined = unknown | undefined;
type Props = LoadingSkeletonProps & {
  children: ReactNode;
  dataToWatch?: UnknownOrUndefined | UnknownOrUndefined[];
  isLoading?: boolean;
};

export function Loader({
  children,
  dataToWatch,
  isLoading,
  ...delegated
}: Props) {
  const showLoader =
    isLoading !== undefined
      ? isLoading
      : Array.isArray(dataToWatch)
      ? dataToWatch.some((data) => data === undefined)
      : dataToWatch === undefined;

  if (showLoader) return <LoadingSkeleton {...delegated} />;

  return <>{children}</>;
}
