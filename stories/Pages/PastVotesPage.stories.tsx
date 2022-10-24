import { Meta, Story } from "@storybook/react";
import { defaultVotesContextState, VotesContext } from "contexts";
import { BigNumber } from "ethers";
import PastVotesPage from "pages/past-votes";
import { VoteT } from "types";

const mockPastVotes = [
  {
    time: 1666025124,
    identifier: "0x5945535f4f525f4e4f5f51554552590000000000000000000000000000000000",
    ancillaryData:
      "0x713a224861642074686520666f6c6c6f77696e6720696e7375726564206576656e74206f63637572726564206173206f6620726571756573742074696d657374616d703a20546f6d20617465204a657272793f222c6f6f5265717565737465723a30343338653733386362376231656239386238636239663236643661313164353935303662396464",
    voteNumber: BigNumber.from("0x86"),
    timeMilliseconds: 1666025124000,
    timeAsDate: "2022-10-17T16:45:24.000Z",
    decodedIdentifier: "YES_OR_NO_QUERY",
    decodedAncillaryData:
      'q:"Had the following insured event occurred as of request timestamp: Tom ate Jerry?",ooRequester:0438e738cb7b1eb98b8cb9f26d6a11d59506b9dd',
    correctVote: 0,
    uniqueKey:
      "YES_OR_NO_QUERY-1666025124-0x713a224861642074686520666f6c6c6f77696e6720696e7375726564206576656e74206f63637572726564206173206f6620726571756573742074696d657374616d703a20546f6d20617465204a657272793f222c6f6f5265717565737465723a30343338653733386362376231656239386238636239663236643661313164353935303662396464",
    isCommitted: false,
    isRevealed: false,
    transactionHash: "0x2a37d6072ef32814755e67e40b118d5c3f8d389fb1d9e80f0a75037aa042ea39",
    voteHistory: {
      uniqueKey:
        "YES_OR_NO_QUERY-1666025124-0x713a224861642074686520666f6c6c6f77696e6720696e7375726564206576656e74206f63637572726564206173206f6620726571756573742074696d657374616d703a20546f6d20617465204a657272793f222c6f6f5265717565737465723a30343338653733386362376231656239386238636239663236643661313164353935303662396464",
      voted: false,
      correctness: null,
      slashAmount: BigNumber.from("-0x56bc75e2d631000000"),
      staking: true,
    },
    title: "YES_OR_NO_QUERY",
    description:
      'YES_OR_NO_QUERY is intended to be used with ancillary data to allow anyone to request an answer to a "yes or no" question from UMA governance.',
    umipUrl: "https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-107.md",
    links: [
      {
        label: "Vote transaction",
        href: "https://goerli.etherscan.io/tx/0x2a37d6072ef32814755e67e40b118d5c3f8d389fb1d9e80f0a75037aa042ea39",
      },
    ],
    origin: "UMA",
    isGovernance: false,
    discordLink: "https://discord.com/invite/jsb9XQJ",
    isRolled: false,
  },
  {
    time: 1666016796,
    identifier: "0x5945535f4f525f4e4f5f51554552590000000000000000000000000000000000",
    ancillaryData:
      "0x713a224861642074686520666f6c6c6f77696e6720696e7375726564206576656e74206f63637572726564206173206f6620726571756573742074696d657374616d703a204d6f6f6e2063726173686564206f6e2053756e3f222c6f6f5265717565737465723a64313066643333303162366434343363346330663033643863653432386365626266643837353163",
    voteNumber: BigNumber.from("0x84"),
    timeMilliseconds: 1666016796000,
    timeAsDate: "2022-10-17T14:26:36.000Z",
    decodedIdentifier: "YES_OR_NO_QUERY",
    decodedAncillaryData:
      'q:"Had the following insured event occurred as of request timestamp: Moon crashed on Sun?",ooRequester:d10fd3301b6d443c4c0f03d8ce428cebbfd8751c',
    correctVote: 1,
    uniqueKey:
      "YES_OR_NO_QUERY-1666016796-0x713a224861642074686520666f6c6c6f77696e6720696e7375726564206576656e74206f63637572726564206173206f6620726571756573742074696d657374616d703a204d6f6f6e2063726173686564206f6e2053756e3f222c6f6f5265717565737465723a64313066643333303162366434343363346330663033643863653432386365626266643837353163",
    isCommitted: false,
    isRevealed: false,
    transactionHash: "0x7a4927b27fe3534fcd6854cbf31c2c3197fd4c14ff7f04aafad7ec2c9d40a09b",
    voteHistory: {
      uniqueKey:
        "YES_OR_NO_QUERY-1666016796-0x713a224861642074686520666f6c6c6f77696e6720696e7375726564206576656e74206f63637572726564206173206f6620726571756573742074696d657374616d703a204d6f6f6e2063726173686564206f6e2053756e3f222c6f6f5265717565737465723a64313066643333303162366434343363346330663033643863653432386365626266643837353163",
      voted: false,
      correctness: null,
      slashAmount: BigNumber.from("-0x56bc75e2d631000000"),
      staking: true,
    },
    title: "YES_OR_NO_QUERY",
    description:
      'YES_OR_NO_QUERY is intended to be used with ancillary data to allow anyone to request an answer to a "yes or no" question from UMA governance.',
    umipUrl: "https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-107.md",
    links: [
      {
        label: "Vote transaction",
        href: "https://goerli.etherscan.io/tx/0x7a4927b27fe3534fcd6854cbf31c2c3197fd4c14ff7f04aafad7ec2c9d40a09b",
      },
    ],
    origin: "UMA",
    isGovernance: false,
    discordLink: "https://discord.com/invite/jsb9XQJ",
    isRolled: false,
  },
  {
    time: 1666014312,
    identifier: "0x5945535f4f525f4e4f5f51554552590000000000000000000000000000000000",
    ancillaryData:
      "0x713a224861642074686520666f6c6c6f77696e6720696e7375726564206576656e74206f63637572726564206173206f6620726571756573742074696d657374616d703a204d6f6f6e2063726173686564206f6e2053756e3f222c6f6f5265717565737465723a64313066643333303162366434343363346330663033643863653432386365626266643837353163",
    voteNumber: BigNumber.from("0x81"),
    timeMilliseconds: 1666014312000,
    timeAsDate: "2022-10-17T13:45:12.000Z",
    decodedIdentifier: "YES_OR_NO_QUERY",
    decodedAncillaryData:
      'q:"Had the following insured event occurred as of request timestamp: Moon crashed on Sun?",ooRequester:d10fd3301b6d443c4c0f03d8ce428cebbfd8751c',
    correctVote: 0,
    uniqueKey:
      "YES_OR_NO_QUERY-1666014312-0x713a224861642074686520666f6c6c6f77696e6720696e7375726564206576656e74206f63637572726564206173206f6620726571756573742074696d657374616d703a204d6f6f6e2063726173686564206f6e2053756e3f222c6f6f5265717565737465723a64313066643333303162366434343363346330663033643863653432386365626266643837353163",
    isCommitted: false,
    isRevealed: false,
    transactionHash: "0x4fbf012ab947a4a6a126cc454ad5cab35adf6f0fa7c9aab92bec60fa0dc7b3d4",
    voteHistory: {
      uniqueKey:
        "YES_OR_NO_QUERY-1666014312-0x713a224861642074686520666f6c6c6f77696e6720696e7375726564206576656e74206f63637572726564206173206f6620726571756573742074696d657374616d703a204d6f6f6e2063726173686564206f6e2053756e3f222c6f6f5265717565737465723a64313066643333303162366434343363346330663033643863653432386365626266643837353163",
      voted: false,
      correctness: null,
      slashAmount: BigNumber.from("-0x56bc75e2d631000000"),
      staking: true,
    },
    title: "YES_OR_NO_QUERY",
    description:
      'YES_OR_NO_QUERY is intended to be used with ancillary data to allow anyone to request an answer to a "yes or no" question from UMA governance.',
    umipUrl: "https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-107.md",
    links: [
      {
        label: "Vote transaction",
        href: "https://goerli.etherscan.io/tx/0x4fbf012ab947a4a6a126cc454ad5cab35adf6f0fa7c9aab92bec60fa0dc7b3d4",
      },
    ],
    origin: "UMA",
    isGovernance: false,
    discordLink: "https://discord.com/invite/jsb9XQJ",
    isRolled: false,
  },
  {
    time: 1664180096,
    identifier: "0x5945535f4f525f4e4f5f51554552590000000000000000000000000000000000",
    ancillaryData: "0x5468697320697320736f6d6520746573742064617461",
    voteNumber: BigNumber.from("0x25"),
    timeMilliseconds: 1664180096000,
    timeAsDate: "2022-09-26T08:14:56.000Z",
    decodedIdentifier: "YES_OR_NO_QUERY",
    decodedAncillaryData: "This is some test data",
    correctVote: -1,
    uniqueKey: "YES_OR_NO_QUERY-1664180096-0x5468697320697320736f6d6520746573742064617461",
    isCommitted: false,
    isRevealed: false,
    transactionHash: "0xf8def5d85daf84e6e6eb388367e09b732fc5717d6875e06ff70d870cc6d8f03f",
    voteHistory: {
      uniqueKey: "YES_OR_NO_QUERY-1664180096-0x5468697320697320736f6d6520746573742064617461",
      voted: false,
      correctness: null,
      slashAmount: BigNumber.from("-0x56bc75e2d631000000"),
      staking: true,
    },
    title: "YES_OR_NO_QUERY",
    description:
      'YES_OR_NO_QUERY is intended to be used with ancillary data to allow anyone to request an answer to a "yes or no" question from UMA governance.',
    umipUrl: "https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-107.md",
    links: [
      {
        label: "Vote transaction",
        href: "https://goerli.etherscan.io/tx/0xf8def5d85daf84e6e6eb388367e09b732fc5717d6875e06ff70d870cc6d8f03f",
      },
    ],
    origin: "UMA",
    isGovernance: false,
    discordLink: "https://discord.com/invite/jsb9XQJ",
    isRolled: false,
  },
  {
    time: 1664180095,
    identifier: "0x5945535f4f525f4e4f5f51554552590000000000000000000000000000000000",
    ancillaryData: "0x5468697320697320736f6d6520746573742064617461",
    voteNumber: BigNumber.from("0x24"),
    timeMilliseconds: 1664180095000,
    timeAsDate: "2022-09-26T08:14:55.000Z",
    decodedIdentifier: "YES_OR_NO_QUERY",
    decodedAncillaryData: "This is some test data",
    correctVote: -1,
    uniqueKey: "YES_OR_NO_QUERY-1664180095-0x5468697320697320736f6d6520746573742064617461",
    isCommitted: false,
    isRevealed: false,
    transactionHash: "0x04b1d6927d49ed95cafb2755e3ce0804fdf3d91b6da6bcda8476efc7d38150d6",
    voteHistory: {
      uniqueKey: "YES_OR_NO_QUERY-1664180095-0x5468697320697320736f6d6520746573742064617461",
      voted: false,
      correctness: null,
      slashAmount: BigNumber.from("-0x56bc75e2d631000000"),
      staking: true,
    },
    title: "YES_OR_NO_QUERY",
    description:
      'YES_OR_NO_QUERY is intended to be used with ancillary data to allow anyone to request an answer to a "yes or no" question from UMA governance.',
    umipUrl: "https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-107.md",
    links: [
      {
        label: "Vote transaction",
        href: "https://goerli.etherscan.io/tx/0x04b1d6927d49ed95cafb2755e3ce0804fdf3d91b6da6bcda8476efc7d38150d6",
      },
    ],
    origin: "UMA",
    isGovernance: false,
    discordLink: "https://discord.com/invite/jsb9XQJ",
    isRolled: false,
  },
  {
    time: 1664180094,
    identifier: "0x5945535f4f525f4e4f5f51554552590000000000000000000000000000000000",
    ancillaryData: "0x5468697320697320736f6d6520746573742064617461",
    voteNumber: BigNumber.from("0x23"),
    timeMilliseconds: 1664180094000,
    timeAsDate: "2022-09-26T08:14:54.000Z",
    decodedIdentifier: "YES_OR_NO_QUERY",
    decodedAncillaryData: "This is some test data",
    correctVote: 1,
    uniqueKey: "YES_OR_NO_QUERY-1664180094-0x5468697320697320736f6d6520746573742064617461",
    isCommitted: false,
    isRevealed: false,
    transactionHash: "0x3cd4afd84f5608d2fc2e1590b9b6a186a41bd17daed6ef624c4779f826e68376",
    voteHistory: {
      uniqueKey: "YES_OR_NO_QUERY-1664180094-0x5468697320697320736f6d6520746573742064617461",
      voted: false,
      correctness: null,
      slashAmount: BigNumber.from("-0x56bc75e2d631000000"),
      staking: true,
    },
    title: "YES_OR_NO_QUERY",
    description:
      'YES_OR_NO_QUERY is intended to be used with ancillary data to allow anyone to request an answer to a "yes or no" question from UMA governance.',
    umipUrl: "https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-107.md",
    links: [
      {
        label: "Vote transaction",
        href: "https://goerli.etherscan.io/tx/0x3cd4afd84f5608d2fc2e1590b9b6a186a41bd17daed6ef624c4779f826e68376",
      },
    ],
    origin: "UMA",
    isGovernance: false,
    discordLink: "https://discord.com/invite/jsb9XQJ",
    isRolled: false,
  },
  {
    time: 1664180093,
    identifier: "0x5945535f4f525f4e4f5f51554552590000000000000000000000000000000000",
    ancillaryData: "0x5468697320697320736f6d6520746573742064617461",
    voteNumber: BigNumber.from("0x22"),
    timeMilliseconds: 1664180093000,
    timeAsDate: "2022-09-26T08:14:53.000Z",
    decodedIdentifier: "YES_OR_NO_QUERY",
    decodedAncillaryData: "This is some test data",
    correctVote: 2,
    uniqueKey: "YES_OR_NO_QUERY-1664180093-0x5468697320697320736f6d6520746573742064617461",
    isCommitted: false,
    isRevealed: false,
    transactionHash: "0xda2007195f2cd49ee5efc6ba4a04ac609c318e0bd9c2192f8692e82907595f6d",
    voteHistory: {
      uniqueKey: "YES_OR_NO_QUERY-1664180093-0x5468697320697320736f6d6520746573742064617461",
      voted: false,
      correctness: null,
      slashAmount: BigNumber.from("-0x56bc75e2d631000000"),
      staking: true,
    },
    title: "YES_OR_NO_QUERY",
    description:
      'YES_OR_NO_QUERY is intended to be used with ancillary data to allow anyone to request an answer to a "yes or no" question from UMA governance.',
    umipUrl: "https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-107.md",
    links: [
      {
        label: "Vote transaction",
        href: "https://goerli.etherscan.io/tx/0xda2007195f2cd49ee5efc6ba4a04ac609c318e0bd9c2192f8692e82907595f6d",
      },
    ],
    origin: "UMA",
    isGovernance: false,
    discordLink: "https://discord.com/invite/jsb9XQJ",
    isRolled: false,
  },
  {
    time: 1664180092,
    identifier: "0x5945535f4f525f4e4f5f51554552590000000000000000000000000000000000",
    ancillaryData: "0x5468697320697320736f6d6520746573742064617461",
    voteNumber: BigNumber.from("0x21"),
    timeMilliseconds: 1664180092000,
    timeAsDate: "2022-09-26T08:14:52.000Z",
    decodedIdentifier: "YES_OR_NO_QUERY",
    decodedAncillaryData: "This is some test data",
    correctVote: 1,
    uniqueKey: "YES_OR_NO_QUERY-1664180092-0x5468697320697320736f6d6520746573742064617461",
    isCommitted: false,
    isRevealed: false,
    transactionHash: "0xafff852e99e86edf1805ede4a9a93912b4a6df86b49ac6bbbc1e211972874e21",
    voteHistory: {
      uniqueKey: "YES_OR_NO_QUERY-1664180092-0x5468697320697320736f6d6520746573742064617461",
      voted: false,
      correctness: null,
      slashAmount: BigNumber.from("-0x56bc75e2d631000000"),
      staking: true,
    },
    title: "YES_OR_NO_QUERY",
    description:
      'YES_OR_NO_QUERY is intended to be used with ancillary data to allow anyone to request an answer to a "yes or no" question from UMA governance.',
    umipUrl: "https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-107.md",
    links: [
      {
        label: "Vote transaction",
        href: "https://goerli.etherscan.io/tx/0xafff852e99e86edf1805ede4a9a93912b4a6df86b49ac6bbbc1e211972874e21",
      },
    ],
    origin: "UMA",
    isGovernance: false,
    discordLink: "https://discord.com/invite/jsb9XQJ",
    isRolled: false,
  },
  {
    time: 1664180091,
    identifier: "0x5945535f4f525f4e4f5f51554552590000000000000000000000000000000000",
    ancillaryData: "0x5468697320697320736f6d6520746573742064617461",
    voteNumber: BigNumber.from("0x20"),
    timeMilliseconds: 1664180091000,
    timeAsDate: "2022-09-26T08:14:51.000Z",
    decodedIdentifier: "YES_OR_NO_QUERY",
    decodedAncillaryData: "This is some test data",
    correctVote: 1,
    uniqueKey: "YES_OR_NO_QUERY-1664180091-0x5468697320697320736f6d6520746573742064617461",
    isCommitted: false,
    isRevealed: false,
    transactionHash: "0xc91131743016430fb31a75a1773f4abefb6927cb0d5708d6da146d4650b4a09d",
    voteHistory: {
      uniqueKey: "YES_OR_NO_QUERY-1664180091-0x5468697320697320736f6d6520746573742064617461",
      voted: false,
      correctness: null,
      slashAmount: BigNumber.from("-0x56bc75e2d631000000"),
      staking: true,
    },
    title: "YES_OR_NO_QUERY",
    description:
      'YES_OR_NO_QUERY is intended to be used with ancillary data to allow anyone to request an answer to a "yes or no" question from UMA governance.',
    umipUrl: "https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-107.md",
    links: [
      {
        label: "Vote transaction",
        href: "https://goerli.etherscan.io/tx/0xc91131743016430fb31a75a1773f4abefb6927cb0d5708d6da146d4650b4a09d",
      },
    ],
    origin: "UMA",
    isGovernance: false,
    discordLink: "https://discord.com/invite/jsb9XQJ",
    isRolled: false,
  },
  {
    time: 1664180090,
    identifier: "0x5945535f4f525f4e4f5f51554552590000000000000000000000000000000000",
    ancillaryData: "0x5468697320697320736f6d6520746573742064617461",
    voteNumber: BigNumber.from("0x1f"),
    timeMilliseconds: 1664180090000,
    timeAsDate: "2022-09-26T08:14:50.000Z",
    decodedIdentifier: "YES_OR_NO_QUERY",
    decodedAncillaryData: "This is some test data",
    correctVote: 1,
    uniqueKey: "YES_OR_NO_QUERY-1664180090-0x5468697320697320736f6d6520746573742064617461",
    isCommitted: false,
    isRevealed: false,
    transactionHash: "0xcdc602f45098c33166c09237c5d8357a17e0d65852ca0585590fcabad61f6938",
    voteHistory: {
      uniqueKey: "YES_OR_NO_QUERY-1664180090-0x5468697320697320736f6d6520746573742064617461",
      voted: false,
      correctness: null,
      slashAmount: BigNumber.from("-0x56bc75e2d631000000"),
      staking: true,
    },
    title: "YES_OR_NO_QUERY",
    description:
      'YES_OR_NO_QUERY is intended to be used with ancillary data to allow anyone to request an answer to a "yes or no" question from UMA governance.',
    umipUrl: "https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-107.md",
    links: [
      {
        label: "Vote transaction",
        href: "https://goerli.etherscan.io/tx/0xcdc602f45098c33166c09237c5d8357a17e0d65852ca0585590fcabad61f6938",
      },
    ],
    origin: "UMA",
    isGovernance: false,
    discordLink: "https://discord.com/invite/jsb9XQJ",
    isRolled: false,
  },
  {
    time: 1663852536,
    identifier: "0x41646d696e203133000000000000000000000000000000000000000000000000",
    ancillaryData: "0x5061626c6f2074657374696e67",
    voteNumber: BigNumber.from("0x07"),
    timeMilliseconds: 1663852536000,
    timeAsDate: "2022-09-22T13:15:36.000Z",
    decodedIdentifier: "Admin 13",
    decodedAncillaryData: "Pablo testing",
    correctVote: 1,
    uniqueKey: "Admin 13-1663852536-0x5061626c6f2074657374696e67",
    isCommitted: false,
    isRevealed: false,
    transactionHash: "0xaf01f2d1f23bef72489a3331ffeac06102f85356c695bf30806ef6ddcda20e2a",
    voteHistory: {
      uniqueKey: "Admin 13-1663852536-0x5061626c6f2074657374696e67",
      voted: false,
      correctness: null,
      slashAmount: BigNumber.from("-0x56bc75e2d631000000"),
      staking: true,
    },
    title: "Admin 13",
    description: "No description was found for this UMIP.",
    umipNumber: 13,
    links: [
      {
        label: "Vote transaction",
        href: "https://goerli.etherscan.io/tx/0xaf01f2d1f23bef72489a3331ffeac06102f85356c695bf30806ef6ddcda20e2a",
      },
      {
        label: "UMIP 13",
        href: "https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-13.md",
      },
    ],
    options: [
      {
        label: "Yes",
        value: "1",
      },
      {
        label: "No",
        value: "0",
      },
    ],
    origin: "UMA",
    isGovernance: true,
    discordLink: "https://discord.com/invite/jsb9XQJ",
    isRolled: false,
  },
  {
    time: 1663839516,
    identifier: "0x41646d696e203132000000000000000000000000000000000000000000000000",
    ancillaryData: "0x74657374696e6720612070726f706f73616c",
    voteNumber: BigNumber.from("0x04"),
    timeMilliseconds: 1663839516000,
    timeAsDate: "2022-09-22T09:38:36.000Z",
    decodedIdentifier: "Admin 12",
    decodedAncillaryData: "testing a proposal",
    correctVote: 1e-14,
    uniqueKey: "Admin 12-1663839516-0x74657374696e6720612070726f706f73616c",
    isCommitted: false,
    isRevealed: false,
    transactionHash: "0x850d2f5e468709218b1ef2d2de465feaf3065ec9e51b82e44435f30b63129e2a",
    voteHistory: {
      uniqueKey: "Admin 12-1663839516-0x74657374696e6720612070726f706f73616c",
      voted: false,
      correctness: null,
      slashAmount: BigNumber.from("-0x56bc75e2d631000000"),
      staking: true,
    },
    title: "Admin 12",
    description: "No description was found for this UMIP.",
    umipNumber: 12,
    links: [
      {
        label: "Vote transaction",
        href: "https://goerli.etherscan.io/tx/0x850d2f5e468709218b1ef2d2de465feaf3065ec9e51b82e44435f30b63129e2a",
      },
      {
        label: "UMIP 12",
        href: "https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-12.md",
      },
    ],
    options: [
      {
        label: "Yes",
        value: "1",
      },
      {
        label: "No",
        value: "0",
      },
    ],
    origin: "UMA",
    isGovernance: true,
    discordLink: "https://discord.com/invite/jsb9XQJ",
    isRolled: false,
  },
  {
    time: 1663785120,
    identifier: "0x5945535f4f525f4e4f5f51554552590000000000000000000000000000000000",
    ancillaryData:
      "0x4469642074686520616464726573732062656c6f7720706172746963697061746520696e2058206861636b206261736564206f6e20592063726974657269613f2031203d207965732c2030203d206e6f2041646472657373657320746f2051756572793a20393639366639373666633232323639616538633536396434626663336335396236373462383039632c6f6f5265717565737465723a39363936663937366663323232363961653863353639643462666333633539623637346238303963",
    voteNumber: BigNumber.from("0x02"),
    timeMilliseconds: 1663785120000,
    timeAsDate: "2022-09-21T18:32:00.000Z",
    decodedIdentifier: "YES_OR_NO_QUERY",
    decodedAncillaryData:
      "Did the address below participate in X hack based on Y criteria? 1 = yes, 0 = no Addresses to Query: 9696f976fc22269ae8c569d4bfc3c59b674b809c,ooRequester:9696f976fc22269ae8c569d4bfc3c59b674b809c",
    correctVote: 1,
    uniqueKey:
      "YES_OR_NO_QUERY-1663785120-0x4469642074686520616464726573732062656c6f7720706172746963697061746520696e2058206861636b206261736564206f6e20592063726974657269613f2031203d207965732c2030203d206e6f2041646472657373657320746f2051756572793a20393639366639373666633232323639616538633536396434626663336335396236373462383039632c6f6f5265717565737465723a39363936663937366663323232363961653863353639643462666333633539623637346238303963",
    isCommitted: false,
    isRevealed: false,
    transactionHash: "0xdc12429a5a3a185ed5e7f01f5916d0f8c7ae40a763345e70cf5063cc9f9c378f",
    voteHistory: {
      uniqueKey:
        "YES_OR_NO_QUERY-1663785120-0x4469642074686520616464726573732062656c6f7720706172746963697061746520696e2058206861636b206261736564206f6e20592063726974657269613f2031203d207965732c2030203d206e6f2041646472657373657320746f2051756572793a20393639366639373666633232323639616538633536396434626663336335396236373462383039632c6f6f5265717565737465723a39363936663937366663323232363961653863353639643462666333633539623637346238303963",
      voted: false,
      correctness: null,
      slashAmount: BigNumber.from("-0x56bc75e2d631000000"),
      staking: true,
    },
    title: "YES_OR_NO_QUERY",
    description:
      'YES_OR_NO_QUERY is intended to be used with ancillary data to allow anyone to request an answer to a "yes or no" question from UMA governance.',
    umipUrl: "https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-107.md",
    links: [
      {
        label: "Vote transaction",
        href: "https://goerli.etherscan.io/tx/0xdc12429a5a3a185ed5e7f01f5916d0f8c7ae40a763345e70cf5063cc9f9c378f",
      },
    ],
    origin: "UMA",
    isGovernance: false,
    discordLink: "https://discord.com/invite/jsb9XQJ",
    isRolled: false,
  },
  {
    time: 1663754976,
    identifier: "0x41646d696e203131000000000000000000000000000000000000000000000000",
    ancillaryData: "0x0123",
    voteNumber: BigNumber.from("0x01"),
    timeMilliseconds: 1663754976000,
    timeAsDate: "2022-09-21T10:09:36.000Z",
    decodedIdentifier: "Admin 11",
    decodedAncillaryData: "\u0001#",
    correctVote: 1e-14,
    uniqueKey: "Admin 11-1663754976-0x0123",
    isCommitted: false,
    isRevealed: false,
    transactionHash: "0xcdf16384607bc73baa50b5bbf07113f615de59ce34a3704f997ec6e4197f7d56",
    voteHistory: {
      uniqueKey: "Admin 11-1663754976-0x0123",
      voted: false,
      correctness: null,
      slashAmount: BigNumber.from("-0x56bc75e2d631000000"),
      staking: true,
    },
    title: "Admin 11",
    description: "No description was found for this UMIP.",
    umipNumber: 11,
    links: [
      {
        label: "Vote transaction",
        href: "https://goerli.etherscan.io/tx/0xcdf16384607bc73baa50b5bbf07113f615de59ce34a3704f997ec6e4197f7d56",
      },
      {
        label: "UMIP 11",
        href: "https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-11.md",
      },
    ],
    options: [
      {
        label: "Yes",
        value: "1",
      },
      {
        label: "No",
        value: "0",
      },
    ],
    origin: "UMA",
    isGovernance: true,
    discordLink: "https://discord.com/invite/jsb9XQJ",
    isRolled: false,
  },
  {
    time: 1234,
    identifier: "0x5945535f4f525f4e4f5f51554552590000000000000000000000000000000000",
    ancillaryData: "0x54657374696e6720726567756c617220766f7465",
    voteNumber: BigNumber.from("0x08"),
    timeMilliseconds: 1234000,
    timeAsDate: "1970-01-01T00:20:34.000Z",
    decodedIdentifier: "YES_OR_NO_QUERY",
    decodedAncillaryData: "Testing regular vote",
    correctVote: 1e-13,
    uniqueKey: "YES_OR_NO_QUERY-1234-0x54657374696e6720726567756c617220766f7465",
    isCommitted: false,
    isRevealed: false,
    transactionHash: "0x873d157712713f7ef81e78ea3a48c6194616a912663221737f7b0f54ed2e9cff",
    voteHistory: {
      uniqueKey: "YES_OR_NO_QUERY-1234-0x54657374696e6720726567756c617220766f7465",
      voted: true,
      correctness: false,
      slashAmount: BigNumber.from("-0x570cc54460b59a9622"),
      staking: true,
    },
    title: "YES_OR_NO_QUERY",
    description:
      'YES_OR_NO_QUERY is intended to be used with ancillary data to allow anyone to request an answer to a "yes or no" question from UMA governance.',
    umipUrl: "https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-107.md",
    links: [
      {
        label: "Vote transaction",
        href: "https://goerli.etherscan.io/tx/0x873d157712713f7ef81e78ea3a48c6194616a912663221737f7b0f54ed2e9cff",
      },
    ],
    origin: "UMA",
    isGovernance: false,
    discordLink: "https://discord.com/invite/jsb9XQJ",
    isRolled: false,
  },
  {
    time: 123,
    identifier: "0x5945535f4f525f4e4f5f51554552590000000000000000000000000000000000",
    ancillaryData: "0x54657374696e6720726567756c617220766f7465",
    voteNumber: BigNumber.from("0x09"),
    timeMilliseconds: 123000,
    timeAsDate: "1970-01-01T00:02:03.000Z",
    decodedIdentifier: "YES_OR_NO_QUERY",
    decodedAncillaryData: "Testing regular vote",
    correctVote: 1,
    uniqueKey: "YES_OR_NO_QUERY-123-0x54657374696e6720726567756c617220766f7465",
    isCommitted: false,
    isRevealed: false,
    transactionHash: "0xa2ae1af214c8a3e00f5b715d63859e8c890ac8f84861752404a596576338f9a3",
    voteHistory: {
      uniqueKey: "YES_OR_NO_QUERY-123-0x54657374696e6720726567756c617220766f7465",
      voted: false,
      correctness: null,
      slashAmount: BigNumber.from("-0x56bc75e2d631000000"),
      staking: true,
    },
    title: "YES_OR_NO_QUERY",
    description:
      'YES_OR_NO_QUERY is intended to be used with ancillary data to allow anyone to request an answer to a "yes or no" question from UMA governance.',
    umipUrl: "https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-107.md",
    links: [
      {
        label: "Vote transaction",
        href: "https://goerli.etherscan.io/tx/0xa2ae1af214c8a3e00f5b715d63859e8c890ac8f84861752404a596576338f9a3",
      },
    ],
    origin: "UMA",
    isGovernance: false,
    discordLink: "https://discord.com/invite/jsb9XQJ",
    isRolled: false,
  },
];

interface StoryProps {
  votes: VoteT[];
}
export default {
  title: "Pages/Past Votes Page/PastVotesPage",
  component: PastVotesPage,
} as Meta<StoryProps>;

const Template: Story<StoryProps> = (args) => {
  const mockVotesContextState = {
    ...defaultVotesContextState,
    getPastVotes: () => args.votes ?? mockPastVotes,
  };

  return (
    <VotesContext.Provider value={mockVotesContextState}>
      <PastVotesPage />
    </VotesContext.Provider>
  );
};

export const Default = Template.bind({});
