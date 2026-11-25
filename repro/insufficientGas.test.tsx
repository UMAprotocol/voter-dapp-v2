// Repro: a commit from a wallet that can't cover gas * maxFeePerGas surfaces as
// "Cannot estimate gas; transaction may fail or may require manual gas limit."
// Runs the dapp's own commitVotes / Web3Provider / formatTransactionError /
// EthersErrorLink against real mainnet state. Read-only: eth_sendTransaction is
// intercepted, so nothing is broadcast.
import { ethers } from "ethers";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// helpers' barrel pulls in env-validated config; stub it with the two real
// functions the commit path uses (capitalizeFirstLetter copied verbatim).
vi.mock("helpers", async () => ({
  capitalizeFirstLetter: (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1),
  ...(await import("helpers/gas")),
}));
vi.mock("constant", async () => import("constant/web3/ethersErrorCodes"));

const { commitVotes } = await import("web3/mutations/votes/commitVotes");
const { formatTransactionError } = await import("helpers/web3/ethers");
const { Web3Provider } = await import("helpers/web3/provider");
const { EthersErrorLink } = await import(
  "components/EthersErrorLink/EthersErrorLink"
);

const RPC = process.env.MAINNET_RPC_URL ?? "";
const VOTING = "0x004395edb43EFca9885CEdad51EC9fAf93Bd34ac";
// Real voter who committed 51 votes in round 10391 at block 26491582 (tx
// 0x0042aa2b…). Pin state to the block before so it's their first commit.
const VOTER = "0xa87697ee92e7c8694fc6c5205557a91ee0ad7f1d";
const COMMIT_TX =
  "0x0042aa2be2cdcdaa57190f29e711b8d82a2fdfea1169efb26438f1f9b73acde2";
const BLOCK = ethers.utils.hexValue(26491581);

const abi = [
  "function commitAndEmitEncryptedVote(bytes32 identifier, uint256 time, bytes ancillaryData, bytes32 hash, bytes encryptedVote)",
  "function multicall(bytes[] data) returns (bytes[] results)",
];
const iface = new ethers.utils.Interface(abi);

let id = 0;
type Shape = "passthrough" | "metamask";

async function rpc(
  method: string,
  params: unknown[],
  shape: Shape = "passthrough"
) {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }),
  });
  const body: { result?: unknown; error?: { code: number; message: string } } =
    await res.json();
  if (body.error) {
    // MetaMask wraps the node error; most other wallets (and WalletConnect's
    // read-through RPC) hand back the node's {code, message} as-is.
    if (shape === "metamask") {
      throw Object.assign(new Error("Internal JSON-RPC error."), {
        code: -32603,
        data: body.error,
      });
    }
    throw Object.assign(new Error(body.error.message), body.error);
  }
  return body.result;
}

const pin = (tag: unknown) => (tag === "latest" ? BLOCK : tag);

// EIP-1193 wallet backed by mainnet RPC, state pinned to BLOCK, with the
// voter's ETH balance overridden. Records what reaches the node.
function wallet(balanceWei: ethers.BigNumber, shape: Shape) {
  const seen: {
    request?: unknown;
    estimate?: unknown;
    broadcastAttempted: boolean;
  } = {
    broadcastAttempted: false,
  };
  const request = async ({
    method,
    params = [],
  }: {
    method: string;
    params?: unknown[];
  }) => {
    switch (method) {
      case "eth_accounts":
      case "eth_requestAccounts":
        return [VOTER];
      case "eth_blockNumber":
        return BLOCK;
      case "eth_getBlockByNumber":
        return rpc(method, [pin(params[0]), params[1]]);
      case "eth_getBalance":
        return balanceWei.toHexString();
      case "eth_estimateGas": {
        const override = { [VOTER]: { balance: balanceWei.toHexString() } };
        try {
          seen.request = params[0];
          const r = await rpc(method, [params[0], BLOCK, override], shape);
          seen.estimate = r;
          return r;
        } catch (e) {
          seen.estimate =
            e instanceof Error ? `${e.message} ${JSON.stringify(e)}` : e;
          throw e;
        }
      }
      case "eth_sendTransaction":
        seen.broadcastAttempted = true;
        throw Object.assign(new Error("repro: broadcast blocked"), {
          code: 4001,
        });
      default:
        return rpc(method, params.map(pin));
    }
  };
  return { provider: new Web3Provider({ request }, 1), seen };
}

async function votesFromRealCommit() {
  const tx = await rpc("eth_getTransactionByHash", [COMMIT_TX]);
  const input: unknown = Reflect.get(Object(tx), "input");
  if (typeof input !== "string") throw new Error("commit tx not found");
  const [calls] = iface.decodeFunctionData("multicall", input);
  return calls.map((data: string) => {
    const [identifier, time, ancillaryData, hash, encryptedVote] =
      iface.decodeFunctionData("commitAndEmitEncryptedVote", data);
    return { identifier, time, ancillaryData, hash, encryptedVote };
  });
}

async function commitWith(balanceEth: string, shape: Shape = "passthrough") {
  const { provider, seen } = wallet(ethers.utils.parseEther(balanceEth), shape);
  const voting = new ethers.Contract(VOTING, abi, provider.getSigner(VOTER));
  const formattedVotes = await votesFromRealCommit();
  let banner: string | undefined;
  let code: string | undefined;
  try {
    await commitVotes({ voting, formattedVotes });
  } catch (error) {
    if (error instanceof Error) {
      code = String(Reflect.get(error, "code"));
      // Same path as useHandleError -> ErrorBanner -> EthersErrorLink.
      const message = formatTransactionError(error);
      banner = renderToString(EthersErrorLink({ errorMessage: message }))
        .replace(/<[^>]+>/g, "")
        .replace(/&#x27;/g, "'");
    }
  }
  return { banner, code, votes: formattedVotes.length, ...seen };
}

// Manual repro, needs mainnet state:
//   MAINNET_RPC_URL=… npx vitest run repro/insufficientGas.test.tsx --silent=false
describe.skipIf(!RPC)("commit with too little ETH for gas", () => {
  it("reproduces", async () => {
    const block = await rpc("eth_getBlockByNumber", [BLOCK, false]);
    const baseFee = ethers.BigNumber.from(
      Reflect.get(Object(block), "baseFeePerGas")
    );
    const tip = ethers.utils.parseUnits("0.001", "gwei");
    const maxFee = baseFee.mul(150).div(100).add(tip);

    const rich = await commitWith("1");
    expect(rich.broadcastAttempted).toBe(true);
    const gas = ethers.BigNumber.from(rich.estimate);
    console.log({
      block: 26491581,
      baseFeeGwei: ethers.utils.formatUnits(baseFee, "gwei"),
      maxFeePerGasGwei: ethers.utils.formatUnits(maxFee, "gwei"),
      votes: rich.votes,
      estimatedGas: gas.toString(),
      ethAtMaxFee: ethers.utils.formatEther(gas.mul(maxFee)),
      ethAtBaseFee: ethers.utils.formatEther(gas.mul(baseFee.add(tip))),
    });

    const balances = ["1", "0.0004", "0.0003", "0.0002", "0.00005", "0"];
    const rows = [];
    for (const balance of balances) {
      for (const shape of ["passthrough", "metamask"] as const) {
        const r = await commitWith(balance, shape);
        rows.push({
          balance,
          shape,
          node: r.broadcastAttempted ? `estimate ok (${gas})` : r.estimate,
          code: r.code,
          banner: r.banner,
        });
      }
    }
    console.log(JSON.stringify(rows, null, 2));
  }, 120_000);
});
