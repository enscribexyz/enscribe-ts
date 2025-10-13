import { namehash } from "viem/ens";
import { readContract, writeContract, waitForTransactionReceipt } from "viem/actions";
import { keccak256, toBytes } from "viem";
import type { WalletClient } from "viem";
import { randomUUID } from "crypto";

import ensRegistryABI from "./abi/ENSRegistry.js";
import ownableContractABI from "./abi/Ownable.js";
import nameWrapperABI from "./abi/NameWrapper.js";
import publicResolverABI from "./abi/PublicResolver.js";
import reverseRegistrarABI from "./abi/ReverseRegistrar.js";

import {
  isAddressEmpty,
  isAddressValid,
  parseNormalizedName,
  logMetric,
} from "./utils.js";

import type {
  NameContractOptions,
  NameContractResult,
  ContractType,
  ENSContracts,
  CreateSubnameOptions,
  CreateSubnameResult,
  SetForwardResolutionOptions,
  SetForwardResolutionResult,
  SetReverseResolutionOptions,
  SetReverseResolutionResult,
} from "./types.js";

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
 * Detect the contract type
 */
async function detectContractType(
  contractAddress: string,
  walletClient: WalletClient,
  ensRegistry: string,
): Promise<ContractType> {
  if (await isReverseClaimable(contractAddress, walletClient, ensRegistry)) {
    return "ReverseClaimer";
  }
  if (await isOwnable(contractAddress, walletClient)) {
    return "Ownable";
  }
  return "Unknown";
}

/**
 * Create a subname if it doesn't already exist
 * This function checks if a name exists and creates it if not
 */
export async function createSubname(
  options: CreateSubnameOptions,
): Promise<CreateSubnameResult> {
  const {
    name: normalizedName,
    walletClient,
    contracts,
    contractAddress,
    contractType,
    correlationId = randomUUID(),
    opType = "enscribe-nameexisting",
    enableMetrics = false,
  } = options;

  const { label, parent } = parseNormalizedName(normalizedName);
  const parentNode = namehash(parent);
  const labelHash = keccak256(toBytes(label));
  const fullNameNode = namehash(normalizedName);

  // Check if name exists
  const nameExists = (await readContract(walletClient, {
    address: contracts.ENS_REGISTRY as `0x${string}`,
    abi: ensRegistryABI,
    functionName: "recordExists",
    args: [fullNameNode],
  })) as boolean;

  if (nameExists) {
    return {
      created: false,
    };
  }

  // Create subname
  let txn;
  const isWrapped = await readContract(walletClient, {
    address: contracts.NAME_WRAPPER as `0x${string}`,
    abi: nameWrapperABI,
    functionName: "isWrapped",
    args: [parentNode],
  });

  if (isWrapped) {
    txn = await writeContract(walletClient, {
      address: contracts.NAME_WRAPPER as `0x${string}`,
      abi: nameWrapperABI,
      functionName: "setSubnodeRecord",
      args: [
        parentNode,
        label,
        walletClient.account?.address,
        contracts.PUBLIC_RESOLVER,
        0,
        0,
        0,
      ],
      account: walletClient.account!,
      chain: walletClient.chain,
    });
    await waitForTransactionReceipt(walletClient, { hash: txn });

    if (enableMetrics) {
      await logMetric(
        correlationId,
        Date.now(),
        walletClient.chain?.id!,
        contractAddress,
        walletClient.account?.address!,
        normalizedName,
        "subname::setSubnodeRecord",
        txn,
        contractType,
        opType,
      );
    }
  } else {
    txn = await writeContract(walletClient, {
      address: contracts.ENS_REGISTRY as `0x${string}`,
      abi: ensRegistryABI,
      functionName: "setSubnodeRecord",
      args: [
        parentNode,
        labelHash,
        walletClient.account?.address,
        contracts.PUBLIC_RESOLVER,
        0,
      ],
      account: walletClient.account!,
      chain: walletClient.chain,
    });

    await waitForTransactionReceipt(walletClient, { hash: txn });

    if (enableMetrics) {
      await logMetric(
        correlationId,
        Date.now(),
        walletClient.chain?.id!,
        contractAddress,
        walletClient.account?.address!,
        normalizedName,
        "subname::setSubnodeRecord",
        txn,
        contractType,
        opType,
      );
    }
  }

  return {
    created: true,
    transactionHash: txn,
  };
}

/**
 * Set forward resolution for a name to resolve to a contract address
 */
export async function setForwardResolution(
  options: SetForwardResolutionOptions,
): Promise<SetForwardResolutionResult> {
  const {
    name: normalizedName,
    contractAddress,
    walletClient,
    contracts,
    contractType,
    correlationId = randomUUID(),
    opType = "enscribe-nameexisting",
    coinType,
    enableMetrics = false,
  } = options;

  const fullNameNode = namehash(normalizedName);

  // Check current address
  const currentAddr = coinType
    ? ((await readContract(walletClient, {
        address: contracts.PUBLIC_RESOLVER as `0x${string}`,
        abi: publicResolverABI,
        functionName: "addr",
        args: [fullNameNode, coinType],
      })) as `0x${string}`)
    : ((await readContract(walletClient, {
        address: contracts.PUBLIC_RESOLVER as `0x${string}`,
        abi: publicResolverABI,
        functionName: "addr",
        args: [fullNameNode],
      })) as `0x${string}`);

  if (currentAddr.toLowerCase() === contractAddress.toLowerCase()) {
    return {
      set: false,
    };
  }

  // Set forward resolution
  const txn = coinType
    ? await writeContract(walletClient, {
        address: contracts.PUBLIC_RESOLVER as `0x${string}`,
        abi: publicResolverABI,
        functionName: "setAddr",
        args: [fullNameNode, coinType, contractAddress],
        account: walletClient.account!,
        chain: walletClient.chain,
      })
    : await writeContract(walletClient, {
        address: contracts.PUBLIC_RESOLVER as `0x${string}`,
        abi: publicResolverABI,
        functionName: "setAddr",
        args: [fullNameNode, contractAddress],
        account: walletClient.account!,
        chain: walletClient.chain,
      });

  await waitForTransactionReceipt(walletClient, { hash: txn });

  if (enableMetrics) {
    await logMetric(
      correlationId,
      Date.now(),
      walletClient.chain?.id!,
      contractAddress,
      walletClient.account?.address!,
      normalizedName,
      "fwdres::setAddr",
      txn,
      contractType,
      opType,
    );
  }

  return {
    set: true,
    transactionHash: txn,
  };
}

/**
 * Set reverse resolution for a contract to resolve back to an ENS name
 */
export async function setReverseResolution(
  options: SetReverseResolutionOptions,
): Promise<SetReverseResolutionResult> {
  const {
    name: normalizedName,
    contractAddress,
    walletClient,
    contracts,
    contractType,
    correlationId = randomUUID(),
    opType = "enscribe-nameexisting",
    enableMetrics = false,
  } = options;

  // Check if user is the contract owner
  const isOwner = await isContractOwner(
    contractAddress,
    walletClient,
    contracts.ENS_REGISTRY,
  );

  if (!isOwner) {
    return {
      set: false,
      reason: "not_owner",
    };
  }

  // Set reverse resolution based on contract type
  let txn;
  if (contractType === "ReverseClaimer") {
    const addrLabel = contractAddress.slice(2).toLowerCase();
    const reversedNode = namehash(addrLabel + "." + "addr.reverse");

    txn = await writeContract(walletClient, {
      address: contracts.PUBLIC_RESOLVER as `0x${string}`,
      abi: publicResolverABI,
      functionName: "setName",
      args: [reversedNode, normalizedName],
      account: walletClient.account!,
      chain: walletClient.chain,
    });

    await waitForTransactionReceipt(walletClient, { hash: txn });

    if (enableMetrics) {
      await logMetric(
        correlationId,
        Date.now(),
        walletClient.chain?.id!,
        contractAddress,
        walletClient.account?.address!,
        normalizedName,
        "revres::setName",
        txn,
        "ReverseClaimer",
        opType,
      );
    }
  } else if (contractType === "Ownable") {
    txn = await writeContract(walletClient, {
      address: contracts.REVERSE_REGISTRAR as `0x${string}`,
      abi: reverseRegistrarABI,
      functionName: "setNameForAddr",
      args: [
        contractAddress,
        walletClient.account?.address,
        contracts.PUBLIC_RESOLVER,
        normalizedName,
      ],
      account: walletClient.account!,
      chain: walletClient.chain,
    });

    await waitForTransactionReceipt(walletClient, { hash: txn });

    if (enableMetrics) {
      await logMetric(
        correlationId,
        Date.now(),
        walletClient.chain?.id!,
        contractAddress,
        walletClient.account?.address!,
        normalizedName,
        "revres::setNameForAddr",
        txn,
        "Ownable",
        opType,
      );
    }
  } else {
    throw new Error("Only Ownable, ERC173 and ReverseClaimer contracts can be named.");
  }

  return {
    set: true,
    transactionHash: txn,
  };
}

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
    l1WalletClient,
    l1Contracts,
    l2WalletClient,
    l2Contracts,
    correlationId = randomUUID(),
    opType = "enscribe-nameexisting",
    enableMetrics = false,
  } = options;

  const transactions: NameContractResult["transactions"] = {};

  // Detect contract type
  const contractType = await detectContractType(
    contractAddress,
    l1WalletClient,
    l1Contracts.ENS_REGISTRY,
  );

  // Create subname if it doesn't exist
  const subnameResult = await createSubname({
    name: normalizedName,
    walletClient: l1WalletClient,
    contracts: l1Contracts,
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
  const forwardResResult = await setForwardResolution({
    name: normalizedName,
    contractAddress,
    walletClient: l1WalletClient,
    contracts: l1Contracts,
    contractType,
    correlationId,
    opType,
    enableMetrics,
  });
  if (forwardResResult.set && forwardResResult.transactionHash) {
    transactions.forwardResolution = forwardResResult.transactionHash;
  }

  // Set reverse resolution
  const reverseResResult = await setReverseResolution({
    name: normalizedName,
    contractAddress,
    walletClient: l1WalletClient,
    contracts: l1Contracts,
    contractType,
    correlationId,
    opType,
    enableMetrics,
  });
  if (reverseResResult.set && reverseResResult.transactionHash) {
    transactions.reverseResolution = reverseResResult.transactionHash;
  }

  // Handle L2 if provided
  if (l2WalletClient && l2Contracts) {
    // Set forward resolution on L2
    const l2ForwardResResult = await setForwardResolution({
      name: normalizedName,
      contractAddress,
      walletClient: l1WalletClient,
      contracts: l1Contracts,
      contractType,
      correlationId,
      opType,
      coinType: Number(l2Contracts.COIN_TYPE),
      enableMetrics,
    });
    if (l2ForwardResResult.set && l2ForwardResResult.transactionHash) {
      transactions.l2ForwardResolution = l2ForwardResResult.transactionHash;
    }

    // Set reverse resolution on L2
    try {
      const ownerAddress = await readContract(l2WalletClient, {
        address: contractAddress as `0x${string}`,
        abi: ownableContractABI,
        functionName: "owner",
        args: [],
      });

      let txn = await writeContract(l2WalletClient, {
        address: l2Contracts.L2_REVERSE_REGISTRAR as `0x${string}`,
        abi: [
          {
            inputs: [
              {
                internalType: "address",
                name: "addr",
                type: "address",
              },
              {
                internalType: "string",
                name: "name",
                type: "string",
              },
            ],
            name: "setNameForAddr",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "setNameForAddr",
        args: [contractAddress as `0x${string}`, normalizedName],
        account: l2WalletClient.account!,
        chain: l2WalletClient.chain,
      });

      await waitForTransactionReceipt(l2WalletClient, { hash: txn });
      if (enableMetrics) {
        await logMetric(
          correlationId,
          Date.now(),
          l2WalletClient.chain?.id!,
          contractAddress,
          l2WalletClient.account?.address!,
          normalizedName,
          "revres::setNameForAddr",
          txn,
          contractType,
          opType,
        );
      }
      transactions.l2ReverseResolution = txn;
    } catch (err) {
      // Contract is not ownable on L2, skip reverse resolution
    }
  }

  const explorerUrl = `https://app.enscribe.xyz/explore/${l1WalletClient.chain?.id}/${normalizedName}`;

  return {
    success: true,
    name: normalizedName,
    contractAddress,
    transactions,
    contractType,
    explorerUrl,
  };
}

