import { useNotificationsContext } from "hooks";
import { ContractInteractionNotificationT } from "types";

export function useContractInteractionNotifications() {
  const { addSuccessNotification, addErrorNotification, addPendingNotification, removeNotification } =
    useNotificationsContext();

  return ({
    contractReceipt,
    contractTransaction,
    error,
    successMessage,
    errorMessage,
    pendingMessage,
  }: ContractInteractionNotificationT) => {
    if (contractTransaction) {
      if (!pendingMessage) {
        throw new Error("Must provide pending message when contract transaction is provided");
      }

      addPendingNotification(pendingMessage, contractTransaction.hash);

      return;
    }

    if (contractReceipt) {
      if (!successMessage || !errorMessage) {
        throw new Error("Must provide success and error messages when contract receipt is provided");
      }

      const { transactionHash } = contractReceipt;

      removeNotification(transactionHash);

      if (error) {
        addErrorNotification(errorMessage, transactionHash);
      } else {
        addSuccessNotification(successMessage, transactionHash);
      }
    }
  };
}
