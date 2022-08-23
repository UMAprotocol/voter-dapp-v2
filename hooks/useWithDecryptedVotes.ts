import { decryptMessage } from "helpers/crypto";
import { useState, useEffect } from "react";
import { DecryptedVoteT, WithDecryptedVoteT, WithEncryptedVoteT, SigningKeys } from "types/global";

export default function useWithDecryptedVotes(
  withEncryptedVotes: WithEncryptedVoteT[],
  address: string | undefined,
  signingKeys: SigningKeys
) {
  const [withDecryptedVotes, setWithDecryptedVotes] = useState<WithDecryptedVoteT[]>([]);

  useEffect(() => {
    (async () => {
      if (!withEncryptedVotes?.length || !address) return;

      const privateKey = signingKeys[address].privateKey;
      const decryptedVotes: WithDecryptedVoteT[] = await decryptVotes(privateKey, withEncryptedVotes);
      setWithDecryptedVotes(decryptedVotes);

      async function decryptVotes(privateKey: string, withEncryptedVotes: WithEncryptedVoteT[]) {
        return await Promise.all(
          withEncryptedVotes.map(async (vote) => {
            const { encryptedVote } = vote;

            let decryptedVote: DecryptedVoteT | undefined;

            if (encryptedVote) {
              const decryptedVoteString = await decryptMessage(privateKey, encryptedVote);
              decryptedVote = JSON.parse(decryptedVoteString);
            }

            return {
              ...vote,
              decryptedVote,
            };
          })
        );
      }
    })();
  }, [address, JSON.stringify(withEncryptedVotes), signingKeys]);

  return withDecryptedVotes;
}
