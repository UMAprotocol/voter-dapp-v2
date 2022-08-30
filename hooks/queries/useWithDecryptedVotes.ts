import { decryptMessage } from "helpers/crypto";
import { useWalletContext } from "hooks/contexts";
import { useEffect, useState } from "react";
import { DecryptedVoteT, UserDecryptedVotesByKeyT, UserEncryptedVotesByKeyT } from "types/global";
import useAccountDetails from "./useAccountDetails";

export default function useWithDecryptedVotes(withEncryptedVotes: UserEncryptedVotesByKeyT) {
  const { address } = useAccountDetails();
  const { signingKeys } = useWalletContext();
  const [withDecryptedVotes, setWithDecryptedVotes] = useState<UserDecryptedVotesByKeyT>({});

  useEffect(() => {
    (async () => {
      if (!withEncryptedVotes?.length || !address) return;

      const privateKey = signingKeys[address].privateKey;
      const decryptedVotes = await decryptVotes(privateKey, withEncryptedVotes);
      setWithDecryptedVotes(decryptedVotes);

      async function decryptVotes(privateKey: string, encryptedVotes: typeof withEncryptedVotes) {
        const decryptedVotes: UserDecryptedVotesByKeyT = {};

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
    })();
    // we are choosing to ignore the `withEncryptedVotes` dependency in favor of the stringified version of it to achieve referential equality
  }, [address, JSON.stringify(withEncryptedVotes), signingKeys]);

  return withDecryptedVotes;
}
