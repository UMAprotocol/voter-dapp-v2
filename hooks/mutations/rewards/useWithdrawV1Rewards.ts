import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSetChain } from "@web3-onboard/react";
import { unstakedBalanceKey, v1RewardsKey } from "constant";
import { BigNumber } from "ethers";
import { useHandleError } from "hooks";
import { ErrorOriginT, V1RewardsT } from "types";
import { withdrawV1Rewards } from "web3";

export function useWithdrawV1Rewards(
  address: string | undefined,
  errorOrigin: ErrorOriginT
) {
  const queryClient = useQueryClient();
  const [{ connectedChain }] = useSetChain();
  const { onError, clearErrors } = useHandleError({ errorOrigin });
  const { mutate, isLoading } = useMutation({
    mutationFn: withdrawV1Rewards,
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
    withdrawV1RewardsMutation: mutate,
    isWithdrawingV1Rewards: isLoading,
  };
}
