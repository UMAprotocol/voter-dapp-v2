import { useContractsContext } from "hooks/contexts/useContractsContext";
import { useUserContext } from "hooks/contexts/useUserContext";
import { useWalletContext } from "hooks/contexts/useWalletContext";
import { useEffect, useState } from "react";

export function useNewReceivedRequestsToBeDelegate() {
  const { voting } = useContractsContext();
  const { provider } = useWalletContext();
  const { address } = useUserContext();
  const [newRequests, setNewRequests] = useState(0);
  const filter = voting.filters.DelegateSet(null, address);

  useEffect(() => {
    if (!provider) return;
    provider.on(filter, () => {
      setNewRequests((prev) => prev + 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  return newRequests;
}
