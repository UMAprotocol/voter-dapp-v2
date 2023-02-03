/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextApiRequest, NextApiResponse } from "next";

const designatedVotingOwners = [
  "0x718648C8c531F91b528A7757dD2bE813c3940608",
  "0x996d5138843993Cebc554c20d82310a43802aFF1",
  "0xc00667d8B00f35B3565A5c4458Dff1Cd718E3527",
  "0x20Ec3D7739FC8Ba82014A9cF0a771b427E0B56C0",
  "0xeFF2072EFd1b1513D7e97a71758796158e06762A",
  "0xdAB411E6a2604d6B98Ec97AC1834678be997E50b",
];

const designatedVotingVoters = [
  "0x718648C8c531F91b528A7757dD2bE813c3940608",
  "0x18A31dB2ECc0c27ee445266337B144f60810C228",
  "0xc00667d8B00f35B3565A5c4458Dff1Cd718E3527",
  "0xfD8355b24aB8815cA2d76d1E495DC29B4330241f",
  "0x644a7FF3CDFF23C3F10F25807A40Fa48AFF34885",
  "0x691c39FDd4F89db2d885324A2B5Cef00fbF8cAA3",
];

const designatedVotingContracts = [
  "0x6Accb8426f456bf16E74Ea61Ad90C91D2936d2a2",
  "0x384D91E6b8D032AB9D844EB58B85dF6543e616F0",
  "0x904389c66F33C4d9D90bF2Eb152e8a93FC6E4b34",
  "0xea7c2df8AB95Bf0AF91F8E4034B493733ACa21dF",
  "0x9a97C80956BCE4dd87c2Df6a93900dbfCbf0D60A",
  "0x61D62B3d530ab8174DBfAdE1675D856C5C5c9Fcd",
];

async function accountHasDesignatedVoting(account: string) {
  const ownerIndex = designatedVotingOwners.indexOf(account);
  const votingIndex = designatedVotingVoters.indexOf(account);
  if (ownerIndex === -1 && votingIndex === -1)
    return { message: "", designatedVotingContract: "" };
  return {
    message: `Connected account ${
      ownerIndex ? "owns" : "is a voter on"
    } a designated voting contract`,
    designatedVotingContract:
      designatedVotingContracts[Math.max(ownerIndex, votingIndex)],
  };
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  response.setHeader("Cache-Control", "max-age=0, s-maxage=2592000"); // Cache for 30 days and re-build cache if re-deployed.

  try {
    const body = request.body;
    ["account"].forEach((requiredKey) => {
      if (!Object.keys(body).includes(requiredKey))
        throw "Missing key in req body! required: account";
    });
    const readableTxData = await accountHasDesignatedVoting(body.account);
    response.status(200).send(readableTxData);
  } catch (e) {
    console.error(e);
    response.status(500).send({
      message: "Error in decoding designated voting target address",
      error: e instanceof Error ? e.message : e,
    });
  }
}
