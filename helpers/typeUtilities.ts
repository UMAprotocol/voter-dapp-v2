import { UseQueryOptions } from "@tanstack/react-query";

export type NoNullValuesOfObject<T extends object> = {
  [Property in keyof T]-?: NonNullable<T[Property]>;
};

export type NonNullablePick<T, K extends keyof T> = {
  [P in K]-?: NonNullable<T[P]>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MakeQueryOptions<Fn extends (...args: any) => Promise<any>> =
  UseQueryOptions<
    Awaited<ReturnType<Fn>>,
    Error,
    Awaited<ReturnType<Fn>>,
    Array<string>
  >;
