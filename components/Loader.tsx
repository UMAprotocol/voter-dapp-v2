import { LoadingSkeleton } from "components";
import type { ComponentProps, ReactNode } from "react";
type LoadingSkeletonProps = ComponentProps<typeof LoadingSkeleton>;

type UnknownOrUndefined = unknown | undefined;
type Props = LoadingSkeletonProps & {
  children: ReactNode;
  dataToWatch: UnknownOrUndefined | UnknownOrUndefined[];
};

export function Loader({ children, dataToWatch, ...delegated }: Props) {
  const isLoading = Array.isArray(dataToWatch)
    ? dataToWatch.some((data) => data === undefined)
    : dataToWatch === undefined;

  if (isLoading) return <LoadingSkeleton {...delegated} />;

  return <>{children}</>;
}
