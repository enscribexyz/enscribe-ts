# Development Guide

## Overview

`@enscribe/enscribe` is a standalone TypeScript library for ENS contract naming. It can be used by any JavaScript/TypeScript application, including the `@enscribe/hardhat-enscribe` plugin.

## Repository Structure

This library lives independently from the Hardhat plugin at `/Users/abhi/code/enscribe/`.

The related Hardhat plugin is located at `/Users/abhi/code/hardhat-enscribe/` and depends on this library.

## Local Development Setup

### Initial Setup

1. **Install dependencies:**
```bash
cd /Users/abhi/code/enscribe
pnpm install
```

2. **Build the library:**
```bash
pnpm run build
```

### Working with the Hardhat Plugin

If you're developing both the library and the Hardhat plugin simultaneously:

1. **Link the library locally** (in the plugin directory):
```bash
cd /Users/abhi/code/hardhat-enscribe
pnpm install /Users/abhi/code/enscribe
```

2. **After making changes to the library:**
```bash
cd /Users/abhi/code/enscribe
pnpm run build

# The plugin will automatically use the updated version
cd /Users/abhi/code/hardhat-enscribe
pnpm run build
```

### Development Workflow

1. **Make changes** to the library source in `src/`
2. **Build** the library: `pnpm run build`
3. **Test** in the plugin or your application
4. **Iterate** as needed

### Available Scripts

- `pnpm run build` - Build the TypeScript source to JavaScript
- `pnpm run clean` - Remove the `dist/` directory
- `pnpm run prepublishOnly` - Clean and build before publishing (runs automatically)

## Publishing

### Prerequisites

1. Update the version in `package.json`
2. Ensure all changes are committed
3. Build and test thoroughly

### Publishing to npm

```bash
# Login to npm (if not already)
npm login

# Publish (this will run prepublishOnly automatically)
pnpm publish
```

For a beta/alpha release:
```bash
pnpm publish --tag beta
```

### After Publishing

1. Update the plugin's `package.json` to use the published version:
```json
{
  "dependencies": {
    "@enscribe/enscribe": "^0.1.0"
  }
}
```

2. In the plugin directory, install the published version:
```bash
cd /Users/abhi/code/hardhat-enscribe
pnpm install
```

## Testing

### Unit Testing

Add test files in `src/` with `.test.ts` extension (these are excluded from npm package via `.npmignore`).

### Integration Testing

Test the library with:
1. The Hardhat plugin
2. A standalone script
3. Other applications

Example standalone test script:
```typescript
import { nameContract, getContractAddresses } from "@enscribe/enscribe";
// ... test code
```

## Project Structure

```
enscribe/
├── src/
│   ├── abi/              # ENS contract ABIs
│   │   ├── ENSRegistry.ts
│   │   ├── NameWrapper.ts
│   │   ├── Ownable.ts
│   │   ├── PublicResolver.ts
│   │   └── ReverseRegistrar.ts
│   ├── contracts.ts      # Contract addresses for all networks
│   ├── naming.ts         # Core naming logic
│   ├── types.ts          # TypeScript type definitions
│   ├── utils.ts          # Utility functions
│   └── index.ts          # Main exports
├── dist/                 # Built output (git-ignored)
├── package.json
├── tsconfig.json
├── README.md
├── LICENSE
├── CONTRIBUTING.md
└── DEVELOPMENT.md (this file)
```

## Version Management

Follow semantic versioning:
- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backwards compatible
- **PATCH** (0.0.1): Bug fixes, backwards compatible

## Continuous Integration

(TODO: Add CI/CD setup instructions when configured)

## Troubleshooting

### "Cannot find module '@enscribe/enscribe'"

If the plugin can't find the library:
1. Ensure the library is built: `cd /Users/abhi/code/enscribe && pnpm run build`
2. Re-link in plugin: `cd /Users/abhi/code/hardhat-enscribe && pnpm install /Users/abhi/code/enscribe`

### Build Errors

- Clear and rebuild: `pnpm run clean && pnpm run build`
- Check TypeScript version compatibility
- Ensure all dependencies are installed

### Publishing Issues

- Ensure you're logged in to npm: `npm whoami`
- Check package name availability on npmjs.com
- Verify `package.json` is correct

## Questions?

See [CONTRIBUTING.md](./CONTRIBUTING.md) or reach out to the maintainers.

