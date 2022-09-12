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
    [decryptedVotesKey],
    () => decryptVotes(address, signingKeys[address]?.publicKey, encryptedVotes),
    {
      refetchInterval: (data) => (data ? false : 100),
    }
  );

  return {
    decryptedVotes: data,
    decryptedVotesIsLoading: isLoading,
    decryptedVotesIsError: isError,
    decryptedVotesError: error,
  };
}

async function decryptVotes(
  address: string | undefined,
  privateKey: string | undefined,
  encryptedVotes: EncryptedVotesByKeyT
) {
  if (!Object.keys(encryptedVotes).length || !address || !privateKey) return undefined;

  const decryptedVotes: DecryptedVotesByKeyT = {};

  for await (const [uniqueKey, encryptedVote] of Object.entries(encryptedVotes)) {
    let decryptedVote: DecryptedVoteT;

    if (encryptedVote) {
      const decryptedVoteString = await decryptMessage(privateKey, encryptedVote);
      decryptedVote = JSON.parse(decryptedVoteString);

      if (decryptedVote) {
        decryptedVotes[uniqueKey] = decryptedVote;
      }
    }
  }

  return decryptedVotes;
}
