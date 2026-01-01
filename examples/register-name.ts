/*
  Example: Register an ENS name on Base Sepolia using @enscribe/core

  Prerequisites:
  - Set env vars:
      export PRIVATE_KEY=0x...
      export CONTRACT_ADDRESS=0xYourContractAddress

  Run:
      pnpm ts-node examples/register-name.ts
*/

import { http, createWalletClient } from "viem";
import { baseSepolia, sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

import { nameContract } from "../src/index.js";

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

  const result = await nameContract({
    name,
    contractAddress,
    walletClient,
    chainName: "base-sepolia",
    // Optional flags
    enableMetrics: false,
    opType: "example-script",
  });

  // Minimal output for demonstration
  console.log({
    success: result.success,
    name: result.name,
    contractType: result.contractType,
    explorerUrl: result.explorerUrl,
    transactions: result.transactions,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});













