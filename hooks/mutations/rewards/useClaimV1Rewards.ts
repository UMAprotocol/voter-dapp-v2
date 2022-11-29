import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSetChain } from "@web3-onboard/react";
import { unstakedBalanceKey, v1RewardsKey } from "constant";
import { BigNumber } from "ethers";
import { useUserContext } from "hooks/contexts/useUserContext";
import { useHandleError } from "hooks/helpers/useHandleError";
import { ErrorOriginT, V1RewardsT } from "types";
import { claimV1Rewards } from "web3";

export function useClaimV1Rewards(errorOrigin: ErrorOriginT) {
  const queryClient = useQueryClient();
  const { address } = useUserContext();
  const [{ connectedChain }] = useSetChain();
  const { onError, clearErrors } = useHandleError({ errorOrigin });
  const { mutate, isLoading } = useMutation(claimV1Rewards, {
    onError,
    onSuccess: (_receipt, { totalRewards }) => {
      clearErrors();

      queryClient.setQueryData<BigNumber>(
        [unstakedBalanceKey, address],
        (oldUnstakedBalance) => {
          if (oldUnstakedBalance === undefined) return;
          const newUnstakedBalance = oldUnstakedBalance.add(totalRewards);
          return newUnstakedBalance;
        }
      );

      queryClient.setQueryData<V1RewardsT>(
        [v1RewardsKey, address, connectedChain],
        () => ({
          multicallPayload: [],
          totalRewards: BigNumber.from(0),
        })
      );
    },
  });

  return {
    claimV1RewardsMutation: mutate,
    isClaimingV1Rewards: isLoading,
  };
}
