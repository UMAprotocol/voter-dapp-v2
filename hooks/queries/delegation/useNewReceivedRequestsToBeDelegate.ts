import { useContractsContext, useWalletContext } from "hooks";
import { useEffect, useState } from "react";

export function useNewReceivedRequestsToBeDelegate(
  address: string | undefined
) {
  const { voting } = useContractsContext();
  const { provider } = useWalletContext();
  const { isWrongChain } = useWalletContext();
  const [newRequests, setNewRequests] = useState(0);

  useEffect(() => {
    if (!provider || !address || isWrongChain) return;

    const filter = voting.filters.DelegateSet(null, address);

    provider.on(filter, () => {
      setNewRequests((prev) => prev + 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, address]);

  return newRequests;
}
