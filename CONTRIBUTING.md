# Contributing to embed-dossier-mstr

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) 8.x

### Getting Started

```bash
# Clone the repository
git clone https://github.com/Ibrairsyad17/embed-dossier-mstr.git
cd embed-dossier-mstr

# Install dependencies
pnpm install

# Start development mode
pnpm dev
```

### Project Structure

```
embed-dossier-mstr/
├── packages/
│   └── embed-dossier-mstr-react/   # Core React library
│       ├── src/
│       │   ├── components/          # React components
│       │   ├── hooks/               # Custom hooks
│       │   ├── types/               # TypeScript definitions
│       │   ├── constants/           # Constants
│       │   ├── tests/               # Test suite
│       │   └── utils.ts             # Utilities
│       ├── vitest.config.ts         # Test config
│       └── tsconfig.json            # TS config
├── apps/
│   └── docs/                        # Documentation site (Next.js)
└── turbo.json                       # Turborepo config
```

## Development Workflow

### Available Scripts

```bash
# From the root of the monorepo:
pnpm dev          # Start dev mode for all packages
pnpm build        # Build all packages
pnpm lint         # Lint all packages
pnpm test         # Run tests (in the react package)

# From packages/embed-dossier-mstr-react:
pnpm test         # Run tests
pnpm test:ui      # Run tests with Vitest UI
pnpm coverage     # Generate coverage report
pnpm lint:fix     # Auto-fix lint issues
```

### Making Changes

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/your-feature
   ```

2. **Make your changes** in the relevant package.

3. **Write or update tests** for your changes.

4. **Run quality checks**:
   ```bash
   pnpm lint
   pnpm build
   pnpm --filter embed-dossier-mstr-react test
   ```

5. **Add a changeset** (if your change affects the public API):
   ```bash
   pnpm changeset
   ```

6. **Commit** using [conventional commits](https://www.conventionalcommits.org/):
   ```
   feat: add new dashboard event handler
   fix: resolve SDK cleanup on unmount
   docs: update README examples
   ```

7. **Open a pull request** against `main`.

## Code Standards

### TypeScript

- Use strict mode (`strict: true` in tsconfig)
- Export types explicitly — don't rely on type inference for public APIs
- Add JSDoc comments to all exported functions, hooks, and components

### React

- Use functional components with hooks
- Clean up side effects in `useEffect` return functions
- Use `useRef` for values that shouldn't trigger re-renders
- Avoid inline object/function creation in component props (use `useMemo`/`useCallback`)

### Testing

- Write tests for all new components and hooks
- Test both success and error paths
- Use `@testing-library/react` for component tests
- Use `renderHook` for hook tests
- Aim for >80% coverage on new code

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use for |
|--------|---------|
| `feat:` | New features |
| `fix:` | Bug fixes |
| `docs:` | Documentation changes |
| `test:` | Adding or updating tests |
| `refactor:` | Code changes that neither fix bugs nor add features |
| `chore:` | Build process, tooling, or dependency changes |
| `perf:` | Performance improvements |

## Submitting a Pull Request

1. Ensure all checks pass (lint, build, test)
2. Add a changeset if applicable (`pnpm changeset`)
3. Fill out the PR template
4. Request a review

## Reporting Issues

- Use the [bug report template](https://github.com/Ibrairsyad17/embed-dossier-mstr/issues/new?template=bug_report.yml) for bugs
- Use the [feature request template](https://github.com/Ibrairsyad17/embed-dossier-mstr/issues/new?template=feature_request.yml) for suggestions

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
