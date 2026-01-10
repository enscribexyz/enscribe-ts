/**
 * @enscribe/enscribe - Core library for ENS contract naming
 *
 * This library provides the core functionality for naming smart contracts
 * with ENS (Ethereum Name Service). It handles subname creation, forward
 * and reverse resolution, and supports both L1 and L2 networks.
 */

// Main API
export { nameContract } from "./naming.js";

export {
  isContractOwner,
  isOwnable,
  isReverseClaimable,
  getNetworkInfo
} from "./utils.js";

export {
  getContractAddresses,
} from "./contracts.js";

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