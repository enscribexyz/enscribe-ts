# SKILLS.md

## Skill: ENS Contract Naming During Deployment

Use this skill when an AI coding agent needs to name a newly deployed smart contract with `@enscribe/enscribe`.

## When To Use

Use after deployment succeeds and you have:

- deployed contract address
- signer-capable `walletClient`
- target ENS name
- supported chain name

## Required Inputs

Call `nameContract()` with the current `NameContractOptions` contract:

- `name: string` (normalized ENS name)
- `contractAddress: string`
- `walletClient: WalletClient` (must have account/signing capability)
- `chainName: string` (supported key)
- `opType?: string`
- `enableMetrics?: boolean`

Important: use `src/types.ts` as API truth. Do not assume README-only fields exist unless they are present in exported types.

## Standard Execution Playbook

1. Normalize and validate inputs
   - Ensure ENS name is normalized
   - Ensure contract address is a valid EVM address
   - Ensure wallet client can sign/write on target chain
2. Validate chain support
   - Use supported network names from `src/contracts.ts`
3. Execute naming
   - Call `nameContract({ ... })`
4. Persist operation output
   - Store `success`, `contractType`, `transactions`, `explorerUrl`
5. Report result to developer
   - Include transaction hashes and explorer URL

## Expected Result Shape

`NameContractResult` returns:

- `success: boolean`
- `name: string`
- `contractAddress: string`
- `transactions: { subname?, forwardResolution?, reverseResolution? }`
- `contractType: "Ownable" | "ReverseClaimer" | "Unknown"`
- `explorerUrl: string`

Treat missing transaction hashes as a possible no-op/already-correct path, not always a failure.

## Failure Handling

Handle and report these common cases cleanly:

- Unsupported chain name / chain ID mapping issues
- Unsupported or unknown contract type (`Unknown`)
- Ownership constraints (`not_owner` style outcomes on reverse resolution)
- Misconfigured network addresses for optional ENS components
- Wallet cannot sign or account missing

When failing, return actionable remediation steps:

- confirm `chainName`
- confirm ownership/deployer account
- confirm ENS infra addresses for the network
- retry with normalized name

## Safe Defaults For Agent Integrations

- Prefer `enableMetrics: true` in CI or automated deploy pipelines.
- Pass a meaningful `opType` when available (e.g., `deploy-postname`).
- Never hardcode assumptions about non-exported internals.
- Import only from package root: `@enscribe/enscribe`.

## Minimal Integration Example

```ts
import { nameContract } from "@enscribe/enscribe";

const result = await nameContract({
  name: "mycontract.myname.eth",
  contractAddress,
  walletClient,
  chainName: "sepolia",
  opType: "deploy-postname",
  enableMetrics: true,
});
```

## Maintenance Note For Agents

Before generating integration code, verify:

- package-root exports in `src/index.ts`
- latest option/result types in `src/types.ts`

If README differs from typed exports, follow typed exports.
