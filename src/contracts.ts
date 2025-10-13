// ENS Contract addresses for different networks
export const ENS_CONTRACTS = {
  // Mainnet addresses
  mainnet: {
    ENS_REGISTRY: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    PUBLIC_RESOLVER: "0xF29100983E058B709F3D539b0c765937B804AC15",
    NAME_WRAPPER: "0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401",
    REVERSE_REGISTRAR: "0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb",
    L2_REVERSE_REGISTRAR: "",
    COIN_TYPE: 60,
  },
  // Sepolia testnet addresses
  sepolia: {
    ENS_REGISTRY: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    PUBLIC_RESOLVER: "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5",
    NAME_WRAPPER: "0x0635513f179D50A207757E05759CbD106d7dFcE8",
    REVERSE_REGISTRAR: "0xA0a1AbcDAe1a2a4A2EF8e9113Ff0e02DD81DC0C6",
    L2_REVERSE_REGISTRAR: "",
    COIN_TYPE: 60,
  },
  // Linea mainnet addresses
  linea: {
    ENS_REGISTRY: "0x50130b669B28C339991d8676FA73CF122a121267",
    PUBLIC_RESOLVER: "0x86c5AED9F27837074612288610fB98ccC1733126",
    NAME_WRAPPER: "0xA53cca02F98D590819141Aa85C891e2Af713C223",
    REVERSE_REGISTRAR: "0x08D3fF6E65f680844fd2465393ff6f0d742b67D5",
    L2_REVERSE_REGISTRAR: "0x0000000000D8e504002cC26E3Ec46D81971C1664",
    COIN_TYPE: 2147542792,
  },
  // Linea Sepolia testnet addresses
  "linea-sepolia": {
    ENS_REGISTRY: "0x5B2636F0f2137B4aE722C01dd5122D7d3e9541f7",
    PUBLIC_RESOLVER: "0xA2008916Ed2d7ED0Ecd747a8a5309267e42cf1f1",
    NAME_WRAPPER: "0xF127De9E039a789806fEd4C6b1C0f3aFfeA9425e",
    REVERSE_REGISTRAR: "0x4aAA964D8EB65508ca3DA3b0A3C060c16059E613",
    L2_REVERSE_REGISTRAR: "0x00000BeEF055f7934784D6d81b6BC86665630dbA",
    COIN_TYPE: 2147542789,
  },
  // Base mainnet addresses
  base: {
    ENS_REGISTRY: "0xB94704422c2a1E396835A571837Aa5AE53285a95",
    PUBLIC_RESOLVER: "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD",
    NAME_WRAPPER: "",
    REVERSE_REGISTRAR: "0x79EA96012eEa67A83431F1701B3dFf7e37F9E282",
    L2_REVERSE_REGISTRAR: "0x0000000000D8e504002cC26E3Ec46D81971C1664",
    COIN_TYPE: 2147492101,
  },
  // Base Sepolia testnet addresses
  "base-sepolia": {
    ENS_REGISTRY: "0x1493b2567056c2181630115660963E13A8E32735",
    PUBLIC_RESOLVER: "0x6533C94869D28fAA8dF77cc63f9e2b2D6Cf77eBA",
    NAME_WRAPPER: "",
    REVERSE_REGISTRAR: "0xa0A8401ECF248a9375a0a71C4dedc263dA18dCd7",
    L2_REVERSE_REGISTRAR: "0x00000BeEF055f7934784D6d81b6BC86665630dbA",
    COIN_TYPE: 2147568180,
  },
  // Optimism mainnet addresses
  optimism: {
    ENS_REGISTRY: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    PUBLIC_RESOLVER: "",
    NAME_WRAPPER: "",
    REVERSE_REGISTRAR: "",
    L2_REVERSE_REGISTRAR: "0x0000000000D8e504002cC26E3Ec46D81971C1664",
    COIN_TYPE: 2147483658,
  },
  // Optimism Sepolia testnet addresses
  "optimism-sepolia": {
    ENS_REGISTRY: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    PUBLIC_RESOLVER: "",
    NAME_WRAPPER: "",
    REVERSE_REGISTRAR: "",
    L2_REVERSE_REGISTRAR: "0x00000BeEF055f7934784D6d81b6BC86665630dbA",
    COIN_TYPE: 2158639068,
  },
  // Arbitrum mainnet addresses
  arbitrum: {
    ENS_REGISTRY: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    PUBLIC_RESOLVER: "",
    NAME_WRAPPER: "",
    REVERSE_REGISTRAR: "",
    L2_REVERSE_REGISTRAR: "0x0000000000D8e504002cC26E3Ec46D81971C1664",
    COIN_TYPE: 2147525809,
  },
  // Arbitrum Sepolia testnet addresses
  "arbitrum-sepolia": {
    ENS_REGISTRY: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    PUBLIC_RESOLVER: "",
    NAME_WRAPPER: "",
    REVERSE_REGISTRAR: "",
    L2_REVERSE_REGISTRAR: "0x00000BeEF055f7934784D6d81b6BC86665630dbA",
    COIN_TYPE: 2147905262,
  },
  // Scroll mainnet addresses
  scroll: {
    ENS_REGISTRY: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    PUBLIC_RESOLVER: "",
    NAME_WRAPPER: "",
    REVERSE_REGISTRAR: "",
    L2_REVERSE_REGISTRAR: "0x0000000000D8e504002cC26E3Ec46D81971C1664",
    COIN_TYPE: 2148018000,
  },
  // Scroll Sepolia testnet addresses
  "scroll-sepolia": {
    ENS_REGISTRY: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    PUBLIC_RESOLVER: "",
    NAME_WRAPPER: "",
    REVERSE_REGISTRAR: "",
    L2_REVERSE_REGISTRAR: "0x00000BeEF055f7934784D6d81b6BC86665630dbA",
    COIN_TYPE: 2148017999,
  },
  // Local development addresses (will be set during deployment)
  localhost: {
    ENS_REGISTRY: "0x0000000000000000000000000000000000000000", // Placeholder for local development
    PUBLIC_RESOLVER: "",
    NAME_WRAPPER: "",
    REVERSE_REGISTRAR: "",
    L2_REVERSE_REGISTRAR: "",
    COIN_TYPE: 60,
  },
} as const;

export type NetworkName = keyof typeof ENS_CONTRACTS;

// Helper function to get contract addresses for a given network
export function getContractAddresses(networkName: NetworkName) {
  const addresses = ENS_CONTRACTS[networkName];
  
  if (!addresses) {
    throw new Error(`Unsupported network: ${networkName}`);
  }
  
  return addresses;
}

// Helper function to get network name from chain ID
export function getNetworkNameFromChainId(chainId: number): NetworkName {
  switch (chainId) {
    case 1:
      return "mainnet";
    case 11155111:
      return "sepolia";
    case 59144:
      return "linea";
    case 59141:
      return "linea-sepolia";
    case 8453:
      return "base";
    case 84532:
      return "base-sepolia";
    case 10:
      return "optimism";
    case 11155420:
      return "optimism-sepolia";
    case 42161:
      return "arbitrum";
    case 421614:
      return "arbitrum-sepolia";
    case 534352:
      return "scroll";
    case 534351:
      return "scroll-sepolia";
    case 31337:
      return "localhost";
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}

// Helper function to validate contract addresses
export function validateContractAddresses(addresses: Record<string, string>): void {
  const requiredContracts = ["ENS_REGISTRY"]; // Only ENS_REGISTRY is always required
  const optionalContracts = ["PUBLIC_RESOLVER", "NAME_WRAPPER", "REVERSE_REGISTRAR", "L2_REVERSE_REGISTRAR"];
  
  // Validate required contracts
  for (const contract of requiredContracts) {
    if (!addresses[contract]) {
      throw new Error(`Missing contract address for ${contract}`);
    }
    
    if (!addresses[contract].match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error(`Invalid contract address format for ${contract}: ${addresses[contract]}`);
    }
  }
  
  // Validate optional contracts (if provided, must be valid format)
  for (const contract of optionalContracts) {
    if (addresses[contract] && addresses[contract] !== "" && !addresses[contract].match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error(`Invalid contract address format for ${contract}: ${addresses[contract]}`);
    }
  }
}
