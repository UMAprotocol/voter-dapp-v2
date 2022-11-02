export type DelegationStatusT =
  | "no-wallet-connected"
  | "no-delegation"
  | "delegate"
  | "delegator"
  | "delegate-pending"
  | "delegator-pending";

export type DelegationEventT = {
  delegate: string;
  delegator: string;
  transactionHash: string;
};
