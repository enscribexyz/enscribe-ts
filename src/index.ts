/**
 * @enscribe/enscribe - Core library for ENS contract naming
 *
 * This library provides the core functionality for naming smart contracts
 * with ENS (Ethereum Name Service). It handles subname creation, forward
 * and reverse resolution, and supports both L1 and L2 networks.
 */

// Main API
export { nameContract, setForwardName, setReverseName } from "./naming.js";

export {
  isContractOwner,
  isOwnable,
  isReverseClaimable,
  detectContractType,
  getNetworkInfo
} from "./utils.js";

export {
  getContractAddresses,
  getNetworkNameFromChainId,
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
  SetForwardNameOptions,
  SetReverseNameOptions,
} from "./types.js";

export type { NetworkName } from "./contracts.js";