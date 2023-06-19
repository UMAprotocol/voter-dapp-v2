import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stakedBalanceKey, unstakedBalanceKey } from "constant";
import { BigNumber } from "ethers";
import { useHandleError } from "hooks";
import { ErrorOriginT } from "types";
import { stake } from "web3";

export function useStake({
  address,
  errorOrigin,
}: {
  address: string | undefined;
  errorOrigin?: ErrorOriginT;
}) {
  const queryClient = useQueryClient();
  const { onError, clearErrors } = useHandleError({ errorOrigin });

  const { mutate, isLoading } = useMutation({
    mutationFn: stake,
    onError,
    onSuccess: (_data, { stakeAmount }) => {
      clearErrors();

      queryClient.setQueryData<BigNumber>(
        [stakedBalanceKey, address],
        (oldStakedBalance) => {
          if (oldStakedBalance === undefined) return;

          const newStakedBalance = oldStakedBalance.add(stakeAmount);

          return newStakedBalance;
        }
      );

      queryClient.setQueryData<BigNumber>(
        [unstakedBalanceKey, address],
        (oldUnstakedBalance) => {
          if (oldUnstakedBalance === undefined) return;

          const newUnstakedBalance = oldUnstakedBalance.sub(stakeAmount);

          return newUnstakedBalance;
        }
      );
    },
  });
  return {
    stakeMutation: mutate,
    isStaking: isLoading,
  };
}
