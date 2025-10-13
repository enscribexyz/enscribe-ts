# @enscribe/core

Core TypeScript library for ENS contract naming. This library provides the fundamental functionality for naming smart contracts with ENS (Ethereum Name Service), handling subname creation, forward and reverse resolution, and supporting both L1 and L2 networks.

## Installation

```bash
npm install @enscribe/core viem
# or
pnpm add @enscribe/core viem
# or
yarn add @enscribe/core viem
```

## Usage

### Basic Example

```typescript
import { nameContract, getContractAddresses } from "@enscribe/core";
import { createWalletClient, http } from "viem";
import { sepolia } from "viem/chains";

// Create a wallet client
const walletClient = createWalletClient({
  chain: sepolia,
  transport: http(),
  account: "0x...", // your account address
});

// Get contract addresses for Sepolia
const l1Contracts = getContractAddresses("sepolia");

// Name a contract
const result = await nameContract({
  name: "mycontract.myname.eth",
  contractAddress: "0x1234567890123456789012345678901234567890",
  l1WalletClient: walletClient,
  l1Contracts: {
    ENS_REGISTRY: l1Contracts.ENS_REGISTRY,
    PUBLIC_RESOLVER: l1Contracts.PUBLIC_RESOLVER,
    NAME_WRAPPER: l1Contracts.NAME_WRAPPER,
    REVERSE_REGISTRAR: l1Contracts.REVERSE_REGISTRAR,
  },
});

console.log(`Contract named successfully!`);
console.log(`Explorer URL: ${result.explorerUrl}`);
console.log(`Contract Type: ${result.contractType}`);
console.log(`Transactions:`, result.transactions);
```

### With L2 Support

```typescript
import { nameContract, getContractAddresses } from "@enscribe/core";

// Get contract addresses for both networks
const l1Contracts = getContractAddresses("sepolia");
const l2Contracts = getContractAddresses("optimism-sepolia");

const result = await nameContract({
  name: "mycontract.myname.eth",
  contractAddress: "0x1234567890123456789012345678901234567890",
  l1WalletClient: l1Client,
  l1Contracts: {
    ENS_REGISTRY: l1Contracts.ENS_REGISTRY,
    PUBLIC_RESOLVER: l1Contracts.PUBLIC_RESOLVER,
    NAME_WRAPPER: l1Contracts.NAME_WRAPPER,
    REVERSE_REGISTRAR: l1Contracts.REVERSE_REGISTRAR,
  },
  l2WalletClient: l2Client,
  l2Contracts: {
    ENS_REGISTRY: l2Contracts.ENS_REGISTRY,
    PUBLIC_RESOLVER: l2Contracts.PUBLIC_RESOLVER,
    NAME_WRAPPER: l2Contracts.NAME_WRAPPER,
    REVERSE_REGISTRAR: l2Contracts.REVERSE_REGISTRAR,
    L2_REVERSE_REGISTRAR: l2Contracts.L2_REVERSE_REGISTRAR,
    COIN_TYPE: l2Contracts.COIN_TYPE,
  },
});
```

## API Reference

### `nameContract(options: NameContractOptions): Promise<NameContractResult>`

The main function to name a contract with ENS.

#### Options

- **name** (`string`): The normalized ENS name to assign to the contract
- **contractAddress** (`string`): The address of the contract to name
- **l1WalletClient** (`WalletClient`): Viem wallet client for L1 transactions
- **l1Contracts** (`ENSContracts`): L1 ENS contract addresses
- **l2WalletClient** (`WalletClient | null`, optional): Viem wallet client for L2 transactions
- **l2Contracts** (`ENSContracts | null`, optional): L2 ENS contract addresses
- **correlationId** (`string`, optional): Correlation ID for metrics tracking
- **opType** (`string`, optional): Operation type for metrics

#### Returns

A `NameContractResult` object containing:

- **success** (`boolean`): Whether the operation succeeded
- **name** (`string`): The normalized name that was set
- **contractAddress** (`string`): The contract address that was named
- **transactions** (`object`): Transaction hashes for each operation
  - `subname`: Subname creation transaction
  - `forwardResolution`: Forward resolution transaction
  - `reverseResolution`: Reverse resolution transaction
  - `l2ForwardResolution`: L2 forward resolution transaction (if applicable)
  - `l2ReverseResolution`: L2 reverse resolution transaction (if applicable)
- **contractType** (`"Ownable" | "ReverseClaimer" | "Unknown"`): Detected contract type
- **explorerUrl** (`string`): ENScribe explorer URL for the named contract

### Utility Functions

#### `isOwnable(address: string, walletClient: WalletClient): Promise<boolean>`

Check if a contract implements the Ownable interface.

#### `isReverseClaimable(address: string, walletClient: WalletClient, ensRegistry: string): Promise<boolean>`

Check if a contract implements ReverseClaimer.

#### `isContractOwner(address: string, walletClient: WalletClient, ensRegistry: string): Promise<boolean>`

Check if the wallet is the owner of the contract.

#### `parseNormalizedName(name: string): { label: string; parent: string }`

Parse a normalized ENS name into label and parent components.

#### `isAddressValid(address: string): boolean`

Validate an Ethereum address.

### Contract Configuration

#### `getContractAddresses(networkName: NetworkName): ENSContracts`

Get ENS contract addresses for a specific network.

**Supported Networks:**
- Mainnet: `"mainnet"`
- Testnets: `"sepolia"`
- L2 Mainnets: `"linea"`, `"base"`, `"optimism"`, `"arbitrum"`, `"scroll"`
- L2 Testnets: `"linea-sepolia"`, `"base-sepolia"`, `"optimism-sepolia"`, `"arbitrum-sepolia"`, `"scroll-sepolia"`
- Local: `"localhost"`

**Example:**
```typescript
import { getContractAddresses } from "@enscribe/core";

const contracts = getContractAddresses("sepolia");
console.log(contracts.ENS_REGISTRY); // "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"
```

#### `getNetworkNameFromChainId(chainId: number): NetworkName`

Get the network name from a chain ID.

**Example:**
```typescript
import { getNetworkNameFromChainId } from "@enscribe/core";

const networkName = getNetworkNameFromChainId(11155111); // "sepolia"
```

#### `validateContractAddresses(addresses: Record<string, string>): void`

Validate that contract addresses are properly formatted.

#### `ENS_CONTRACTS`

A constant object containing all pre-configured ENS contract addresses for supported networks.

## Types

The library exports the following TypeScript types:

- `ENSContracts`: ENS contract addresses configuration
- `NameContractOptions`: Options for the `nameContract` function
- `NameContractResult`: Result from naming a contract
- `ContractType`: Type of contract detected

## Contract Support

This library supports naming the following contract types:

1. **Ownable Contracts**: Contracts that implement the Ownable pattern with an `owner()` function
2. **ReverseClaimer Contracts**: Contracts that have claimed their reverse ENS record

## Requirements

- Node.js >= 18.0.0
- viem >= 2.0.0

## License

MIT

## Links

- [ENScribe](https://enscribe.xyz)
- [GitHub](https://github.com/enscribexyz/hardhat-enscribe)
- [Documentation](https://docs.enscribe.xyz)

