export type NoNullValuesOfObject<T extends object> = {
  [Property in keyof T]-?: NonNullable<T[Property]>;
};

export type NonNullablePick<T, K extends keyof T> = {
  [P in K]-?: NonNullable<T[P]>;
};
