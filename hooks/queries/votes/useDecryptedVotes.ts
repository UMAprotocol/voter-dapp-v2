import { useQuery } from "@tanstack/react-query";
import { decryptedVotesKey } from "constant";
import { decryptMessage } from "helpers";
import {
  useEncryptedVotes,
  useHandleError,
  useUserContext,
  useWalletContext,
} from "hooks";
import {
  DecryptedVotesByKeyT,
  DecryptedVoteT,
  EncryptedVotesByKeyT,
} from "types";

export function useDecryptedVotes(roundId?: number) {
  const { address, signingKey } = useUserContext();
  const { isWrongChain } = useWalletContext();
  const { data: encryptedVotes } = useEncryptedVotes(roundId);
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery(
    [decryptedVotesKey, encryptedVotes, address],
    () => decryptVotes(signingKey?.privateKey, encryptedVotes),
    {
      enabled: !!address && !isWrongChain,
      initialData: {},
      onError,
    }
  );

  return queryResult;
}

async function decryptVotes(
  privateKey: string | undefined,
  encryptedVotes: EncryptedVotesByKeyT
) {
  const decryptedVotes: DecryptedVotesByKeyT = {};
  if (!privateKey || Object.keys(encryptedVotes).length === 0) return {};
  console.log("decrypting votes", encryptedVotes, privateKey);
  for await (const [uniqueKey, encryptedVote] of Object.entries(
    encryptedVotes
  )) {
    let decryptedVote: DecryptedVoteT;

    if (encryptedVote && privateKey) {
      const decryptedVoteString = await decryptMessage(
        privateKey,
        encryptedVote
      );
      decryptedVote = JSON.parse(decryptedVoteString) as DecryptedVoteT;

      if (decryptedVote) {
        decryptedVotes[uniqueKey] = decryptedVote;
      }
    }
  }

  return decryptedVotes;
}
