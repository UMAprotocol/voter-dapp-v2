import { decryptMessage } from "helpers/crypto";
import { useState, useEffect } from "react";
import { SigningKeys, VoteT } from "types/global";

export default function useDecryptedVotesForUser(
  encryptedVotesForUser: VoteT[],
  address: string,
  signingKeys: SigningKeys
) {
  const [decryptedVotesForUser, setDecryptedVotesForUser] = useState<VoteT[]>([]);

  useEffect(() => {
    (async () => {
      if (!encryptedVotesForUser) return;

      async function decryptVotesForUser(privateKey: string, encryptedVotesForUser: VoteT[]) {
        return await Promise.all(
          encryptedVotesForUser.map(async (vote) => {
            const { encryptedVote } = vote;

            if (!encryptedVote) return vote;

            const decryptedVoteString = await decryptMessage(privateKey, encryptedVote);
            const decryptedVote = JSON.parse(decryptedVoteString);

            return {
              ...vote,
              decryptedVote,
            };
          })
        );
      }

      const privateKey = signingKeys[address].privateKey;
      const decryptedVotes = await decryptVotesForUser(privateKey, encryptedVotesForUser);
      setDecryptedVotesForUser(decryptedVotes);
    })();
  }, [address, encryptedVotesForUser, signingKeys]);

  return decryptedVotesForUser;
}
