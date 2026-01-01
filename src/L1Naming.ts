import { namehash } from "viem/ens";
import { readContract, writeContract, waitForTransactionReceipt } from "viem/actions";
import { keccak256, toBytes } from "viem";

import ensRegistryABI from "./abi/ENSRegistry.js";
import nameWrapperABI from "./abi/NameWrapper.js";
import publicResolverABI from "./abi/PublicResolver.js";
import reverseRegistrarABI from "./abi/ReverseRegistrar.js";

import {
  parseNormalizedName,
  logMetric,
  isContractOwner,
} from "./utils.js";

import type {
  CreateSubnameOptions,
  CreateSubnameResult,
  SetForwardResolutionOptions,
  SetForwardResolutionResult,
  SetReverseResolutionOptions,
  SetReverseResolutionResult,
} from "./types.js";

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
    correlationId,
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
    correlationId,
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
    correlationId,
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

