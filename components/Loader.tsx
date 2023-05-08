import { LoadingSkeleton } from "components";
import type { ComponentProps, ReactNode } from "react";
type LoadingSkeletonProps = ComponentProps<typeof LoadingSkeleton>;

type UnknownOrUndefined = unknown | undefined;
type Props = LoadingSkeletonProps & {
  children: ReactNode;
  dataToWatch?: UnknownOrUndefined | UnknownOrUndefined[];
  isLoading?: boolean;
  override?: {
    isOverride: boolean;
    children: ReactNode;
  };
  error?: {
    isError: boolean;
    children: ReactNode;
  };
};
/**
 * Loader component is a versatile and customizable wrapper that handles different
 * loading, error, and override states for its children components.
 *
 * @component
 * @example
 * <Loader
 *   dataToWatch={data}
 *   isLoading={isLoading}
 *   override={{
 *     isOverride: false,
 *     children: <p>Custom override message</p>
 *   }}
 *   error={{
 *     isError: false,
 *     children: <p>Custom error message</p>
 *   }}
 * >
 *   <div>Content to be shown after loading is complete</div>
 * </Loader>
 *
 * @param props - The component's props.
 * @param children - The child components to be wrapped by the Loader.
 * @param dataToWatch - Data to watch for loading state.
 * @param isLoading - If true, it will show the loader. If not provided, it will use `dataToWatch` to determine the loading state.
 * @param override - An optional object to display custom override content.
 * @param override.isOverride - If true, it will show the custom override content.
 * @param override.children - The custom override content to be displayed.
 * @param error - An optional object to display custom error content.
 * @param error.isError - If true, it will show the custom error content.
 * @param error.children - The custom error content to be displayed.
 * @returns The Loader component with the appropriate state (loading, error, or children).
 */
export function Loader({
  children,
  dataToWatch,
  isLoading,
  override,
  error,
  ...delegated
}: Props) {
  if (error?.isError) return <>{error.children}</>;
  if (override?.isOverride) return <>{override.children}</>;

  const showLoader =
    isLoading !== undefined
      ? isLoading
      : Array.isArray(dataToWatch)
      ? dataToWatch.some((data) => data === undefined)
      : dataToWatch === undefined;

  if (showLoader) return <LoadingSkeleton {...delegated} />;

  return <>{children}</>;
}
