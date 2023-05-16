import { useQuery } from "@tanstack/react-query";
import { decryptedVotesKey } from "constant";
import { decryptMessage } from "helpers";
import { useHandleError, useWalletContext } from "hooks";
import {
  DecryptedVoteT,
  DecryptedVotesByKeyT,
  EncryptedVotesByKeyT,
} from "types";

export function useDecryptedVotes(
  address: string | undefined,
  encryptedVotes: EncryptedVotesByKeyT | undefined
) {
  const { signingKeys, isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const signingKey = address ? signingKeys[address] : undefined;

  const queryResult = useQuery({
    queryKey: [decryptedVotesKey, encryptedVotes, signingKey?.privateKey],
    queryFn: () => decryptVotes(signingKey?.privateKey, encryptedVotes),
    enabled: !isWrongChain,
    onError,
  });

  return queryResult;
}

async function decryptVotes(
  privateKey: string | undefined,
  encryptedVotes: EncryptedVotesByKeyT | undefined
) {
  const decryptedVotes: DecryptedVotesByKeyT = {};
  if (
    !privateKey ||
    !encryptedVotes ||
    Object.keys(encryptedVotes).length === 0
  )
    return {};

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
