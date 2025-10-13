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
  /** L1 wallet client */
  l1WalletClient: WalletClient;
  /** L1 ENS contract addresses */
  l1Contracts: ENSContracts;
  /** Optional L2 wallet client */
  l2WalletClient?: WalletClient | null;
  /** Optional L2 ENS contract addresses */
  l2Contracts?: ENSContracts | null;
  /** Optional correlation ID for metrics */
  correlationId?: string;
  /** Optional operation type for metrics */
  opType?: string;
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

