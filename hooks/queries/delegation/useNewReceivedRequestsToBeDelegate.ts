import { useContractsContext } from "hooks/contexts/useContractsContext";
import { useUserContext } from "hooks/contexts/useUserContext";
import { useWalletContext } from "hooks/contexts/useWalletContext";
import { useEffect, useState } from "react";

export function useNewReceivedRequestsToBeDelegate() {
  const { voting } = useContractsContext();
  const { provider } = useWalletContext();
  const { address } = useUserContext();
  const [newRequests, setNewRequests] = useState(0);

  useEffect(() => {
    if (!provider || !address) return;

    const filter = voting.filters.DelegateSet(null, address);

    provider.on(filter, () => {
      setNewRequests((prev) => prev + 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, address]);

  return newRequests;
}
