import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BigNumber, ethers } from "ethers";
import approve from "web3/mutations/approve";

export default function useApprove() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(approve, {
    onSuccess: (_data, { approveAmount }) => {
      const parsedApproveAmount = ethers.utils.parseEther(approveAmount);

      queryClient.setQueryData<[BigNumber]>(["tokenAllowance"], (oldTokenAllowance) => {
        if (!oldTokenAllowance) return undefined;

        const newTokenAllowance = oldTokenAllowance[0].add(parsedApproveAmount);
        return [newTokenAllowance];
      });
    },
  });
  return mutate;
}
