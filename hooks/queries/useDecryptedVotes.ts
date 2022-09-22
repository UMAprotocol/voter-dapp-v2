import { useQuery } from "@tanstack/react-query";
import { decryptedVotesKey } from "constants/queryKeys";
import { decryptMessage } from "helpers/crypto";
import { useWalletContext } from "hooks/contexts";
import { DecryptedVotesByKeyT, DecryptedVoteT, EncryptedVotesByKeyT } from "types/global";
import useAccountDetails from "./useAccountDetails";
import useEncryptedVotes from "./useEncryptedVotes";

export default function useDecryptedVotes() {
  const { address } = useAccountDetails();
  const { signingKeys } = useWalletContext();
  const { encryptedVotes } = useEncryptedVotes();

  const { isLoading, isError, data, error } = useQuery(
    [decryptedVotesKey, encryptedVotes, address],
    () => decryptVotes(signingKeys[address]?.privateKey, encryptedVotes),
    {
      refetchInterval: (data) => (data ? false : 100),
      enabled: !!address,
      initialData: {},
    }
  );

  return {
    decryptedVotes: data,
    decryptedVotesIsLoading: isLoading,
    decryptedVotesIsError: isError,
    decryptedVotesError: error,
  };
}

async function decryptVotes(privateKey: string | undefined, encryptedVotes: EncryptedVotesByKeyT) {
  const decryptedVotes: DecryptedVotesByKeyT = {};
  if (!privateKey || Object.keys(encryptedVotes).length === 0) return {};

  for await (const [uniqueKey, encryptedVote] of Object.entries(encryptedVotes)) {
    let decryptedVote: DecryptedVoteT;

    if (encryptedVote && privateKey) {
      const decryptedVoteString = await decryptMessage(privateKey, encryptedVote);
      decryptedVote = JSON.parse(decryptedVoteString);

      if (decryptedVote) {
        decryptedVotes[uniqueKey] = decryptedVote;
      }
    }
  }

  return decryptedVotes;
}
