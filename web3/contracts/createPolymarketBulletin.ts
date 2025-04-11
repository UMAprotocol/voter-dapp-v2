import { ethers } from "ethers";
import { getProvider } from "helpers/config";

export const polymarketBulletinAbi = [
  {
    inputs: [
      { internalType: "bytes32", name: "questionID", type: "bytes32" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    name: "getUpdates",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          { internalType: "bytes", name: "update", type: "bytes" },
        ],
        internalType: "struct BulletinBoard.AncillaryDataUpdate[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export type RawBulletin = {
  timestamp: ethers.BigNumber;
  update: ethers.BytesLike;
};
export type PolymarketBulletinContract = ethers.Contract & {
  getUpdates: (
    questionID: ethers.BytesLike,
    owner: string
  ) => Promise<RawBulletin[]>;
};

export function createPolymarketBulletinContract(
  address: string
): PolymarketBulletinContract {
  const provider = getProvider(137);
  return new ethers.Contract(
    address,
    polymarketBulletinAbi,
    provider
  ) as PolymarketBulletinContract;
}
