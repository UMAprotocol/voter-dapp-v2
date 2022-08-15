import { decryptMessage } from "helpers/crypto";
import { useState, useEffect } from "react";
import { DecryptedVoteT, SigningKeys, VoteT } from "types/global";

export default function useWithDecryptedVotes(
  withEncryptedVotes: VoteT[] | undefined,
  address: string,
  signingKeys: SigningKeys
) {
  const [withDecryptedVotes, setWithDecryptedVotes] = useState<VoteT[]>([]);

  useEffect(() => {
    (async () => {
      if (!withEncryptedVotes?.length) return;

      const privateKey = signingKeys[address].privateKey;
      const decryptedVotes = await decryptVotes(privateKey, withEncryptedVotes);
      setWithDecryptedVotes(decryptedVotes);

      async function decryptVotes(privateKey: string, withEncryptedVotes: VoteT[]) {
        return await Promise.all(
          withEncryptedVotes.map(async (vote) => {
            const { encryptedVote } = vote;

            if (!encryptedVote) return vote;

            const decryptedVoteString = await decryptMessage(privateKey, encryptedVote);
            const decryptedVote: DecryptedVoteT = JSON.parse(decryptedVoteString);

            return {
              ...vote,
              decryptedVote,
            };
          })
        );
      }
    })();
  }, [address, withEncryptedVotes, signingKeys]);

  return withDecryptedVotes;
}
