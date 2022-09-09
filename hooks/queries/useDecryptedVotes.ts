import { decryptMessage } from "helpers/crypto";
import { useWalletContext } from "hooks/contexts";
import { useEffect, useState } from "react";
import { DecryptedVotesByKeyT, DecryptedVoteT, EncryptedVotesByKeyT } from "types/global";
import useAccountDetails from "./useAccountDetails";

export default function useDecryptedVotes(encryptedVotes: EncryptedVotesByKeyT) {
  const { address } = useAccountDetails();
  const { signingKeys } = useWalletContext();
  const [decryptedVotes, setDecryptedVotes] = useState<DecryptedVotesByKeyT>({});

  useEffect(() => {
    (async () => {
      const privateKey = signingKeys[address]?.privateKey;
      if (!Object.keys(encryptedVotes).length || !address || !privateKey) return;

      const decryptedVotes = await decryptVotes(privateKey, encryptedVotes);
      setDecryptedVotes(decryptedVotes);

      async function decryptVotes(privateKey: string, encryptedVotes: EncryptedVotesByKeyT) {
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
    })();
    // we are choosing to ignore the `withEncryptedVotes` dependency in favor of the stringified version of it to achieve referential equality
  }, [JSON.stringify(encryptedVotes)]);

  return decryptedVotes;
}
