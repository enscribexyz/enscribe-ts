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

    console.log("contract implements Ownable");
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

    console.log("resolvedaddr is " + resolvedAddr);

    if (resolvedAddr.toLowerCase() === walletClient.account?.address.toLowerCase()) {
      console.log("contract implements Reverseclaimable");
      return true;
    } else {
      console.log("contract does not implement reverseclaimable");
      return false;
    }
  } catch (err) {
    console.log("there was an error checking if the contract was reverse claimer");
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
  } = options;

  const { label, parent } = parseNormalizedName(normalizedName);
  const parentNode = namehash(parent);
  const labelHash = keccak256(toBytes(label));
  const fullNameNode = namehash(normalizedName);

  const transactions: NameContractResult["transactions"] = {};

  // Check if name exists
  const nameExists = (await readContract(l1WalletClient, {
    address: l1Contracts.ENS_REGISTRY as `0x${string}`,
    abi: ensRegistryABI,
    functionName: "recordExists",
    args: [fullNameNode],
  })) as boolean;

  // Detect contract type
  const contractType = await detectContractType(
    contractAddress,
    l1WalletClient,
    l1Contracts.ENS_REGISTRY,
  );

  // Create subname if it doesn't exist
  if (!nameExists) {
    process.stdout.write(`creating subname ... `);
    let txn;
    const isWrapped = await readContract(l1WalletClient, {
      address: l1Contracts.NAME_WRAPPER as `0x${string}`,
      abi: nameWrapperABI,
      functionName: "isWrapped",
      args: [parentNode],
    });

    if (isWrapped) {
      txn = await writeContract(l1WalletClient, {
        address: l1Contracts.NAME_WRAPPER as `0x${string}`,
        abi: nameWrapperABI,
        functionName: "setSubnodeRecord",
        args: [
          parentNode,
          label,
          l1WalletClient.account?.address,
          l1Contracts.PUBLIC_RESOLVER,
          0,
          0,
          0,
        ],
        account: l1WalletClient.account!,
        chain: l1WalletClient.chain,
      });
      await waitForTransactionReceipt(l1WalletClient, { hash: txn });
      process.stdout.write(`done with txn: ${txn}\n`);

      await logMetric(
        correlationId,
        Date.now(),
        l1WalletClient.chain?.id!,
        contractAddress,
        l1WalletClient.account?.address!,
        normalizedName,
        "subname::setSubnodeRecord",
        txn,
        contractType,
        opType,
      );
    } else {
      txn = await writeContract(l1WalletClient, {
        address: l1Contracts.ENS_REGISTRY as `0x${string}`,
        abi: ensRegistryABI,
        functionName: "setSubnodeRecord",
        args: [
          parentNode,
          labelHash,
          l1WalletClient.account?.address,
          l1Contracts.PUBLIC_RESOLVER,
          0,
        ],
        account: l1WalletClient.account!,
        chain: l1WalletClient.chain,
      });

      await waitForTransactionReceipt(l1WalletClient, { hash: txn });
      process.stdout.write(`done with txn: ${txn}\n`);

      await logMetric(
        correlationId,
        Date.now(),
        l1WalletClient.chain?.id!,
        contractAddress,
        l1WalletClient.account?.address!,
        normalizedName,
        "subname::setSubnodeRecord",
        txn,
        contractType,
        opType,
      );
    }
    transactions.subname = txn;
  } else {
    process.stdout.write(`${normalizedName} already exists. skipping subname creation.\n`);
  }

  // Set forward resolution
  process.stdout.write(`setting forward resolution ... `);
  const currentAddr = (await readContract(l1WalletClient, {
    address: l1Contracts.PUBLIC_RESOLVER as `0x${string}`,
    abi: publicResolverABI,
    functionName: "addr",
    args: [fullNameNode],
  })) as `0x${string}`;

  if (currentAddr.toLowerCase() !== contractAddress.toLowerCase()) {
    let txn = await writeContract(l1WalletClient, {
      address: l1Contracts.PUBLIC_RESOLVER as `0x${string}`,
      abi: publicResolverABI,
      functionName: "setAddr",
      args: [fullNameNode, contractAddress],
      account: l1WalletClient.account!,
      chain: l1WalletClient.chain,
    });

    await waitForTransactionReceipt(l1WalletClient, { hash: txn });
    process.stdout.write(`done with txn: ${txn}\n`);
    await logMetric(
      correlationId,
      Date.now(),
      l1WalletClient.chain?.id!,
      contractAddress,
      l1WalletClient.account?.address!,
      normalizedName,
      "fwdres::setAddr",
      txn,
      contractType,
      opType,
    );
    transactions.forwardResolution = txn;
  } else {
    process.stdout.write("forward resolution already set.\n");
  }

  // Set reverse resolution
  process.stdout.write(`setting reverse resolution ... `);
  if (await isContractOwner(contractAddress, l1WalletClient, l1Contracts.ENS_REGISTRY)) {
    let txn;
    if (contractType === "ReverseClaimer") {
      const addrLabel = contractAddress.slice(2).toLowerCase();
      const reversedNode = namehash(addrLabel + "." + "addr.reverse");

      txn = await writeContract(l1WalletClient, {
        address: l1Contracts.PUBLIC_RESOLVER as `0x${string}`,
        abi: publicResolverABI,
        functionName: "setName",
        args: [reversedNode, normalizedName],
        account: l1WalletClient.account!,
        chain: l1WalletClient.chain,
      });

      await waitForTransactionReceipt(l1WalletClient, { hash: txn });
      process.stdout.write(`done with txn: ${txn}\n`);
      await logMetric(
        correlationId,
        Date.now(),
        l1WalletClient.chain?.id!,
        contractAddress,
        l1WalletClient.account?.address!,
        normalizedName,
        "revres::setName",
        txn,
        "ReverseClaimer",
        opType,
      );
    } else if (contractType === "Ownable") {
      txn = await writeContract(l1WalletClient, {
        address: l1Contracts.REVERSE_REGISTRAR as `0x${string}`,
        abi: reverseRegistrarABI,
        functionName: "setNameForAddr",
        args: [
          contractAddress,
          l1WalletClient.account?.address,
          l1Contracts.PUBLIC_RESOLVER,
          normalizedName,
        ],
        account: l1WalletClient.account!,
        chain: l1WalletClient.chain,
      });

      await waitForTransactionReceipt(l1WalletClient, { hash: txn });
      process.stdout.write(`done with txn: ${txn}\n`);
      await logMetric(
        correlationId,
        Date.now(),
        l1WalletClient.chain?.id!,
        contractAddress,
        l1WalletClient.account?.address!,
        normalizedName,
        "revres::setNameForAddr",
        txn,
        "Ownable",
        opType,
      );
    } else {
      throw new Error("Only Ownable, ERC173 and ReverseClaimer contracts can be named.");
    }
    transactions.reverseResolution = txn;
  } else {
    console.log("You are not the owner of this contract. Skipping reverse resolution.");
  }

  // Handle L2 if provided
  if (l2WalletClient && l2Contracts) {
    const l2CurrentAddr = (await readContract(l1WalletClient, {
      address: l1Contracts.PUBLIC_RESOLVER as `0x${string}`,
      abi: publicResolverABI,
      functionName: "addr",
      args: [fullNameNode, Number(l2Contracts.COIN_TYPE)],
    })) as `0x${string}`;

    // Set forward resolution on L2
    if (l2CurrentAddr.toLowerCase() !== contractAddress.toLowerCase()) {
      process.stdout.write(`setting forward resolution on L2 ... `);
      let txn = await writeContract(l1WalletClient, {
        address: l1Contracts.PUBLIC_RESOLVER as `0x${string}`,
        abi: publicResolverABI,
        functionName: "setAddr",
        args: [fullNameNode, Number(l2Contracts.COIN_TYPE), contractAddress],
        account: l1WalletClient.account!,
        chain: l1WalletClient.chain,
      });

      await waitForTransactionReceipt(l1WalletClient, { hash: txn });
      process.stdout.write(`done with txn: ${txn}\n`);
      await logMetric(
        correlationId,
        Date.now(),
        l1WalletClient.chain?.id!,
        contractAddress,
        l1WalletClient.account?.address!,
        normalizedName,
        "fwdres::setAddr",
        txn,
        contractType,
        opType,
      );
      transactions.l2ForwardResolution = txn;
    } else {
      console.log("forward resolution already set on L2.");
    }

    // Set reverse resolution on L2
    try {
      const ownerAddress = await readContract(l2WalletClient, {
        address: contractAddress as `0x${string}`,
        abi: ownableContractABI,
        functionName: "owner",
        args: [],
      });

      process.stdout.write(`setting reverse resolution on L2 ... `);
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
      process.stdout.write(`done with txn: ${txn}\n`);
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
      transactions.l2ReverseResolution = txn;
    } catch (err) {
      console.log("contract is not ownable on L2. skipping reverse resolution.");
    }
  }

  const explorerUrl = `https://app.enscribe.xyz/explore/${l1WalletClient.chain?.id}/${normalizedName}`;
  console.log(`✨ Contract named: ${explorerUrl}`);

  return {
    success: true,
    name: normalizedName,
    contractAddress,
    transactions,
    contractType,
    explorerUrl,
  };
}

