/**
 * @enscribe/core - Core library for ENS contract naming
 *
 * This library provides the core functionality for naming smart contracts
 * with ENS (Ethereum Name Service). It handles subname creation, forward
 * and reverse resolution, and supports both L1 and L2 networks.
 */

// Main API
export { nameContract } from "./naming.js";

// Individual naming steps (can be used independently)
export {
  createSubname,
  setForwardResolution,
  setReverseResolution,
} from "./naming.js";

// Utility functions
export {
  isOwnable,
  isReverseClaimable,
  isContractOwner,
} from "./naming.js";

export {
  isAddressEmpty,
  isAddressValid,
  parseNormalizedName,
  logMetric,
  METRICS_URL,
} from "./utils.js";

// Contract addresses configuration
export {
  ENS_CONTRACTS,
  getContractAddresses,
  getNetworkNameFromChainId,
  validateContractAddresses,
} from "./contracts.js";

export type { NetworkName } from "./contracts.js";

// Types
export type {
  ENSContracts,
  NameContractOptions,
  NameContractResult,
  ContractType,
  CreateSubnameOptions,
  CreateSubnameResult,
  SetForwardResolutionOptions,
  SetForwardResolutionResult,
  SetReverseResolutionOptions,
  SetReverseResolutionResult,
} from "./types.js";

// ABIs (for advanced use cases)
export { default as ensRegistryABI } from "./abi/ENSRegistry.js";
export { default as ownableContractABI } from "./abi/Ownable.js";
export { default as nameWrapperABI } from "./abi/NameWrapper.js";
export { default as publicResolverABI } from "./abi/PublicResolver.js";
export { default as reverseRegistrarABI } from "./abi/ReverseRegistrar.js";

