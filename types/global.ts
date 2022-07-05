export type DropdownItemT = {
  value: string;
  label: string;
  secondaryLabel?: string;
};

export type DisputeT = {
  title: string;
  origin: DisputeOriginT;
};

export enum DisputeOriginT {
  UMA = "UMA",
  Polymarket = "Polymarket",
}
