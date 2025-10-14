import type { WalletClient } from "viem";

/**
 * Configuration for ENS contracts on a specific network
 */
export interface ENSContracts {
  ENS_REGISTRY: string;
  PUBLIC_RESOLVER: string;
  NAME_WRAPPER: string;
  REVERSE_REGISTRAR: string;
  L2_REVERSE_REGISTRAR?: string;
  COIN_TYPE?: number;
}

/**
 * Options for naming a contract
 */
export interface NameContractOptions {
  /** The normalized ENS name */
  name: string;
  /** The contract address to name */
  contractAddress: string;
  /** Primary wallet client (L1 or the main network) */
  walletClient: WalletClient;
  /** Optional secondary wallet client (for L2 if applicable) */
  l2WalletClient?: WalletClient | null;
  /** Chain name (e.g., "sepolia", "linea-sepolia", "optimism", etc.) */
  chainName: string;
  /** Optional operation type for metrics */
  opType?: string;
  /** Enable metrics logging (default: false) */
  enableMetrics?: boolean;
}

/**
 * Result of naming a contract
 */
export interface NameContractResult {
  /** Whether the operation was successful */
  success: boolean;
  /** Normalized name that was set */
  name: string;
  /** Contract address that was named */
  contractAddress: string;
  /** Transaction hashes for each operation */
  transactions: {
    subname?: string;
    forwardResolution?: string;
    reverseResolution?: string;
    l2ForwardResolution?: string;
    l2ReverseResolution?: string;
  };
  /** Type of contract detected */
  contractType: "Ownable" | "ReverseClaimer" | "Unknown";
  /** Explorer URL */
  explorerUrl: string;
}

/**
 * Contract type detection result
 */
export type ContractType = "Ownable" | "ReverseClaimer" | "Unknown";

/**
 * Options for creating a subname
 */
export interface CreateSubnameOptions {
  /** The normalized ENS name */
  name: string;
  /** L1 wallet client */
  walletClient: WalletClient;
  /** L1 ENS contract addresses */
  contracts: ENSContracts;
  /** Contract address being named (for metrics) */
  contractAddress: string;
  /** Contract type (for metrics) */
  contractType: ContractType;
  /** Optional operation type for metrics */
  opType?: string;
  /** Enable metrics logging (default: false) */
  enableMetrics?: boolean;
}

/**
 * Result of creating a subname
 */
export interface CreateSubnameResult {
  /** Whether the subname was created or already existed */
  created: boolean;
  /** Transaction hash if created */
  transactionHash?: string;
}

/**
 * Options for setting forward resolution
 */
export interface SetForwardResolutionOptions {
  /** The normalized ENS name */
  name: string;
  /** The contract address to resolve to */
  contractAddress: string;
  /** L1 wallet client */
  walletClient: WalletClient;
  /** L1 ENS contract addresses */
  contracts: ENSContracts;
  /** Contract type (for metrics) */
  contractType: ContractType;
  /** Optional operation type for metrics */
  opType?: string;
  /** Optional coin type for L2 resolution */
  coinType?: number;
  /** Enable metrics logging (default: false) */
  enableMetrics?: boolean;
}

/**
 * Result of setting forward resolution
 */
export interface SetForwardResolutionResult {
  /** Whether the forward resolution was set or already correct */
  set: boolean;
  /** Transaction hash if set */
  transactionHash?: string;
}

/**
 * Options for setting reverse resolution
 */
export interface SetReverseResolutionOptions {
  /** The normalized ENS name */
  name: string;
  /** The contract address to set reverse resolution for */
  contractAddress: string;
  /** L1 wallet client */
  walletClient: WalletClient;
  /** L1 ENS contract addresses */
  contracts: ENSContracts;
  /** Contract type */
  contractType: ContractType;
  /** Optional operation type for metrics */
  opType?: string;
  /** Enable metrics logging (default: false) */
  enableMetrics?: boolean;
}

/**
 * Result of setting reverse resolution
 */
export interface SetReverseResolutionResult {
  /** Whether the reverse resolution was set */
  set: boolean;
  /** Transaction hash if set */
  transactionHash?: string;
  /** Reason if not set */
  reason?: string;
}

