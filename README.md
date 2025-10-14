# @enscribe/enscribe

Core TypeScript library for ENS contract naming. This library provides the fundamental functionality for naming smart contracts with ENS (Ethereum Name Service), handling subname creation, forward and reverse resolution, and supporting both L1 and L2 networks.

## Installation

```bash
npm install @enscribe/enscribe
# or
pnpm add @enscribe/enscribe
# or
yarn add @enscribe/enscribe
```

## Usage

### Basic Example

```typescript
import { nameContract } from "@enscribe/enscribe";
import { createWalletClient, http } from "viem";
import { sepolia } from "viem/chains";

// Create a wallet client
const walletClient = createWalletClient({
  chain: sepolia,
  transport: http(),
  account: "0x...", // your account address
});

// Name a contract - the library handles all network configuration internally
const result = await nameContract({
  name: "mycontract.myname.eth",
  contractAddress: "0x1234567890123456789012345678901234567890",
  walletClient,
  chainName: "sepolia", // Library determines contracts and network logic
  enableMetrics: true, // Optional: enable metrics logging
});

console.log(`Contract named successfully!`);
console.log(`Explorer URL: ${result.explorerUrl}`);
console.log(`Contract Type: ${result.contractType}`);
console.log(`Transactions:`, result.transactions);
```

### With L2 Support

```typescript
import { nameContract } from "@enscribe/enscribe";
import { createWalletClient, http } from "viem";
import { optimismSepolia } from "viem/chains";

// Create L2 wallet client
const l2WalletClient = createWalletClient({
  chain: optimismSepolia,
  transport: http(),
  account: "0x...",
});

// Name a contract on L2 - library handles all network logic
const result = await nameContract({
  name: "mycontract.myname.eth",
  contractAddress: "0x1234567890123456789012345678901234567890",
  walletClient: l2WalletClient, // L2 wallet client
  chainName: "optimism-sepolia", // Library determines L1/L2 setup
  enableMetrics: true,
});
```

## API Reference

### `nameContract(options: NameContractOptions): Promise<NameContractResult>`

The main function to name a contract with ENS.

#### Options

- **name** (`string`): The normalized ENS name to assign to the contract
- **contractAddress** (`string`): The address of the contract to name  
- **walletClient** (`WalletClient`): Viem wallet client for transactions
- **chainName** (`string`): Network name (e.g., "sepolia", "optimism-sepolia", "base", etc.)
- **l2WalletClient** (`WalletClient | null`, optional): Additional L2 wallet client if needed
- **correlationId** (`string`, optional): Correlation ID for metrics tracking
- **opType** (`string`, optional): Operation type for metrics
- **enableMetrics** (`boolean`, optional): Enable metrics logging (default: false)

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
import { getContractAddresses } from "@enscribe/enscribe";

const contracts = getContractAddresses("sepolia");
console.log(contracts.ENS_REGISTRY); // "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"
```

#### `getNetworkNameFromChainId(chainId: number): NetworkName`

Get the network name from a chain ID.

**Example:**
```typescript
import { getNetworkNameFromChainId } from "@enscribe/enscribe";

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

