# embed-dossier-mstr-react

## 2.0.0

### Major Changes

- ## Breaking Changes

  - **React Peer Dependency**: `react` and `react-dom` have been moved to `peerDependencies` instead of `dependencies`. This prevents the package from bundling its own copy of React, reducing bundle size and preventing invalid hook call errors when used in React applications.
  - **Removed Dependencies**: Removed `classnames` dependency (replaced with internal `clsx` configuration).
  - **Styling Changes**: Removed hardcoded Tailwind classes spanning layout configurations. Components now accept `className` and `style` props, defaulting to `width: 100%` and `height: 600px` for safer integrations without depending on consumer Tailwind setups.
  - **Event Enum Update**: `EVENT_TYPE` has been transitioned from an exportable type to an iterable constant object (e.g. `EVENT_TYPE.ON_PAGE_SWITCHED`), allowing consumers to reference runtime values correctly.

  ## Features & Fixes

  - **Memory Leak Fixes**: Added proper container unmount detection and API cleanup methods (`dashboard.close()`) to all hooks.
  - **Robust ESM/CJS Exports**: Introduced explicit exports map in `package.json` for enhanced TypeScript / Next.js app router compatibility.
  - **Stable SDK Loading**: Eliminated race conditions tied to consecutive hooks dispatching script loads via multiple app mount renders.

## 1.0.0

### Major Changes

- embed-dossier-mstr-react is a React package that provides components and utilities for embedding MicroStrategy dashboards and dossiers into React applications. It's currently at version 0.1.0 and is published as an open-source package under the MIT license.

## 1.0.1

### Minor Changes

- Updated the README.md file to include a link to the CHANGELOG.md file.
- Interfaces and types added to the package.

## 1.0.2

### Minor Changes

## 1.1.0

### Major Changes

- Added authentication support for embedding dossiers, dashboards, bot consumption page, and library page.
- Bug fixes and improvements.
