<div align="center">

# embed-dossier-mstr

[![CI](https://github.com/Ibrairsyad17/embed-dossier-mstr/actions/workflows/ci.yml/badge.svg)](https://github.com/Ibrairsyad17/embed-dossier-mstr/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/embed-dossier-mstr-react.svg)](https://www.npmjs.com/package/embed-dossier-mstr-react)
[![npm downloads](https://img.shields.io/npm/dm/embed-dossier-mstr-react.svg)](https://www.npmjs.com/package/embed-dossier-mstr-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)

**A production-ready React library for embedding MicroStrategy Dashboards, Reports, and Bot pages.**

Type-safe · Lazy-loaded · Fully tested · Multiple auth methods

[Quick Start](#-quick-start) · [Documentation](#-api-reference) · [Examples](#-advanced-usage) · [Contributing](./CONTRIBUTING.md)

</div>

---

## Why this library?

MicroStrategy's Embedding SDK is powerful but low-level — it requires manual script injection, global `window` mutations, and has zero TypeScript support. This library wraps it into **clean, idiomatic React** with:

- 🎯 **Full TypeScript coverage** — 40+ interfaces, no `any` in your code
- ⚡ **Lazy SDK loading** — SDK is loaded on-demand, not upfront
- 🧹 **Automatic cleanup** — Dashboards are closed on unmount, scripts removed
- 🔐 **5 auth methods** — Guest, Standard, LDAP, SAML, OIDC out of the box
- 🎣 **Two integration patterns** — Simple components or flexible hooks
- 🧪 **Comprehensive tests** — All components and hooks tested with Vitest

## 📦 Installation

```bash
npm install embed-dossier-mstr-react
```

**Peer dependencies:** React 18.2+ or React 19

## ⚡ Quick Start

```tsx
import { DashboardEmbed } from "embed-dossier-mstr-react";

function App() {
  return (
    <DashboardEmbed
      dossierUrl="https://demo.microstrategy.com/MicroStrategyLibrary/app/B7CA92F04B9FAE8D941C3E9B7E0CD754/27D332AC6D43352E0928B9A1FCAF4AB0"
      style={{ width: "100%", height: "800px" }}
    />
  );
}
```

That's it. The component handles SDK loading, dashboard creation, and cleanup automatically.

## 🔐 With Authentication

```tsx
import { DashboardEmbedWithAuth } from "embed-dossier-mstr-react";

function SecureDashboard() {
  return (
    <DashboardEmbedWithAuth
      dossierUrl="https://your-server.com/MicroStrategyLibrary/app/{projectId}/{dossierId}"
      loginMode="standard"
      username="analyst"
      password="password"
      style={{ width: "100%", height: "800px" }}
      loadingComponent={<div>Authenticating...</div>}
      errorComponent={(error) => <div>Error: {error}</div>}
    />
  );
}
```

## 🎣 Hook-Based Integration

For full control over the dashboard lifecycle:

```tsx
import { useCreateDashboard, getInfoFromUrl } from "embed-dossier-mstr-react";

function CustomDashboard({ url }: { url: string }) {
  const { serverUrlLibrary } = getInfoFromUrl(url);

  const { dashboard, containerRef, isSdkLoaded, isDashboardError } =
    useCreateDashboard({
      serverUrlLibrary,
      config: { url },
    });

  if (isDashboardError) return <div>Failed to load</div>;
  if (!isSdkLoaded) return <div>Loading SDK...</div>;

  // Access dashboard methods: dashboard.refresh(), dashboard.getFilterList(), etc.

  return <div ref={containerRef} style={{ width: "100%", height: "800px" }} />;
}
```

## 🔧 Advanced Usage

### Full Configuration

```tsx
import {
  DashboardEmbed,
  MicroStrategyDossierConfig,
} from "embed-dossier-mstr-react";

const config: Omit<MicroStrategyDossierConfig, "placeholder" | "url"> = {
  enableResponsive: true,
  enableCollaboration: true,
  navigationBar: {
    enabled: true,
    gotoLibrary: true,
    title: true,
    toc: true,
    reset: true,
    filter: true,
    bookmark: true,
  },
  filterFeature: { enabled: true, edit: true, summary: true },
  shareFeature: { enabled: true, link: true, export: true },
};

<DashboardEmbed
  dossierUrl={url}
  config={config}
  style={{ width: "100%", height: "800px" }}
/>;
```

### Event Handling

```tsx
import { EVENT_TYPE } from "embed-dossier-mstr-react";

// After getting the dashboard instance via hooks:
dashboard.registerEventHandler(EVENT_TYPE.ON_PAGE_SWITCHED, (event) => {
  console.log("Page switched:", event);
});

dashboard.registerEventHandler(EVENT_TYPE.ON_FILTER_UPDATED, (event) => {
  console.log("Filter changed:", event);
});
```

## 📚 API Reference

### Components

| Component                    | Description                                  |
| ---------------------------- | -------------------------------------------- |
| `DashboardEmbed`             | Embed a dashboard with automatic SDK loading |
| `DashboardEmbedWithAuth`     | Dashboard with built-in authentication       |
| `LibraryPageEmbed`           | Embed the MicroStrategy Library page         |
| `LibraryPageEmbedWithAuth`   | Library page with authentication             |
| `BotConsumptionPage`         | Embed a Bot Consumption page                 |
| `BotConsumptionPageWithAuth` | Bot page with authentication                 |

### Hooks

| Hook                                  | Description                             |
| ------------------------------------- | --------------------------------------- |
| `useCreateDashboard`                  | Create and manage a dashboard instance  |
| `useCreateDashboardWithAuth`          | Dashboard with authentication lifecycle |
| `useCreateLibraryPage`                | Create a library page instance          |
| `useCreateLibraryPageWithAuth`        | Library page with auth                  |
| `useCreateBotConsumptionPage`         | Create a bot page instance              |
| `useCreateBotConsumptionPageWithAuth` | Bot page with auth                      |
| `useLoadMstrSDK`                      | Load the MicroStrategy SDK              |

### Utilities

| Function                             | Description                         |
| ------------------------------------ | ----------------------------------- |
| `getInfoFromUrl(url)`                | Parse a dossier URL into components |
| `getServerUrl(url)`                  | Extract the server base URL         |
| `getAuthToken({ serverUrlLibrary })` | Get an existing auth token          |

## 🏗️ Project Structure

This is a monorepo managed with [Turborepo](https://turbo.build/):

```
├── packages/
│   └── embed-dossier-mstr-react/   # Core library (published to npm)
├── apps/
│   └── docs/                        # Documentation site (Next.js)
```

## 🧪 Testing

```bash
pnpm install
pnpm --filter embed-dossier-mstr-react test        # Run tests
pnpm --filter embed-dossier-mstr-react coverage     # Coverage report
pnpm --filter embed-dossier-mstr-react test:ui      # Visual test runner
```

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

[MIT](./LICENSE) © Ibrahim Irsyad
