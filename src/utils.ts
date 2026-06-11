import { isAddress } from "viem";
import { namehash } from "viem/ens";
import { readContract } from "viem/actions";
import type { WalletClient } from "viem";
import ensRegistryABI from "./abi/ENSRegistry.js";
import ownableContractABI from "./abi/Ownable.js";
import type { ContractType } from "./types.js";

/**
 * Check if a value is empty (null or whitespace)
 */
function isEmpty(value: string): boolean {
  return value == null || value.trim().length === 0;
}

/**
 * Check if an address is empty
 */
export const isAddressEmpty = (address: string): boolean => {
  return isEmpty(address);
};

/**
 * Check if an address is valid
 */
export const isAddressValid = (address: string): boolean => {
  if (isEmpty(address)) {
    return false;
  }

  if (!isAddress(address)) {
    return false;
  }

  return true;
};

/**
 * Parse a normalized ENS name into label and parent
 */
export const parseNormalizedName = (
  normalizedName: string,
): { label: string; parent: string } => {
  const parts = normalizedName.split(".");
  if (parts.length < 2) {
    throw new Error("Invalid normalized name: must have at least one dot");
  }

  const label = parts[0];
  const parent = parts.slice(1).join(".");

  return { label, parent };
};

/**
 * Metrics API URL
 */
export const METRICS_URL = "https://app.enscribe.xyz/api/v1/metrics";

/**
 * Check if a contract implements the Ownable interface
 */
export async function isOwnable(
  address: string,
  walletClient: WalletClient,
): Promise<boolean> {
  if (isAddressEmpty(address) || !isAddressValid(address)) {
    return false;
  }

  try {
    await readContract(walletClient, {
      address: address as `0x${string}`,
      abi: ownableContractABI,
      functionName: "owner",
      args: [],
    });

    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Check if a contract implements ReverseClaimer
 */
export async function isReverseClaimable(
  address: string,
  walletClient: WalletClient,
  ensRegistry: string,
): Promise<boolean> {
  if (isAddressEmpty(address) || !isAddressValid(address)) {
    return false;
  }

  try {
    const addrLabel = address.slice(2).toLowerCase();
    const reversedNode = namehash(addrLabel + "." + "addr.reverse");
    const resolvedAddr = (await readContract(walletClient, {
      address: ensRegistry as `0x${string}`,
      abi: ensRegistryABI,
      functionName: "owner",
      args: [reversedNode],
    })) as `0x${string}`;

    if (resolvedAddr.toLowerCase() === walletClient.account?.address.toLowerCase()) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
}

/**
 * Detect the contract type
 */
export async function detectContractType(
  contractAddress: string,
  walletClient: WalletClient,
  ensRegistry: string,
): Promise<ContractType> {
  if (await isOwnable(contractAddress, walletClient)) {
    return "Ownable";
  }
  if (await isReverseClaimable(contractAddress, walletClient, ensRegistry)) {
    return "ReverseClaimer";
  }
  return "Unknown";
}

/**
 * Determine if a chain is L2 and get L1 network name
 */
export function getNetworkInfo(chainName: string): { isL2: boolean; networkName: string } {
  const chainLower = chainName.toLowerCase();
  
  if (
    chainLower === "linea-sepolia" || chainLower === "linea" ||
    chainLower === "optimism-sepolia" || chainLower === "optimism" ||
    chainLower === "arbitrum-sepolia" || chainLower === "arbitrum" ||
    chainLower === "scroll-sepolia" || chainLower === "scroll" ||
    chainLower === "base-sepolia" || chainLower === "base"
  ) {
    return { isL2: true, networkName: chainLower };
  } else {
    return { isL2: false, networkName: chainLower };
  } 
}

/**
 * Check if the wallet is the owner of the contract
 */
export async function isContractOwner(
  address: string,
  walletClient: WalletClient,
  ensRegistry: string,
): Promise<boolean> {
  if (isAddressEmpty(address) || !isAddressValid(address) || !walletClient) {
    return false;
  }

  try {
    const ownerAddress = (await readContract(walletClient, {
      address: address as `0x${string}`,
      abi: ownableContractABI,
      functionName: "owner",
      args: [],
    })) as `0x${string}`;

    return ownerAddress.toLowerCase() == walletClient.account?.address.toLowerCase();
  } catch (err) {
    // Try reverse resolution
    const addrLabel = address.slice(2).toLowerCase();
    const reversedNode = namehash(addrLabel + "." + "addr.reverse");
    const resolvedAddr = (await readContract(walletClient, {
      address: ensRegistry as `0x${string}`,
      abi: ensRegistryABI,
      functionName: "owner",
      args: [reversedNode],
    })) as string;

    return resolvedAddr.toLowerCase() == walletClient.account?.address.toLowerCase();
  }
}

/**
 * Generate a correlation ID for metrics.
 *
 * Uses the Web Crypto API (`globalThis.crypto`), which is available in browsers
 * and Node 19+. This deliberately avoids importing the Node `crypto` module so
 * the package stays browser-bundler friendly — bundlers such as webpack shim
 * `crypto` with `crypto-browserify`, which does not export `randomUUID`.
 *
 * Falls back to `getRandomValues` (RFC4122 v4) and finally to `Math.random`,
 * since the ID is only used for metrics correlation, not security.
 */
export function generateCorrelationId(): string {
  const webCrypto = (
    globalThis as unknown as {
      crypto?: {
        randomUUID?: () => string;
        getRandomValues?: <T extends ArrayBufferView>(array: T) => T;
      };
    }
  ).crypto;

  if (webCrypto?.randomUUID) {
    return webCrypto.randomUUID();
  }

  if (webCrypto?.getRandomValues) {
    const bytes = webCrypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
    return (
      hex.slice(0, 4).join("") +
      "-" +
      hex.slice(4, 6).join("") +
      "-" +
      hex.slice(6, 8).join("") +
      "-" +
      hex.slice(8, 10).join("") +
      "-" +
      hex.slice(10, 16).join("")
    );
  }

  // Last resort (non-cryptographic) — correlation ID only, never used for security
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Log a metric to the ENScribe API
 */
export async function logMetric(
  correlationId: string,
  timestamp: number,
  chainId: number,
  contractAddress: string,
  senderAddress: string,
  name: string,
  step: string,
  txnHash: string,
  contractType: string,
  opType: string,
): Promise<void> {
  // Metrics are best-effort. A blocked or failed request (ad-blockers, CORS,
  // offline, etc. — common in browsers) must never break the naming flow,
  // especially since this runs after the on-chain transaction has succeeded.
  try {
    await fetch(METRICS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        co_id: correlationId,
        contract_address: contractAddress,
        ens_name: name,
        deployer_address: senderAddress,
        network: chainId,
        timestamp: Math.floor(timestamp / 1000),
        step: step,
        txn_hash: txnHash,
        contract_type: contractType,
        op_type: opType,
        source: "enscribe",
      }),
    });
  } catch {
    // swallow — analytics failures are non-fatal
  }
}

