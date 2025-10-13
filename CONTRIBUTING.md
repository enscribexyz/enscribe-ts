# Contributing to @enscribe/core

Thank you for your interest in contributing to @enscribe/core! This document provides guidelines and instructions for contributing.

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/enscribexyz/enscribe-core.git
cd enscribe-core
```

2. Install dependencies:
```bash
pnpm install
```

3. Build the library:
```bash
pnpm run build
```

## Project Structure

```
enscribe/
├── src/
│   ├── abi/           # ENS contract ABIs
│   ├── contracts.ts   # Contract addresses configuration
│   ├── naming.ts      # Core naming logic
│   ├── types.ts       # TypeScript type definitions
│   ├── utils.ts       # Utility functions
│   └── index.ts       # Main exports
├── dist/              # Built output (generated)
└── README.md          # Documentation
```

## Development Workflow

### Building

```bash
pnpm run build
```

### Cleaning

```bash
pnpm run clean
```

### Local Testing

To test the library locally with another project:

```bash
# In the enscribe directory
pnpm link --global

# In your test project
pnpm link --global @enscribe/core
```

## Adding New Networks

To add support for a new network:

1. Open `src/contracts.ts`
2. Add the network configuration to the `ENS_CONTRACTS` object:
```typescript
"your-network": {
  ENS_REGISTRY: "0x...",
  PUBLIC_RESOLVER: "0x...",
  NAME_WRAPPER: "0x...",
  REVERSE_REGISTRAR: "0x...",
  L2_REVERSE_REGISTRAR: "0x...", // If L2
  COIN_TYPE: 60, // Or appropriate coin type
}
```
3. Add the chain ID mapping in `getNetworkNameFromChainId()`
4. Update the README with the new network
5. Test thoroughly

## Code Style

- Use TypeScript for all code
- Follow existing code formatting
- Use meaningful variable and function names
- Add JSDoc comments for exported functions
- Keep functions focused and modular

## Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Build and test: `pnpm run build`
5. Commit your changes: `git commit -am 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature-name`
7. Submit a pull request

## Pull Request Guidelines

- Provide a clear description of the changes
- Reference any related issues
- Ensure the code builds without errors
- Update documentation as needed
- Keep PRs focused on a single feature or fix

## Reporting Issues

- Use the GitHub issue tracker
- Provide a clear description of the issue
- Include steps to reproduce
- Provide environment details (Node version, OS, etc.)
- Include relevant error messages or logs

## Questions?

If you have questions about contributing, feel free to:
- Open an issue for discussion
- Reach out to the maintainers
- Check existing issues and discussions

Thank you for contributing to @enscribe/core! 🎉

