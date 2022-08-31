import { decryptMessage } from "helpers/crypto";
import { useVotesContext, useWalletContext } from "hooks/contexts";
import { useEffect, useState } from "react";
import { DecryptedVotesByKeyT, DecryptedVoteT, EncryptedVotesByKeyT } from "types/global";
import useAccountDetails from "./useAccountDetails";

export default function useDecryptedVotes() {
  const { address } = useAccountDetails();
  const { signingKeys } = useWalletContext();
  const { encryptedVotes } = useVotesContext();
  const [decryptedVotes, setDecryptedVotes] = useState<DecryptedVotesByKeyT>({});

  useEffect(() => {
    (async () => {
      if (!Object.keys(encryptedVotes).length || !address) return;

      const privateKey = signingKeys[address].privateKey;
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
  }, [address, JSON.stringify(encryptedVotes), signingKeys]);

  return decryptedVotes;
}
