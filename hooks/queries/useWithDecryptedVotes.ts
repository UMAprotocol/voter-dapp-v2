import { decryptMessage } from "helpers/crypto";
import { useEffect, useState } from "react";
import {
  DecryptedVoteT,
  PriceRequestT,
  SigningKeys,
  WithDecryptedVoteT,
  WithEncryptedVoteT,
  WithIsCommittedT,
} from "types/global";

export default function useWithDecryptedVotes(
  withEncryptedVotes: WithEncryptedVoteT<WithIsCommittedT<PriceRequestT>>[],
  address: string | undefined,
  signingKeys: SigningKeys
) {
  type T = typeof withEncryptedVotes[number];
  const [withDecryptedVotes, setWithDecryptedVotes] = useState<WithDecryptedVoteT<T>[]>([]);

  useEffect(() => {
    (async () => {
      if (!withEncryptedVotes?.length || !address) return;

      const privateKey = signingKeys[address].privateKey;
      const decryptedVotes = await decryptVotes(privateKey, withEncryptedVotes);
      setWithDecryptedVotes(decryptedVotes);

      async function decryptVotes(privateKey: string, encryptedVotes: typeof withEncryptedVotes) {
        return await Promise.all(
          encryptedVotes.map(async (vote) => {
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
    // we are choosing to ignore the `withEncryptedVotes` dependency in favor of the stringified version of it to achieve referential equality
  }, [address, JSON.stringify(withEncryptedVotes), signingKeys]);

  return withDecryptedVotes;
}
