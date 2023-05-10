import { LoadingSkeleton } from "components";
import type { ComponentProps, ReactNode } from "react";
type LoadingSkeletonProps = ComponentProps<typeof LoadingSkeleton>;

type Props = LoadingSkeletonProps & {
  isLoading: boolean;
  children: ReactNode;
  isError?: boolean;
  error?: ReactNode;
};
export function Loader({
  isLoading,
  isError,
  children,
  error,
  ...delegated
}: Props) {
  if (isError && !!error) return <>{error}</>;

  if (isLoading) return <LoadingSkeleton {...delegated} />;

  return <>{children}</>;
}
