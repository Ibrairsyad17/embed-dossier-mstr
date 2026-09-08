# 02 — Lifecycle & Correctness

> Defects in effect wiring, module structure, type soundness and SDK loading. These do not
> render features unusable on their own (that is [01](./01-critical-defects.md)) but they
> break real integrations and will resurface as bugs after the critical fixes land.

| ID                                                                        | Severity  | Summary                                                   |
| ------------------------------------------------------------------------- | --------- | --------------------------------------------------------- |
| [H-02](#h-02--unguarded-getinfofromurl-in-render-crashes-the-react-tree)  | 🟠 High   | `getInfoFromUrl` throws during render, unguarded          |
| [H-04](#h-04--circular-import-between-a-hook-and-the-barrel-file)         | 🟠 High   | Circular import hook ↔ `exports.ts`                      |
| [H-07](#h-07--windowmicrostrategy-is-typed-as-always-present)             | 🟠 High   | `window.microstrategy` typed non-optional                 |
| [H-08](#h-08--two-incompatible-ways-of-reading-the-auth-token)            | 🟠 High   | Auth token read from header in one place, body in another |
| [H-09](#h-09--useloadmstrsdk-races-and-tears-down-a-shared-resource)      | 🟠 High   | Duplicate script injection; premature removal             |
| [M-06](#m-06--usecreatelibrarypage-effect-wiring-is-unsound)              | 🟡 Medium | Stale closures, `JSON.stringify` deps, no teardown        |
| [M-10](#m-10--no-op-state-update-in-usecreatelibrarypagewithauth)         | 🟡 Medium | `setState(prev => ({...prev}))` forces a pointless render |
| [M-11](#m-11--inconsistent-hook-return-shapes-across-the-withauth-family) | 🟡 Medium | Sibling hooks return different state shapes               |

---

## H-02 — Unguarded `getInfoFromUrl` in render crashes the React tree

**File:** `src/components/DashboardEmbedWithAuth.tsx:72`

`getInfoFromUrl` throws on malformed input by design (`utils.ts:29`, `:36`, `:46`). Its sibling
component handles that; this one does not.

`DashboardEmbed.tsx:39-44` — correct:

```tsx
let serverUrlLibrary = "";
try {
  const urlInfo = getInfoFromUrl(dossierUrl);
  serverUrlLibrary = urlInfo.serverUrlLibrary;
} catch (error) {
  console.error("Failed to parse dossier URL:", error);
}
```

`DashboardEmbedWithAuth.tsx:72` — unguarded, in the render body:

```tsx
const { serverUrlLibrary } = getInfoFromUrl(dossierUrl);
```

### Impact

A malformed `dossierUrl` — an empty string while data loads, a `null` from an API, a relative
path, a URL missing the `/app/` segment — throws during render. That is not a caught error
state; it unwinds to the nearest error boundary, and with no boundary it blanks the entire
React tree. A single bad URL in a dashboard grid takes down the page.

This is a plausible runtime path, not a theoretical one: the natural pattern
`<DashboardEmbedWithAuth dossierUrl={data?.url ?? ""} />` throws on first render every time.

### Fix

Convert the throw into a rendered error state, inside `useMemo` so it is not re-parsed each
render (the full corrected component is in
[C-03](./01-critical-defects.md#c-03--dashboardembedwithauth-renders-into-a-detached-dom-node)):

```tsx
const parsed = useMemo(() => {
  try {
    return {
      info: getInfoFromUrl(dossierUrl),
      parseError: null as string | null,
    };
  } catch (e) {
    return {
      info: null,
      parseError: e instanceof Error ? e.message : "Invalid dossier URL",
    };
  }
}, [dossierUrl]);
```

Then surface `parsed.parseError` through the same `errorComponent` path as auth errors, so
consumers get one error channel rather than two.

### Also audit

`LibraryPageEmbedWithAuth` and `BotConsumptionPageWithAuth` take `serverUrlLibrary` directly
and never parse, so they are unaffected. `DashboardEmbed` is guarded but then proceeds with
`serverUrlLibrary = ""`, which makes `useLoadMstrSDK` set an error state that
`DashboardEmbed` never reads — the failure is logged to console and otherwise invisible. Worth
surfacing an `isSdkError` prop-driven error state there too.

---

## H-04 — Circular import between a hook and the barrel file

**Files:** `src/hooks/useCreateBotConsumptionPage.ts:2` ↔ `src/exports.ts:92`

```ts
// src/hooks/useCreateBotConsumptionPage.ts:2
import { useLoadMstrSDK } from "../exports";
```

```ts
// src/exports.ts:92
export { useCreateBotConsumptionPage } from "./hooks/useCreateBotConsumptionPage";
```

`exports.ts` → `hooks/useCreateBotConsumptionPage.ts` → `exports.ts`. Every sibling hook
imports the direct path (`./useLoadMstrSDK`); this one is the outlier.

### Impact

It builds today — tsup/rollup hoists through it — but circular imports through a barrel are a
known source of `undefined` at module-init time. The failure mode is order-dependent and
bundler-dependent: it can appear when a consumer imports a deep path, when tree-shaking
reorders modules, when a downstream bundler (Vite, webpack, Metro) resolves the cycle
differently, or when the barrel grows. It is also invisible to the current test suite, which
imports modules directly.

This is the kind of defect that surfaces as "works in dev, `undefined is not a function` in
production".

### Fix

```diff
-import { useLoadMstrSDK } from "../exports";
+import { useLoadMstrSDK } from "./useLoadMstrSDK";
```

### Prevention

The `eslint-plugin-import` plugin is already installed and registered in `.eslintrc.js` but no
`import/*` rules are configured ([L-08](./07-repo-hygiene-and-docs.md#l-08--eslint-import-plugin-loaded-but-unused)).
Turn the relevant rule on:

```js
rules: {
  "import/no-cycle": ["error", { maxDepth: Infinity }],
  "import/no-self-import": "error",
}
```

Verify with `npx madge --circular --extensions ts,tsx src/`.

---

## H-07 — `window.microstrategy` is typed as always present

**File:** `src/types/index.ts:29-33`

```ts
declare global {
  interface Window {
    microstrategy: MicroStrategySDK; // ← not optional
  }
}
```

### Two distinct problems

**1. The guard is a type-level lie.** `useLoadMstrSDK.ts:29` checks:

```ts
if (window.microstrategy) {
  setIsSdkLoaded(true);
  return;
}
```

Under `strict: true`, TypeScript believes this condition is always truthy, because the type
says the property is always a `MicroStrategySDK`. The check is correct at runtime — the SDK is
genuinely absent until the script loads — but the type system cannot help anyone reason about
it. Worse, every `window.microstrategy.dossier.create(...)` call site typechecks even where no
load guard exists, so a missing-SDK crash is invisible to the compiler.

**2. Global scope pollution.** `declare global` in a published `.d.ts` augments `Window` for
**every consumer application**, whether or not they use this library. Any app that also talks
to MicroStrategy through its own typings gets a duplicate-identifier conflict, and any app that
does not gets a phantom global suggesting the SDK is always loaded.

### Fix

Make it optional, which is both honest and forces the guard at every call site:

```ts
declare global {
  interface Window {
    microstrategy?: MicroStrategySDK;
  }
}
```

This will surface real errors across the hooks. Resolve them with a narrow accessor rather
than non-null assertions:

```ts
/** Returns the SDK, or throws a diagnosable error if it has not loaded yet. */
export function requireSdk(): MicroStrategySDK {
  if (typeof window === "undefined" || !window.microstrategy) {
    throw new Error(
      "MicroStrategy SDK is not loaded. Ensure useLoadMstrSDK has resolved " +
        "(isSdkLoaded === true) before creating an embed.",
    );
  }
  return window.microstrategy;
}
```

The `typeof window === "undefined"` branch also makes the accessor SSR-safe, which matters for
[H-03](./06-api-design-and-dx.md#h-03--no-use-client-directives-breaks-nextjs-app-router).

### On the global augmentation itself

Consider dropping `declare global` from the published surface entirely and exporting the
augmentation as an opt-in:

```ts
// consumer's env.d.ts
import type { MicroStrategySDK } from "embed-dossier-mstr-react";
declare global {
  interface Window {
    microstrategy?: MicroStrategySDK;
  }
}
```

Document that in the installation guide. It is a breaking change for anyone relying on the
implicit global, so batch it with the next major.

---

## H-08 — Two incompatible ways of reading the auth token

> ⚠️ **Verify against your MicroStrategy version before acting.** This audit had no live
> server, so which of the two is correct is _not_ established here. What is established is
> that they disagree, and at most one can be right.

The same endpoint, `GET /api/auth/token`, is read two different ways.

**From the response body** — `src/utils.ts:110-114`:

```ts
const response = await fetch(`${serverUrlLibrary}/api/auth/token`, options);
if (response.ok) {
  const data = await response.json();
  return data.token as string;
}
```

**From a response header** — `useCreateDashboardWithAuth.ts:193-199`, and identically in
`useCreateBotConsumptionPageWithAuth.ts:106-117` and `useCreateLibraryPageWithAuth.ts:90-101`:

```ts
const response = await fetch(`${serverUrlLibrary}/api/auth/token`, options);
return response.ok ? response.headers.get("x-mstr-authtoken") : null;
```

### Impact

`getAuthToken` is exported as public API and documented in the README's utilities table. If
the header form is the correct one, `getAuthToken` returns `undefined` for every caller — a
broken public function with 0% test coverage
([M-02](./03-testing-strategy.md#m-02--utilsts-is-30-covered-and-the-gaps-are-public-api)) so
nothing catches it. If the body form is correct, all three auth hooks pass `null` into
`getLoginToken` and custom authentication fails.

There is a further wrinkle: reading `x-mstr-authtoken` cross-origin requires the server to send
`Access-Control-Expose-Headers: x-mstr-authtoken`. Without it the browser hides the header and
`.get()` returns `null` even when the server sent it. That is a plausible silent-failure mode
worth checking explicitly.

### How to resolve

Against a real Library server, in a browser devtools console:

```js
const r = await fetch("https://<host>/MicroStrategyLibrary/api/auth/token", {
  method: "GET",
  credentials: "include",
  mode: "cors",
  headers: { "content-type": "application/json" },
});
console.log("status:", r.status);
console.log("header:", r.headers.get("x-mstr-authtoken"));
console.log("exposed:", r.headers.get("access-control-expose-headers"));
console.log(
  "body:",
  await r
    .clone()
    .json()
    .catch(() => "<not json>"),
);
```

Then collapse both call sites onto one shared helper so they cannot drift again:

```ts
/** Single source of truth for token retrieval. */
export async function fetchAuthToken(
  serverUrlLibrary: string,
  signal?: AbortSignal,
) {
  const response = await fetch(`${serverUrlLibrary}/api/auth/token`, {
    method: "GET",
    credentials: "include",
    mode: "cors",
    headers: { "content-type": "application/json" },
    signal,
  });
  if (!response.ok) return null;
  // …whichever form the probe above proves correct, implemented once.
}
```

Have `getAuthToken` and every hook's `getLoginToken` delegate to it, and cover it with tests
for the 200-with-token, 200-without-token, 401 and network-failure cases.

---

## H-09 — `useLoadMstrSDK` races and tears down a shared resource

**File:** `src/hooks/useLoadMstrSDK.ts:27-63`

The hook manages a **page-global** resource (a `<script>` tag and the `window.microstrategy`
global) with **per-component** state. Three consequences.

### 1. Duplicate script injection

```ts
if (window.microstrategy) {
  setIsSdkLoaded(true);
  return;
}
// …no check for an in-flight script…
const script = document.createElement("script");
script.src = `${serverUrlLibrary}/javascript/embeddinglib.js`;
document.head.appendChild(script);
```

Two components mounting in the same tick both observe `window.microstrategy === undefined` —
because the first script has not finished loading — and both inject. With _n_ embeds on a page
you get _n_ parallel downloads of `embeddinglib.js` and _n_ executions of a library that
mutates globals.

### 2. Premature teardown of a shared script

```ts
return () => {
  script.remove();
};
```

When one embed unmounts, its script tag is removed while siblings are still using the SDK.
Removing a `<script>` after execution does not unload it, so `window.microstrategy` survives
and things mostly keep working — but a subsequent mount then sees the global present, skips
loading, and inherits whatever state the removed script left behind. It also means the DOM no
longer reflects what is actually loaded.

### 3. A component that mounts mid-load never resolves

If component B mounts while A's script is still in flight, B sees no global, injects its own
script, and attaches `onload` to _its_ tag. That resolves, so B works — at the cost of the
duplicate load in (1). But if B's duplicate injection is ever suppressed (a CSP, a
deduplicating proxy, an adblocker rule on the path), B has no `onload` to wait on and hangs at
`isSdkLoaded === false` forever.

### Fix — module-level promise cache

Load state belongs to the module, not to a component:

```ts
type SdkState = {
  promise: Promise<void>;
  script: HTMLScriptElement;
  refCount: number;
};
const sdkCache = new Map<string, SdkState>();

function loadSdk(serverUrlLibrary: string): Promise<void> {
  const cached = sdkCache.get(serverUrlLibrary);
  if (cached) {
    cached.refCount += 1;
    return cached.promise;
  }

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = `${serverUrlLibrary}/javascript/embeddinglib.js`;
  script.async = true;

  const promise = new Promise<void>((resolve, reject) => {
    script.onload = () => resolve();
    script.onerror = () =>
      reject(
        new Error(`Failed to load MicroStrategy SDK from ${serverUrlLibrary}`),
      );
  });

  sdkCache.set(serverUrlLibrary, { promise, script, refCount: 1 });
  document.head.appendChild(script);
  return promise;
}

function releaseSdk(serverUrlLibrary: string) {
  const cached = sdkCache.get(serverUrlLibrary);
  if (!cached) return;
  cached.refCount -= 1;
  // Deliberately keep the script and the cache entry: removing the tag does not
  // unload the SDK, and a later remount must not re-inject.
}
```

Then the hook becomes a thin subscriber:

```ts
const useLoadMstrSDK = ({ serverUrlLibrary }: { serverUrlLibrary: string }) => {
  const [isSdkLoaded, setIsSdkLoaded] = useState(
    () => typeof window !== "undefined" && !!window.microstrategy,
  );
  const [isSdkError, setIsSdkError] = useState({ isError: false, message: "" });

  useEffect(() => {
    if (typeof window === "undefined") return; // SSR guard — H-03
    if (window.microstrategy) {
      setIsSdkLoaded(true);
      return;
    }

    if (!serverUrlLibrary) {
      setIsSdkError({
        isError: true,
        message: "serverUrlLibrary is required to load the MicroStrategy SDK",
      });
      return;
    }

    let mounted = true;
    loadSdk(serverUrlLibrary)
      .then(() => {
        if (mounted) setIsSdkLoaded(true);
      })
      .catch((e: Error) => {
        if (mounted) setIsSdkError({ isError: true, message: e.message });
      });

    return () => {
      mounted = false;
      releaseSdk(serverUrlLibrary);
    };
  }, [serverUrlLibrary]);

  return { isSdkLoaded, isSdkError };
};
```

Note the lazy `useState` initialiser: if the SDK is already present, the hook reports loaded on
the **first** render rather than after an effect round-trip, which removes one re-render from
every mount.

### Ordering bug worth fixing at the same time

The current implementation checks `window.microstrategy` _before_ validating
`serverUrlLibrary`, so when the SDK happens to be pre-loaded an empty `serverUrlLibrary`
silently succeeds — masking a caller bug that will bite later when the SDK is not pre-loaded.
Whether to keep that leniency is a judgement call; make it deliberate either way.

### Tests to add

- two components mounting in the same tick → exactly one `<script>` appended
- one unmounts → sibling still reports `isSdkLoaded`
- unmount then remount → no second injection
- `onerror` → `isSdkError.isError === true` with the URL in the message
- empty `serverUrlLibrary` → error state, no injection

---

## M-06 — `useCreateLibraryPage` effect wiring is unsound

**File:** `src/hooks/useCreateLibraryPage.ts:36-97`

This is the only hook that ESLint already flags — the two `react-hooks/exhaustive-deps`
warnings reported by `pnpm lint`:

```
43:6  warning  React Hook useEffect has missing dependencies: 'createLibraryPage',
               'libraryPage', and 'libraryPageState.isLoading'
54:6  warning  React Hook useEffect has missing dependencies: 'createLibraryPage'
               and 'libraryPage'
```

Four distinct problems:

**1. Stale closures.** `createLibraryPage` is redefined every render and is not memoised, so
the effects at `:38` and `:45` capture whichever instance existed when they last ran. The
warnings are load-bearing, not noise.

**2. `JSON.stringify` as a comparator** (`:47`):

```ts
const configChanged =
  JSON.stringify(config) !== JSON.stringify(prevConfigRef.current);
```

Silently wrong for the config shape this library accepts: key order changes produce false
positives, and `undefined` values, functions and `Symbol`s are dropped, producing false
negatives. `EmbedLibraryPageConfig` includes `errorHandler` and `sessionErrorHandler`
**functions** — `JSON.stringify` erases them, so a caller swapping error handlers gets no
re-creation.

**3. No teardown.** Nothing closes the library page on unmount or before re-creating. Same leak
class as [C-04](./01-critical-defects.md#c-04--unbounded-instance-re-creation-with-no-teardown).

**4. Caller-supplied handlers are silently overridable.** At `:68-81` the hook sets
`errorHandler` and `sessionErrorHandler`, then spreads `...config` _after_ them (`:82`). A
caller passing their own handlers replaces the hook's internal error reporting, so
`libraryPageState.error` never populates and the component's error UI goes dead. Spread
`...config` first and merge handlers explicitly, or compose both.

### Fix sketch

```ts
const createLibraryPage = useCallback(
  async (signal: AbortSignal) => {
    setLibraryPageState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const { errorHandler, sessionErrorHandler, ...rest } = config ?? {};
      const page = await requireSdk().embeddingContexts.embedLibraryPage({
        ...rest,
        placeholder: libraryPageRef.current,
        serverUrl: serverUrlLibrary,
        errorHandler: (error) => {
          setLibraryPageState((p) => ({
            ...p,
            error: error.message ?? "Failed to load library page",
          }));
          errorHandler?.(error); // compose, do not clobber
        },
        sessionErrorHandler: (error) => {
          setLibraryPageState((p) => ({
            ...p,
            error: "Session expired. Please refresh the page.",
          }));
          sessionErrorHandler?.(error);
        },
      });
      if (signal.aborted) {
        try {
          page.close?.();
        } catch {
          /* noop */
        }
        return;
      }
      setLibraryPage(page);
    } catch (error) {
      if (!signal.aborted) {
        setLibraryPageState((p) => ({
          ...p,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create library page",
        }));
      }
    } finally {
      if (!signal.aborted)
        setLibraryPageState((p) => ({ ...p, isLoading: false }));
    }
  },
  [serverUrlLibrary, config],
);
```

Collapse the two effects into one keyed on `[isSdkLoaded, createLibraryPage]`, and have its
cleanup abort and close. Then remove the ESLint suppressions rather than silencing them — and
promote the rule to `error`
([L-09](./07-repo-hygiene-and-docs.md#l-09--react-hooksexhaustive-deps-is-a-warning-not-an-error)).

Migrating this hook to the callback-ref pattern from
[C-01](./01-critical-defects.md#the-fix-once-for-all-three) is also worthwhile: it currently
reads `libraryPageRef.current` inside an async function, so it depends on the effect running
after commit rather than on the node genuinely being attached.

---

## M-10 — No-op state update in `useCreateLibraryPageWithAuth`

**File:** `src/hooks/useCreateLibraryPageWithAuth.ts:121-125`

```ts
} finally {
  if (mounted) {
    setAuthState((prev) => ({ ...prev }));   // new object, identical contents
  }
}
```

A fresh object with the same fields. React bails out only when the value is `Object.is`-equal,
so this **does** schedule a render pass that changes nothing.

This is almost certainly a mechanical copy from the sibling hooks, where the same slot reads
`setAuthState((prev) => ({ ...prev, isAuthenticating: false }))`. The `isAuthenticating` field
was dropped from this hook's state (see M-11) but the setter was left behind.

### Fix

Either delete the `finally` block, or — preferably — restore `isAuthenticating` for consistency
with its siblings and set it properly here.

---

## M-11 — Inconsistent hook return shapes across the `*WithAuth` family

Three hooks that are meant to be interchangeable expose three different contracts:

| Hook                                  | `isAuthenticated` | `isAuthenticating` | `error` | instance key         |
| ------------------------------------- | ----------------- | ------------------ | ------- | -------------------- |
| `useCreateDashboardWithAuth`          | ✅                | ✅                 | ✅      | `dashboard`          |
| `useCreateBotConsumptionPageWithAuth` | ✅                | ✅                 | ✅      | `botConsumptionPage` |
| `useCreateLibraryPageWithAuth`        | ✅                | ❌ **missing**     | ✅      | `libraryPage`        |

`useCreateLibraryPageWithAuth.ts:23-26` declares only `{ isAuthenticated, error }`.
`LibraryPageEmbedWithAuth` works around the gap by inferring loading from
`!isAuthenticated || !libraryPage` — which is precisely the condition that deadlocks in
[C-02](./01-critical-defects.md#c-02--librarypageembedwithauth-never-leaves-the-loading-state).

Prop-level inconsistencies in the same family:

- `config` is **required** on `BotConsumptionPageWithAuth` but optional on the other two.
- `errorComponent` is `(error: string) => ReactNode` on two components but
  `ReactNode | ((error: string) => ReactNode)` on `DashboardEmbedWithAuth`.
- `DashboardEmbedWithAuth` derives `serverUrlLibrary` from `dossierUrl`; the other two take it
  as a prop. Defensible, but undocumented.

### Fix

Define the contract once and have all three conform:

```ts
export interface EmbedAuthState {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  error: string | null;
}
```

Make `config` optional everywhere (defaulting to `{}`), and standardise `errorComponent` on the
union form so a plain node is always accepted. All of these are additive except the `config`
change, which is source-compatible for existing callers.

Then export the shared type so consumers can write generic wrappers over the family — currently
impossible.
