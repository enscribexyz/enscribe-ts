/*
  Example: Check if a contract address implements the Ownable interface using @enscribe/core

  Prerequisites:
  - Set env vars:
      export PRIVATE_KEY=0x...
      export CONTRACT_ADDRESS=0xYourContractAddress

  Run:
      pnpm tsx examples/check-ownable.ts
*/

import { http, createWalletClient } from "viem";
import { baseSepolia, sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

import { isOwnable, isReverseClaimable } from "../src/index.js";

async function main() {
  const privateKey = process.env.PRIVATE_KEY as `0x${string}` | undefined;
  const contractAddress = process.env.CONTRACT_ADDRESS as `0x${string}` | undefined;
  const RPC_URL = process.env.RPC_URL as string | undefined;

  if (!privateKey) throw new Error("PRIVATE_KEY env var is required");
  if (!contractAddress) throw new Error("CONTRACT_ADDRESS env var is required");
  if (!RPC_URL) throw new Error("RPC_URL env var is required");

  const account = privateKeyToAccount(privateKey);

  const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: http(RPC_URL),
    account,
  });

  console.log(`Checking if ${contractAddress} implements Ownable interface...`);

  const isOwnableResult = await isOwnable(contractAddress, walletClient);

  if (isOwnableResult) {
    console.log(`✅ The contract at ${contractAddress} implements the Ownable interface`);
  } else {
    console.log(`❌ The contract at ${contractAddress} does NOT implement the Ownable interface`);
  }

  return isOwnableResult;
}

main()
  .then((result) => {
    process.exit(result ? 0 : 1);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

