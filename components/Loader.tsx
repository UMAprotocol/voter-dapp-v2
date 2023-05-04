import { LoadingSkeleton } from "components";
import type { ComponentProps, ReactNode } from "react";
type LoadingSkeletonProps = ComponentProps<typeof LoadingSkeleton>;

type Props = LoadingSkeletonProps & {
  data: ReactNode | undefined;
};

export function Loader({ data, ...delegated }: Props) {
  if (data) return <>{data}</>;

  return <LoadingSkeleton {...delegated} />;
}
