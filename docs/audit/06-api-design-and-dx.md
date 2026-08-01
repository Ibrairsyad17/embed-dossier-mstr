# 06 — API Design & Developer Experience

> The public surface is well documented and well typed in structure, but has one hard
> compatibility gap (Next.js App Router) and several rough edges that consumers hit
> immediately.

| ID                                                                           | Severity  | Summary                                               |
| ---------------------------------------------------------------------------- | --------- | ----------------------------------------------------- |
| [H-03](#h-03--no-use-client-directives-breaks-nextjs-app-router)             | 🟠 High   | No `"use client"` — unusable in RSC without a wrapper |
| [M-01](#m-01--getinfofromurl-returns-string--undefined-for-validated-fields) | 🟡 Medium | Validated fields typed as possibly `undefined`        |
| [L-03](#l-03--unconditional-console-output-in-shipped-code)                  | 🔵 Low    | 10 `console.*` calls with no opt-out                  |
| [L-04](#l-04--any-in-the-public-event-type)                                  | 🔵 Low    | `any` in `EventHandler` contradicts the README        |
| [L-05](#l-05--declared-but-unreachable-sdk-surface)                          | 🔵 Low    | SDK members typed but never exposed                   |

---

## H-03 — No `"use client"` directives breaks Next.js App Router

```
$ grep -rl "use client" packages/embed-dossier-mstr-react/src/
NONE — no 'use client' directives
```

Every component and hook in this package uses `useState`, `useEffect`, `useRef` and touches
`window` and `document`. In the Next.js App Router, modules are **server components by
default**. Importing `DashboardEmbed` into a server component fails at build time:

```
Error: You're importing a component that needs `useState`. This React Hook only works
in a Client Component. To fix, mark the file with the "use client" directive.
```

### Why this matters more than usual here

The project's **own documentation site is Next.js 16 App Router** (`apps/docs/app/`). The
library is aimed squarely at the audience most likely to hit this, and the docs never mention
the workaround, so a reader following the Quick Start verbatim gets a build error with no
pointer to the fix.

The current workaround — which consumers must discover themselves — is to hand-write a wrapper:

```tsx
// app/_components/dashboard.tsx
"use client";
export { DashboardEmbed } from "embed-dossier-mstr-react";
```

That is friction the package should absorb.

### Fix

**Option A — directive at the entry point (simplest).** Add to `src/index.ts`:

```ts
"use client";
export * from "./exports";
```

tsup preserves the banner into both `dist/index.js` and `dist/index.mjs`. One line, everything
works. The cost: the whole package becomes client-only, including `getInfoFromUrl` and
`getServerUrl`, which are pure functions perfectly usable on the server.

**Option B — per-file directives (recommended).** Mark only the modules that need it —
every file under `src/components/` and `src/hooks/`:

```tsx
"use client";

import { useCreateDashboard } from "../hooks/useCreateDashboard";
// …
```

Then verify the banner survives bundling. tsup can strip directives during minification, so add
an explicit banner and confirm:

```ts
// tsup.config.ts (currently the build is inline flags in package.json —
// moving to a config file is worthwhile for exactly this reason)
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  external: ["react", "react-dom"],
  banner: { js: '"use client";' },
});
```

**Option C — split entry points (most correct, more work).** Ship
`embed-dossier-mstr-react` (client) and `embed-dossier-mstr-react/utils` (isomorphic) via the
`exports` map, so server code can import the URL helpers without pulling in client-only
modules.

### Also required: SSR guards

`"use client"` does **not** mean "never runs on the server" — client components are still
server-rendered for the initial HTML. Any module-scope or render-phase access to `window` or
`document` will throw during SSR.

The effects are safe (effects do not run on the server), but harden the entry points anyway:

```ts
if (typeof window === "undefined") return;
```

in `useLoadMstrSDK` (see the [H-09 fix](./02-lifecycle-and-correctness.md#fix--module-level-promise-cache),
which includes this), and in the `requireSdk()` accessor from
[H-07](./02-lifecycle-and-correctness.md#h-07--windowmicrostrategy-is-typed-as-always-present).

### Verification

Add an SSR smoke test — this catches the whole class:

```tsx
// src/tests/ssr.test.tsx
import { renderToString } from "react-dom/server";
import { DashboardEmbed } from "../components/DashboardEmbed";

it("renders to a string without touching window", () => {
  const html = renderToString(
    <DashboardEmbed dossierUrl="https://h/Lib/app/P/D" />,
  );
  expect(html).toContain("<div");
});
```

Run it in a `node` environment, not `jsdom`, so `window` is genuinely absent:

```ts
/** @vitest-environment node */
```

And document the App Router story explicitly in the installation guide once fixed.

---

## M-01 — `getInfoFromUrl` returns `string | undefined` for validated fields

From the **shipped** `dist/index.d.ts:1413-1419`:

```ts
declare const getInfoFromUrl: (url: string) => {
  serverUrl: string;
  serverUrlLibrary: string;
  libraryName: string | undefined; // ← always defined at runtime
  projectId: string | undefined; // ← always defined at runtime
  dossierId: string | undefined; // ← always defined at runtime
};
```

### Why

`tsconfig.json` enables `noUncheckedIndexedAccess: true` (a good setting), which types every
array index access as `T | undefined`. `utils.ts:52-55` reads:

```ts
const libraryName = pathSegments[0];
const projectId = pathSegments[2];
const dossierId = pathSegments[3];
```

TypeScript widens all three to `string | undefined` — even though four lines earlier the
function has already proven they exist:

```ts
if (pathSegments.length < 4 || pathSegments[1] !== "app") {
  throw new Error(/* … */);
}
```

The guard is correct; the compiler just cannot connect `length >= 4` to the specific indices.

### Impact

Every consumer on `strict` mode must null-check values that are guaranteed present:

```tsx
const { projectId } = getInfoFromUrl(url);
doSomething(projectId); // ✗ string | undefined not assignable to string
doSomething(projectId!); // consumers reach for this
```

Since the README leads with `getInfoFromUrl` in its hook example, this is one of the first
things a user encounters. Non-null assertions in consumer code are exactly what
`noUncheckedIndexedAccess` was meant to prevent — the library is exporting the problem.

### Fix — destructure with a tuple guard

```ts
const [libraryName, appSegment, projectId, dossierId] = pathSegments;

if (!libraryName || appSegment !== "app" || !projectId || !dossierId) {
  throw new Error(
    `Invalid MicroStrategy URL path: "${parsed.pathname}". ` +
      `Expected format: /{libraryName}/app/{projectId}/{dossierId}`,
  );
}

// All four are narrowed to `string` here.
return {
  serverUrl: parsed.origin,
  serverUrlLibrary: `${parsed.origin}/${libraryName}`,
  libraryName,
  projectId,
  dossierId,
};
```

This narrows correctly _and_ strengthens validation: the current check accepts empty segments
(`https://h//app//` passes `length >= 4`), while the destructured version rejects them.

Lock the signature in with a type test so it cannot silently regress:

```ts
import { expectTypeOf } from "vitest";

it("returns non-optional path components", () => {
  expectTypeOf(getInfoFromUrl("https://h/Lib/app/P/D")).toMatchTypeOf<{
    serverUrl: string;
    serverUrlLibrary: string;
    libraryName: string;
    projectId: string;
    dossierId: string;
  }>();
});
```

### Related

Add an explicit return interface and export it, so consumers can name the type:

```ts
export interface DossierUrlInfo {
  serverUrl: string;
  serverUrlLibrary: string;
  libraryName: string;
  projectId: string;
  dossierId: string;
}
```

Currently the return type is inferred and anonymous — usable, but awkward to reference in
consumer signatures.

---

## L-03 — Unconditional `console.*` output in shipped code

Ten `console.error` / `console.warn` calls ship in the bundle:

```
utils.ts:117                          "Failed to get auth token:"
useCreateDashboard.ts:62              "Failed to create dashboard:"
useCreateDashboardWithAuth.ts:209     "Dashboard auth error:"
useCreateBotConsumptionPage.ts:49     (bare error)
useCreateBotConsumptionPageWithAuth.ts:127
useCreateLibraryPage.ts:69, :76
useCreateLibraryPageWithAuth.ts:111
DashboardEmbed.tsx:43                 "Failed to parse dossier URL:"
setup.ts:21                           (test-only)
```

Consumers cannot silence them. In an app with several embeds and a transient network problem,
the console fills with library noise that the application cannot route into its own logger or
suppress in production.

`useCreateBotConsumptionPage.ts:49` is the worst of them — `console.error(error)` with no
context string, so the message gives no indication of which library produced it.

### Fix

Accept an optional logger, defaulting to current behaviour so nothing breaks:

```ts
export interface EmbedLogger {
  error(message: string, error?: unknown): void;
  warn(message: string, detail?: unknown): void;
}

const defaultLogger: EmbedLogger = {
  error: (m, e) => console.error(`[embed-dossier-mstr-react] ${m}`, e),
  warn: (m, d) => console.warn(`[embed-dossier-mstr-react] ${m}`, d),
};
```

Thread it through hook props as `logger?: EmbedLogger`. At minimum, prefix every message with
`[embed-dossier-mstr-react]` so output is attributable — that alone is a one-line-per-site fix
and a real improvement.

Note the ESLint config already allows this (`"no-console": ["warn", { allow: ["warn", "error"] }]`),
so the rule will not push back.

---

## L-04 — `any` in the public event type

`README.md:25` claims:

> 🎯 **Full TypeScript coverage** — 40+ interfaces, no `any` in your code

The repository contains exactly one `any` in shipped source — and it is on the public event
API, `src/types/events.ts:13`:

```ts
export type EventHandler = (event?: any) => void;
```

So every event handler a consumer registers receives an untyped payload:

```ts
dashboard.registerEventHandler(EVENT_TYPE.ON_FILTER_UPDATED, (event) => {
  event.anything.at.all; // no checking whatsoever
});
```

The README claim is defensible on a technicality — the `any` is in _library_ code, not
_your_ code — but the practical effect is that the highest-traffic callback surface is
unchecked.

### Fix

Even `unknown` is a strict improvement, forcing a narrow at the call site:

```ts
export type EventHandler<TEvent = unknown> = (event?: TEvent) => void;
```

Better, map event types to payloads so handlers are inferred:

```ts
export interface EventPayloadMap {
  [EVENT_TYPE.ON_PAGE_SWITCHED]: { pageKey: string; chapterKey: string };
  [EVENT_TYPE.ON_FILTER_UPDATED]: { filters: FilterJson[] };
  // …fill in from the MicroStrategy SDK docs, incrementally
}

export type EventHandlerFor<K extends keyof EventPayloadMap> = (
  event: EventPayloadMap[K],
) => void;
```

This can land incrementally — start with the events the README documents
(`ON_PAGE_SWITCHED`, `ON_FILTER_UPDATED`), fall back to `unknown` for the rest. Until then,
soften the README claim to _"no implicit `any`"_, which is accurate.

---

## L-05 — Declared but unreachable SDK surface

`src/types/index.ts:46-79` declares SDK members the library never exposes:

```ts
dossier: {
  destroy: () => void;                       // never called; not exported
  EventType: Record<string, EventTypes>;     // shadowed by the EVENT_TYPE constant
};
embedding: {
  featureFlags: Record<string, unknown>;     // never read
};
embeddingContexts: {
  embedDossierConsumptionPage: (…) => …;     // typed, but no hook or component
  embedReportPage: (…) => …;                 // typed, but no hook or component
};
```

`EmbedReportPageConfig`, `EmbedReportPage`, `EmbedDossierConsumptionPageConfig` and
`EmbedDossierConsumptionPage` are all **exported types** (`exports.ts:20-24`) for functionality
that has no hook or component. The package description promises "Dossiers, Reports, and Bot
Consumption pages", and the README title says "Dashboards, Reports, and Bot pages" — but there
is no way to embed a Report through this library.

### Fix

Pick one:

- **Implement** `useCreateReportPage` / `ReportPageEmbed` to match the advertised surface. The
  types already exist, so this is mostly wiring — and it would close the gap between the
  README and reality.
- **Or scope the claim down** in the README, the `package.json` description and the docs, and
  mark the report types `@internal` until implemented.

Either is fine; the current state advertises a capability that does not exist.

---

## Smaller DX notes

**`DashboardEmbed` swallows its own errors.** `DashboardEmbed.tsx:39-44` catches a URL parse
failure, logs it, and continues with `serverUrlLibrary = ""`. The resulting SDK error state
(`isSdkError`) is computed by `useLoadMstrSDK` but never surfaced — `useCreateDashboard` does
not return it. The user sees an empty div. Thread `isSdkError` through and give the component
an `errorComponent` prop like its `WithAuth` sibling.

**No `displayName` on any component.** React DevTools shows minified names in production
builds. One line each:

```ts
DashboardEmbed.displayName = "DashboardEmbed";
```

**Default height is a magic string.** `"600px"` appears in five places
(`DashboardEmbedWithAuth.tsx:83`, `:109`; `LibraryPageEmbedWithAuth.tsx:73`;
`BotConsumptionPageWithAuth.tsx:92`; and in configs). Extract to a shared constant so it can be
changed once.

**`clsx` for a single optional class.** `clsx(className)` is the only usage — a 0.6 KB
dependency for what `className` already does. Dropping it would make the package
**dependency-free**, which is a meaningful selling point for a library like this:

```diff
-className={clsx(className)}
+className={className}
```

The only behavioural difference is that `clsx` normalises `undefined` to `""`; React handles
`undefined` on `className` identically. Worth doing as part of the next major.
