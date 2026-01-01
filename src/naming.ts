import { writeContract, waitForTransactionReceipt, readContract } from "viem/actions";
import type { WalletClient } from "viem";
import { randomUUID } from "crypto";

import ownableContractABI from "./abi/Ownable.js";

import {
  logMetric,
  isOwnable,
  isReverseClaimable,
  detectContractType,
  getNetworkInfo,
} from "./utils.js";

import type {
  NameContractOptions,
  NameContractResult,
  ContractType,
  ENSContracts,
} from "./types.js";

import { getContractAddresses } from "./contracts.js";
import {
  createSubname as createSubnameL1,
  setForwardResolution as setForwardResolutionL1,
  setReverseResolution as setReverseResolutionL1,
} from "./L1Naming.js";
import {
  createSubname as createSubnameL2,
  setForwardResolution as setForwardResolutionL2,
  setReverseResolution as setReverseResolutionL2,
} from "./L2Naming.js";

/**
 * Name a contract with ENS
 * This is the main entry point for the library
 */
export async function nameContract(
  options: NameContractOptions,
): Promise<NameContractResult> {
  const {
    name: normalizedName,
    contractAddress,
    walletClient,
    chainName,
    opType = "enscribe-nameexisting",
    enableMetrics = false,
  } = options;

  const correlationId = randomUUID();
  const transactions: NameContractResult["transactions"] = {};

  // Determine network configuration
  const networkInfo = getNetworkInfo(chainName);
  const contracts = getContractAddresses(networkInfo.networkName as any);

  // Detect contract type
  const contractType = await detectContractType(
    contractAddress,
    walletClient,
    contracts.ENS_REGISTRY,
  );

  if (!networkInfo.isL2) { // L1 network naming
    // Create subname if it doesn't exist
    const subnameResult = await createSubnameL1({
      name: normalizedName,
      walletClient,
      contracts,
      contractAddress,
      contractType,
      correlationId,
      opType,
      enableMetrics,
    });
    if (subnameResult.created && subnameResult.transactionHash) {
      transactions.subname = subnameResult.transactionHash;
    }

    // Set forward resolution
    const forwardResResult = await setForwardResolutionL1({
      name: normalizedName,
      contractAddress,
      walletClient,
      contracts,
      contractType,
      correlationId,
      opType,
      enableMetrics,
    });
    if (forwardResResult.set && forwardResResult.transactionHash) {
      transactions.forwardResolution = forwardResResult.transactionHash;
    }

    // Set reverse resolution
    const reverseResResult = await setReverseResolutionL1({
      name: normalizedName,
      contractAddress,
      walletClient,
      contracts,
      contractType,
      correlationId,
      opType,
      enableMetrics,
    });
    if (reverseResResult.set && reverseResResult.transactionHash) {
      transactions.reverseResolution = reverseResResult.transactionHash;
    }
  } else {
    // Handle L2 network naming
    const subnameResult = await createSubnameL2({
      name: normalizedName,
      walletClient,
      contracts,
      contractAddress,
      contractType,
      correlationId,
      opType,
      enableMetrics,
    });
    if (subnameResult.created && subnameResult.transactionHash) {
      transactions.subname = subnameResult.transactionHash;
    }

    // Set forward resolution on L2
    const l2ForwardResResult = await setForwardResolutionL2({
      name: normalizedName,
      contractAddress,
      walletClient,
      contracts,
      contractType,
      correlationId,
      opType,
      coinType: Number(contracts.COIN_TYPE),
      enableMetrics,
    });
    if (l2ForwardResResult.set && l2ForwardResResult.transactionHash) {
      transactions.forwardResolution = l2ForwardResResult.transactionHash;
    }

    // Set reverse resolution on L2
    const l2ReverseResResult = await setReverseResolutionL2({
      name: normalizedName,
      contractAddress,
      walletClient,
      contracts,
      contractType,
      correlationId,
      opType,
      enableMetrics,
    });
    if (l2ReverseResResult.set && l2ReverseResResult.transactionHash) {
      transactions.reverseResolution = l2ReverseResResult.transactionHash;
    }
  }

  const explorerUrl = `https://app.enscribe.xyz/explore/${walletClient.chain?.id}/${normalizedName}`;

  return {
    success: true,
    name: normalizedName,
    contractAddress,
    transactions,
    contractType,
    explorerUrl,
  };
}

