import { useQuery } from "@tanstack/react-query";
import { decryptedVotesKey } from "constant/queryKeys";
import { decryptMessage } from "helpers";
import { useAccountDetails, useEncryptedVotes, useHandleError, useWalletContext } from "hooks";
import { DecryptedVotesByKeyT, DecryptedVoteT, EncryptedVotesByKeyT } from "types";

export function useDecryptedVotes() {
  const { address } = useAccountDetails();
  const { signingKeys } = useWalletContext();
  const { data: encryptedVotes } = useEncryptedVotes();
  const onError = useHandleError();

  const queryResult = useQuery(
    [decryptedVotesKey, encryptedVotes, address],
    () => decryptVotes(signingKeys[address]?.privateKey, encryptedVotes),
    {
      refetchInterval: (data) => (data ? false : 100),
      enabled: !!address,
      initialData: {},
      onError,
    }
  );

  return queryResult;
}

async function decryptVotes(privateKey: string | undefined, encryptedVotes: EncryptedVotesByKeyT) {
  const decryptedVotes: DecryptedVotesByKeyT = {};
  if (!privateKey || Object.keys(encryptedVotes).length === 0) return {};

  for await (const [uniqueKey, encryptedVote] of Object.entries(encryptedVotes)) {
    let decryptedVote: DecryptedVoteT;

    if (encryptedVote && privateKey) {
      const decryptedVoteString = await decryptMessage(privateKey, encryptedVote);
      decryptedVote = JSON.parse(decryptedVoteString) as DecryptedVoteT;

      if (decryptedVote) {
        decryptedVotes[uniqueKey] = decryptedVote;
      }
    }
  }

  return decryptedVotes;
}
