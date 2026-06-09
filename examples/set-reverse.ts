/*
  Example: Set only the reverse record (primary name) for a contract using
  @enscribe/enscribe.

  Use this when forward resolution (and the subname) is already in place — e.g.
  handled server-side — and only the user-signed reverse step remains. This is
  the reverse-only counterpart to nameContract(), which runs the full pipeline.

  Prerequisites:
  - The ENS name already forward-resolves to CONTRACT_ADDRESS.
  - The wallet (PRIVATE_KEY) owns the contract.
  - Set env vars:
      export PRIVATE_KEY=0x...
      export CONTRACT_ADDRESS=0xYourContractAddress
      export RPC_URL=https://...

  Run:
      pnpm tsx examples/set-reverse.ts
*/

import { http, createWalletClient } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

import {
  setReverseName,
  detectContractType,
  getContractAddresses,
  getNetworkNameFromChainId,
} from "../src/index.js";

async function main() {
  const privateKey = process.env.PRIVATE_KEY as `0x${string}` | undefined;
  const contractAddress = process.env.CONTRACT_ADDRESS as `0x${string}` | undefined;
  const url = process.env.RPC_URL as string | undefined;

  if (!privateKey) throw new Error("PRIVATE_KEY env var is required");
  if (!contractAddress) throw new Error("CONTRACT_ADDRESS env var is required");
  if (!url) throw new Error("RPC_URL env var is required");

  const account = privateKeyToAccount(privateKey);

  const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: http(url),
    account,
  });

  const name = "enscribelibbasetest1.abhi.basetest.eth";

  // Independent helpers (no naming side effects): resolve addresses from a
  // chainId and detect the contract type — useful for branching/validation.
  const networkName = getNetworkNameFromChainId(baseSepolia.id);
  const contracts = getContractAddresses(networkName);
  const contractType = await detectContractType(
    contractAddress,
    walletClient,
    contracts.ENS_REGISTRY,
  );
  console.log({ networkName, contractType, reverseRegistrar: contracts.REVERSE_REGISTRAR });

  // Reverse-only step (passing the known contractType skips re-detection).
  const result = await setReverseName({
    name,
    contractAddress,
    walletClient,
    chainName: "base-sepolia",
    contractType,
    enableMetrics: false,
    opType: "example-script",
  });

  console.log(result); // { set: true, transactionHash } or { set: false, reason: "not_owner" }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
