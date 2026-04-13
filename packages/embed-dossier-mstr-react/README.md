# embed-dossier-mstr-react

[![npm version](https://img.shields.io/npm/v/embed-dossier-mstr-react.svg)](https://www.npmjs.com/package/embed-dossier-mstr-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](https://vitest.dev/)

> A production-ready React library for embedding MicroStrategy Dossiers, Reports, and Bot Consumption pages with full TypeScript support and comprehensive testing.

## 🚀 Features

- **🎯 Type-Safe**: Full TypeScript support with 40+ interfaces and type definitions
- **⚡ Performance Optimized**: Lazy SDK loading, error boundaries, and efficient re-render prevention
- **🧪 Well-Tested**: Comprehensive unit tests with Vitest and React Testing Library
- **📦 Multiple Integration Patterns**: Components, hooks, and authenticated variants
- **🎨 Highly Customizable**: 20+ configuration options for UI, navigation, and features
- **📚 Comprehensive Documentation**: 23+ API reference pages with examples
- **🔐 Authentication Support**: Built-in authentication handling with custom token support
- **🔄 Event-Driven**: 22 event handlers for complete lifecycle control

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Advanced Usage](#advanced-usage)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Use Cases

This library is ideal for:
- Embedding interactive MicroStrategy dashboards in React applications
- Building custom analytics portals with MicroStrategy integration
- Creating white-labeled BI solutions
- Integrating MicroStrategy reports into existing React ecosystems

## 📦 Installation

```bash
npm install embed-dossier-mstr-react
```

or

```bash
yarn add embed-dossier-mstr-react
```

or

```bash
pnpm add embed-dossier-mstr-react
```

**Requirements:**
- React 18.2.0 or higher
- TypeScript 5.5+ (for TypeScript projects)
- Modern browser with ES6+ support

## 🏗️ Architecture

This library is built with modern development practices:

```
embed-dossier-mstr-react/
├── src/
│   ├── components/          # React components
│   │   ├── DashboardEmbed
│   │   ├── DashboardEmbedWithAuth
│   │   ├── BotConsumptionPage
│   │   └── LibraryPageEmbed
│   ├── hooks/               # Custom React hooks
│   │   ├── useCreateDashboard
│   │   ├── useCreateDashboardWithAuth
│   │   ├── useCreateBotConsumptionPage
│   │   └── useLoadMstrSDK
│   ├── types/               # TypeScript definitions (40+ interfaces)
│   │   ├── index.ts         # Core types
│   │   ├── events.ts        # Event handlers (22 types)
│   │   ├── filter.ts        # Filter configurations
│   │   ├── navigation.ts    # Navigation interfaces
│   │   └── settings.ts      # Settings & customization
│   ├── tests/               # Comprehensive test suite
│   └── utils.ts             # Helper functions
├── vitest.config.ts         # Test configuration
└── tsconfig.json            # TypeScript configuration
```

**Key Technical Decisions:**
- **Monorepo Architecture**: Uses Turborepo for efficient build orchestration
- **Lazy Loading**: MicroStrategy SDK loaded on-demand to optimize initial bundle size
- **Error Boundaries**: Graceful error handling with fallback UI
- **Event-Driven Design**: 22 event handlers for complete application lifecycle control
- **Type Safety**: Comprehensive TypeScript definitions prevent runtime errors

## ⚡ Quick Start

### Basic Usage

The simplest way to embed a MicroStrategy Dossier:

```tsx
import { DashboardEmbed } from "embed-dossier-mstr-react";

const MinimalTemplateEmbed = () => {
  return (
    <DashboardEmbed
      dossierUrl="https://demo.microstrategy.com/MicroStrategyLibrary/app/B7CA92F04B9FAE8D941C3E9B7E0CD754/27D332AC6D43352E0928B9A1FCAF4AB0"
      style={{
        width: "1000px",
        height: "1200px",
      }}
    />
  );
};

export default MinimalTemplateEmbed;
```

That's it! You have successfully embedded a dashboard with automatic SDK loading and error handling.

## 🔧 Advanced Usage

### Customized Configuration

For production applications, you'll want granular control over features and UI:

```tsx {6-79} showLineNumbers
import {
  DashboardEmbed,
  MicroStrategyDossierConfig,
} from "embed-dossier-mstr-react";

const dossierConfig: Omit<MicroStrategyDossierConfig, "placeholder" | "url"> = {
  customUi: {},
  disableNotification: true,
  dockedComment: {
    dockedPosition: "left",
    canClose: true,
    dockChangeable: false,
    isDocked: false,
  },
  dockedFilter: {
    dockedPosition: "left",
    canClose: true,
    dockChangeable: false,
    isDocked: false,
  },
  dossierFeature: {
    readonly: false,
  },
  enableCollaboration: true,
  enableCustomAuthentication: false,
  enableResponsive: true,
  filterFeature: {
    enabled: true,
    edit: true,
    summary: true,
  },
  filters: [],
  navigationBar: {
    enabled: true,
    gotoLibrary: true,
    title: true,
    toc: true,
    reset: true,
    reprompt: true,
    share: true,
    comment: true,
    notification: true,
    filter: true,
    options: true,
    bookmark: true,
    edit: false,
  },
  optionsFeature: {
    enabled: true,
    help: false,
    logout: true,
    manage: false,
    showTutorials: false,
  },
  shareFeature: {
    enabled: true,
    invite: false,
    link: true,
    email: false,
    export: true,
    download: false,
    shareDossier: false,
    subscribe: false,
  },
  smartBanner: false,
  tocFeature: {
    enabled: true,
  },
  uiMessage: {
    enabled: true,
    addToLibrary: false,
  },
  visibleTutorials: {
    library: true,
    welcome: false,
    dossier: true,
    notification: false,
  },
};

const SimpleDashboardEmbed = () => {
  return (
    <DashboardEmbed
      dossierUrl="https://demo.microstrategy.com/MicroStrategyLibrary/app/B7CA92F04B9FAE8D941C3E9B7E0CD754/27D332AC6D43352E0928B9A1FCAF4AB0"
      config={dossierConfig}
      style={{
        width: "1000px",
        height: "1200px",
      }}
    />
  );
};

export default SimpleDashboardEmbed;
```

**Key Configuration Options:**
- **Navigation Bar**: Control visibility of 14+ UI elements (share, filter, bookmark, etc.)
- **Docked Panels**: Configure comment and filter panel behavior
- **Features**: Enable/disable collaboration, responsive design, tutorials
- **Sharing**: Granular control over export, download, and sharing capabilities

## 🎣 Hook-Based Integration

For maximum flexibility and control over the dashboard lifecycle:

```tsx
import cn from "classnames";
import {
  getInfoFromUrl,
  MicroStrategyDossierConfig,
  useCreateDashboard,
} from "embed-dossier-mstr-react";

interface EmbedWithHooksProps {
  dossierUrl: string; // https://{env-url}/{libraryName}/app/{projectId}/{dossierId}
  className?: string;
  style?: React.CSSProperties;
  config?: Omit<MicroStrategyDossierConfig, "placeholder" | "url">;
}

const EmbedWithHooks = ({
  dossierUrl,
  className,
  style,
  config,
}: EmbedWithHooksProps) => {
  let serverUrlLibrary = "";

  try {
    const urlInfo = getInfoFromUrl(dossierUrl);
    serverUrlLibrary = urlInfo.serverUrlLibrary;
  } catch (error) {
    console.error("Failed to parse dossier URL:", error);
  }

  const { dashboard, containerRef, isSdkLoaded, isDashboardError } =
    useCreateDashboard({
      serverUrlLibrary,
      config: {
        url: dossierUrl,
        ...config,
      },
    });

  if (isDashboardError) {
    return <div>Failed to load dashboard</div>;
  }

  if (!isSdkLoaded) {
    return <div>Loading...</div>;
  }

  if (dashboard) {
    console.log("Dashboard instance created:", dashboard);
    // Access dashboard methods:
    // - dashboard.getCurrentPageVisualization()
    // - dashboard.setFilterState()
    // - dashboard.refresh()
  }

  return <div ref={containerRef} className={cn(className)} style={style} />;
};

export { EmbedWithHooks };
```

**Hook Benefits:**
- Access to dashboard instance for programmatic control
- Custom loading and error states
- Fine-grained lifecycle management
- Integration with existing state management

### Authentication Support

For applications requiring secure access:

```tsx
import { DashboardEmbedWithAuth } from "embed-dossier-mstr-react";

const SecureDashboard = () => {
  return (
    <DashboardEmbedWithAuth
      dossierUrl="https://your-server.com/MicroStrategyLibrary/app/{projectId}/{dossierId}"
      authToken="your-auth-token"
      style={{ width: "100%", height: "800px" }}
    />
  );
};
```

## 📚 API Reference

This library provides comprehensive TypeScript definitions:

### Components
- `DashboardEmbed` - Basic dossier embedding
- `DashboardEmbedWithAuth` - Authenticated dossier embedding
- `BotConsumptionPage` - Bot consumption page embedding
- `LibraryPageEmbed` - MicroStrategy library page

### Hooks
- `useCreateDashboard` - Create dashboard instance
- `useCreateDashboardWithAuth` - Create authenticated dashboard
- `useCreateBotConsumptionPage` - Create bot consumption page
- `useLoadMstrSDK` - Load MicroStrategy SDK

### Types & Interfaces
Over 40 TypeScript interfaces including:
- `MicroStrategyDossierConfig` - Main configuration interface
- `EventHandlers` - 22 event handler types
- `NavigationBar` - Navigation customization
- `CustomUi` - UI customization options
- `FilterTypeInfo` - Filter configurations
- And many more...

[📖 View Full API Documentation](https://your-docs-url.com)

## 🧪 Testing & Quality Assurance

This library maintains high code quality standards:

```bash
# Run unit tests
pnpm test

# Run tests with UI
pnpm test:ui

# Generate coverage report
pnpm coverage
```

**Testing Stack:**
- **Vitest**: Fast unit test runner
- **React Testing Library**: Component testing
- **jsdom**: DOM simulation
- **Coverage**: V8 coverage reporting

**Test Coverage:**
- ✅ All components tested
- ✅ All hooks tested
- ✅ Edge cases covered (error handling, network failures)
- ✅ Integration tests for authentication flow

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Development mode with hot reload
pnpm dev

# Build for production
pnpm build

# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix
```

## 🏗️ Project Structure

This is part of a monorepo built with:
- **Turborepo**: Build system optimization
- **TypeScript**: Type safety
- **Vitest**: Testing framework
- **Changesets**: Version management
- **pnpm**: Fast, efficient package manager

## 🤝 Contributing

Contributions are welcome! This project demonstrates:
1. Clean code architecture
2. Comprehensive testing
3. Type-safe development
4. Modern React patterns
5. Performance optimization

## 📄 License

MIT © [Your Name]

## 🔗 Links

- [Documentation](https://your-docs-url.com)
- [npm Package](https://www.npmjs.com/package/embed-dossier-mstr-react)
- [GitHub Repository](https://github.com/Ibrairsyad17/embed-dossier-mstr)
- [Issue Tracker](https://github.com/Ibrairsyad17/embed-dossier-mstr/issues)

---

**Built with ❤️ using React, TypeScript, and modern development practices**
