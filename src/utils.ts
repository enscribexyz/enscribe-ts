import { isAddress } from "viem";

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
  await fetch(METRICS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
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
}

