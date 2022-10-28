import { ContractReceipt } from "ethers";
import { useNotificationsContext } from "hooks";
import { ReactNode } from "react";

export function useNotifySettledContractInteraction() {
  const { addSuccessNotification, addErrorNotification, removeNotification } = useNotificationsContext();

  return ({
    contractReceipt,
    error,
    successMessage,
    errorMessage,
  }: {
    contractReceipt: ContractReceipt | undefined;
    error: unknown;
    successMessage: ReactNode;
    errorMessage: ReactNode;
  }) => {
    if (!contractReceipt) return;

    const { transactionHash } = contractReceipt;

    removeNotification(transactionHash);

    if (error) {
      addErrorNotification(errorMessage, transactionHash);
    } else {
      addSuccessNotification(successMessage, transactionHash);
    }
  };
}
