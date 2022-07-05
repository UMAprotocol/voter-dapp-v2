export type DropdownItem = {
  value: string;
  label: string;
  secondaryLabel?: string;
};

export type Dispute = {
  title: string;
  origin: "UMA" | "Polymarket";
};
