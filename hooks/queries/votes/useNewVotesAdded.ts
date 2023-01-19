import { useContractsContext } from "hooks/contexts/useContractsContext";
import { useWalletContext } from "hooks/contexts/useWalletContext";
import { useEffect, useState } from "react";

export function useNewVotesAdded() {
  const { voting } = useContractsContext();
  const { provider } = useWalletContext();
  const [newVotes, setNewVotes] = useState(0);
  const filter = voting.filters.RequestAdded(null, null, null);

  useEffect(() => {
    if (!provider) return;
    provider.on(filter, () => {
      setNewVotes((prev) => prev + 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  return newVotes;
}
