import { decryptMessage } from "helpers/crypto";
import { useState, useEffect } from "react";
import {
  DecryptedVoteT,
  PriceRequestWithDecryptedVote,
  PriceRequestWithEncryptedVote,
  SigningKeys,
} from "types/global";

export default function useWithDecryptedVotes(
  withEncryptedVotes: PriceRequestWithEncryptedVote[],
  address: string | undefined,
  signingKeys: SigningKeys
) {
  const [withDecryptedVotes, setWithDecryptedVotes] = useState<PriceRequestWithDecryptedVote[]>([]);

  useEffect(() => {
    (async () => {
      if (!withEncryptedVotes?.length || !address) return;

      const privateKey = signingKeys[address].privateKey;
      const decryptedVotes: PriceRequestWithDecryptedVote[] = await decryptVotes(privateKey, withEncryptedVotes);
      setWithDecryptedVotes(decryptedVotes);

      async function decryptVotes(privateKey: string, withEncryptedVotes: PriceRequestWithEncryptedVote[]) {
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
