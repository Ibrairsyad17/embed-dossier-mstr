# 01 — Critical Defects

> Four defects that make advertised functionality non-functional in the currently published
> package (`embed-dossier-mstr-react@2.0.0`). All four were reproduced by execution.

| ID                                                                     | Component                    | Severity    | Status in v2.0.0                      |
| ---------------------------------------------------------------------- | ---------------------------- | ----------- | ------------------------------------- |
| [C-01](#c-01--botconsumptionpagewithauth-deadlocks-and-never-renders)  | `BotConsumptionPageWithAuth` | 🔴 Critical | Renders nothing, forever              |
| [C-02](#c-02--librarypageembedwithauth-never-leaves-the-loading-state) | `LibraryPageEmbedWithAuth`   | 🔴 Critical | Stuck on `Loading…`, forever          |
| [C-03](#c-03--dashboardembedwithauth-renders-into-a-detached-dom-node) | `DashboardEmbedWithAuth`     | 🔴 Critical | Silently blank with any custom loader |
| [C-04](#c-04--unbounded-instance-re-creation-with-no-teardown)         | all three `*WithAuth` hooks  | 🔴 Critical | Leaks instances and server sessions   |

---

## Shared root cause

C-01, C-02 and C-03 are three symptoms of one mistake. It is worth understanding once.

### The rule being violated

In React, `useRef` gives you a mutable box whose `.current` is `null` until React commits the
element that carries the `ref` attribute. Two consequences matter here:

1. **`ref.current` is `null` during the first render.** It is populated after commit.
2. **Assigning to `ref.current` does not schedule a re-render.** React has no way to notify
   anything that a ref was attached.

So a value read as `ref.current` _during render_ is a snapshot that React will never
invalidate on your behalf. Passing it into a hook's dependency array makes the dependency
change only when _something else_ causes a re-render at a moment when the ref happens to be
populated.

### How the codebase violates it

All three `*WithAuth` components follow this shape:

```tsx
const containerRef = useRef<HTMLDivElement>(null);

const { isAuthenticated, isAuthenticating, error } = useCreateXWithAuth({
  placeholder: containerRef.current,   // ← read during render; null on first pass
  /* … */
});

if (isAuthenticating) return <>{loadingComponent}</>;   // ← container not rendered
if (error)            return <>{errorComponent(error)}</>;
if (!isAuthenticated) return null;                       // ← container not rendered

return <div ref={containerRef} … />;                     // ← only reachable when authed
```

And every hook opens its effect with:

```ts
useEffect(() => {
  if (!isSdkLoaded || !placeholder) return;
  /* …authenticate, then create the embed… */
}, [isSdkLoaded, placeholder /* … */]);
```

Trace it:

```
render 1 ──▶ containerRef.current === null
             └─▶ isAuthenticated === false  ──▶ component returns null
                 └─▶ the <div ref> is NOT in the tree
                     └─▶ containerRef.current stays null
                         └─▶ effect hits `if (!placeholder) return`
                             └─▶ authentication never starts
                                 └─▶ isAuthenticated stays false ──┐
                                                                    │
             ◀──────────────────── no state ever changes ◀──────────┘
```

The container's existence is gated on state that can only become true _after_ the container
exists. There is no exit from the loop.

### Why `DashboardEmbedWithAuth` appears to work

It has no `if (!isAuthenticated) return null` gate, so on render 1 it _does_ render the
container and the ref populates. `useLoadMstrSDK` then flips `isSdkLoaded`, forcing a
re-render during which `placeholder` is non-null, and the effect finally fires. It then
degrades differently — see [C-03](#c-03--dashboardembedwithauth-renders-into-a-detached-dom-node).

### The fix, once, for all three

Three changes, applied identically to each component:

1. **Always render the container.** Never return early in a way that unmounts it.
2. **Use a callback ref** so attachment becomes an observable state transition.
3. **Overlay** loading and error UI on top of the container instead of replacing it.

```tsx
const [container, setContainer] = useState<HTMLDivElement | null>(null);
// setContainer as a ref callback re-renders on attach AND on detach
```

`useState` is deliberate here: React calls the callback ref with the node on attach and with
`null` on detach, and because it is a state setter the component re-renders both times. That
is exactly the signal the effect's dependency array needs.

> **React 19 note.** In React 19 a callback ref may return a cleanup function, and returning
> one changes detach semantics. The form above returns `undefined` (a bare `setContainer`
> reference passed as `ref={setContainer}` would return the setter's `void`), which is correct
> and compatible with both React 18 and 19 — the package supports both via
> `peerDependencies`. Do not convert it to an arrow body that implicitly returns.

Full corrected source for each component is given per-finding below.

---

## C-01 — `BotConsumptionPageWithAuth` deadlocks and never renders

**Severity:** 🔴 Critical
**File:** `packages/embed-dossier-mstr-react/src/components/BotConsumptionPageWithAuth.tsx`
**Lines:** `62`, `67`, `84`
**Hook:** `src/hooks/useCreateBotConsumptionPageWithAuth.ts:43`

### Observed behaviour

Rendering the component with the real hook and a stubbed SDK, then waiting 1.5 s:

```
FAIL  BotConsumptionPageWithAuth eventually renders the bot page
      expected "embedBotConsumptionPage" to be called at least once
```

`window.microstrategy.embeddingContexts.embedBotConsumptionPage` is **never invoked**. The
component returns `null` on every render and never recovers. No error is thrown, no warning is
logged, nothing appears in the DOM.

### Mechanism

```tsx
// BotConsumptionPageWithAuth.tsx
const containerRef = useRef<HTMLDivElement>(null);       // line 62

const { isAuthenticated, isAuthenticating, error } =
  useCreateBotConsumptionPageWithAuth({
    placeholder: containerRef.current,                   // line 67 — always null
    /* … */
  });

if (isAuthenticating) return <>{loadingComponent}</>;
if (error) return <>{errorComponent(error)}</>;
if (!isAuthenticated) return null;                       // line 84 — the deadlock gate

return <div ref={containerRef} … />;                     // unreachable
```

`isAuthenticating` starts `false` and `error` starts `null`, so render 1 falls through to
line 84 and returns `null`. The `<div>` is never committed; `containerRef.current` is never
assigned; the effect's `!placeholder` guard never opens.

### Impact

The component is **100% non-functional**. Every consumer of `BotConsumptionPageWithAuth` in
v2.0.0 sees an empty region with no diagnostic. Because nothing throws, error boundaries do
not fire and monitoring stays silent.

### Fix

```tsx
import { useCreateBotConsumptionPageWithAuth } from "../hooks/useCreateBotConsumptionPageWithAuth";
import { EmbedBotConsumptionPageConfig } from "../types";
import { clsx } from "clsx";
import { useState } from "react";

const BotConsumptionPageWithAuth = ({
  serverUrlLibrary,
  projectId,
  objectId,
  config,
  loginMode,
  username,
  password,
  className,
  style,
  loadingComponent = <div>Loading...</div>,
  errorComponent = (error) => <div>{error}</div>,
}: BotConsumptionPageWithAuthProps) => {
  // Callback ref via state: re-renders on attach (node) and detach (null),
  // which is the signal the hook's effect dependency array needs.
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const { isAuthenticated, isAuthenticating, error } =
    useCreateBotConsumptionPageWithAuth({
      serverUrlLibrary,
      placeholder: container,
      projectId,
      objectId,
      config,
      loginMode,
      username,
      password,
    });

  return (
    <div
      style={{ position: "relative", width: "100%", height: "600px", ...style }}
    >
      {/* Always mounted, so the ref can populate and the SDK has a stable target. */}
      <div
        ref={setContainer}
        className={clsx(className)}
        style={{ width: "100%", height: "100%" }}
      />
      {(isAuthenticating || (!isAuthenticated && !error)) && (
        <div style={OVERLAY}>{loadingComponent}</div>
      )}
      {error && <div style={OVERLAY}>{errorComponent(error)}</div>}
    </div>
  );
};

const OVERLAY: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "inherit",
};
```

The container is now unconditionally mounted; loading and error states render _above_ it.

### Verification

```bash
pnpm --filter embed-dossier-mstr-react test -- placeholder-repro
```

`embedBotConsumptionPage` must be called exactly once per mount.

### Note on the config prop

`config` is typed as required on this component but optional on its siblings. Fixing that
inconsistency is [M-11](./02-lifecycle-and-correctness.md#m-11--inconsistent-hook-return-shapes-across-the-withauth-family);
it is not required for this fix.

---

## C-02 — `LibraryPageEmbedWithAuth` never leaves the loading state

**Severity:** 🔴 Critical
**File:** `packages/embed-dossier-mstr-react/src/components/LibraryPageEmbedWithAuth.tsx`
**Lines:** `50`, `54`, `65`
**Hook:** `src/hooks/useCreateLibraryPageWithAuth.ts:32`

### Observed behaviour

```
FAIL  LibraryPageEmbedWithAuth leaves the loading state
      expected document not to contain element, found <div>Loading...</div>

      <body>
        <div>
          <div>Loading...</div>
        </div>
      </body>
```

After 1.5 s the DOM still contains only the loading node.

### Mechanism

Identical to C-01, with the gate at line 65:

```tsx
const containerRef = useRef<HTMLDivElement>(null);   // line 50

const { libraryPage, isAuthenticated, error } = useCreateLibraryPageWithAuth({
  placeholder: containerRef.current,                 // line 54 — always null
  /* … */
});

if (error) return <>{errorComponent(error)}</>;
if (!isAuthenticated || !libraryPage) return <>{loadingComponent}</>;   // line 65

return <div ref={containerRef} … />;                 // unreachable
```

This one is doubly gated — on `isAuthenticated` _and_ `libraryPage` — but either alone is
sufficient to deadlock.

### Impact

Component is **100% non-functional**. Consumers see a permanent loading state, which is
strictly worse than a visible error: it reads as a slow network rather than a bug, so it tends
to be misattributed to the MicroStrategy server.

### Fix

Same shape as C-01:

```tsx
const [container, setContainer] = useState<HTMLDivElement | null>(null);

const { libraryPage, isAuthenticated, error } = useCreateLibraryPageWithAuth({
  serverUrlLibrary,
  placeholder: container,
  config,
  loginMode,
  username,
  password,
});

return (
  <div
    style={{ position: "relative", width: "100%", height: "600px", ...style }}
  >
    <div
      ref={setContainer}
      className={clsx(className)}
      style={{ width: "100%", height: "100%" }}
    />
    {!error && (!isAuthenticated || !libraryPage) && (
      <div style={OVERLAY}>{loadingComponent}</div>
    )}
    {error && <div style={OVERLAY}>{errorComponent(error)}</div>}
  </div>
);
```

### Related

This hook also has a no-op state update in its `finally` block and returns no
`isAuthenticating` — see
[M-10](./02-lifecycle-and-correctness.md#m-10--no-op-state-update-in-usecreatelibrarypagewithauth)
and [M-11](./02-lifecycle-and-correctness.md#m-11--inconsistent-hook-return-shapes-across-the-withauth-family).

---

## C-03 — `DashboardEmbedWithAuth` renders into a detached DOM node

**Severity:** 🔴 Critical
**File:** `packages/embed-dossier-mstr-react/src/components/DashboardEmbedWithAuth.tsx`
**Lines:** `55`, `73`, `77`, `91`

### Observed behaviour

This component _appears_ to work — and does, with default props. The failure is conditional
on something the documentation actively encourages.

Measured, single mount, real hook, stubbed SDK:

```
── default loadingComponent = <div>Loading...</div> ──
placeholder is null?           false
placeholder attached to body?  true          ← works
placeholder === final node?    true
dossier.create call count:     2             ← see C-04

── custom loadingComponent = <Spinner/>  (renders a <span>) ──
placeholder attached to body?  false         ← BROKEN
placeholder === final node?    false
```

### Mechanism

Unlike its siblings, this component has no `!isAuthenticated` gate, so render 1 mounts the
container and the ref populates. But it _does_ unmount the container while authenticating:

```tsx
if (isAuthenticating) {
  return <>{loadingComponent}</>;      // line 91 — container leaves the tree
}
return <div ref={divRef} … />;
```

Sequence on mount:

1. Render 1 — container mounts, `divRef.current` = node **A**.
2. `useLoadMstrSDK` flips `isSdkLoaded` → re-render → effect fires with `placeholder` = **A**.
3. Effect immediately calls `setAuthState({ isAuthenticating: true })`, then `await`s the login
   `fetch`. React flushes the re-render during that await.
4. Component now returns `loadingComponent` — the container leaves the tree.
5. The `await` resolves and `dossier.create({ placeholder: A })` runs against node **A**.

Whether **A** is still in the document depends entirely on how React reconciled step 4:

- **Default loader** — `<div>Loading...</div>` is a `<div>` at the same tree position as the
  container `<div>`. React reconciles by element type, keeps the same host node, and swaps
  children. Node **A** survives, still attached. _Works by coincidence._
- **Custom loader** — `<Spinner/>` renders a `<span>`. Different type at the same position →
  React unmounts the `<div>` and mounts a `<span>`. Node **A** is detached. The SDK renders a
  full dashboard into an orphaned element that is never re-inserted. When auth completes, a
  **brand-new** `<div>` mounts, empty.

The result is a blank area with no error, no warning, and no failed network request.

### Why this is critical rather than high

The triggering condition is what the project documents. `README.md:70`:

```tsx
loadingComponent={<div>Authenticating...</div>}
```

happens to be a `<div>`, so it works. But the component's own JSDoc at
`DashboardEmbedWithAuth.tsx:42` says:

```tsx
loadingComponent={<Spinner />}
```

which is the broken case. Any consumer using a design-system spinner, a skeleton component, a
fragment, or `null` gets silent breakage. The behaviour also depends on React's internal
reconciliation, so it can change between React versions without any change to this repo — and
the package supports both React 18 and 19.

### Fix

Same overlay pattern; the container must never leave the tree.

```tsx
const DashboardEmbedWithAuth = ({
  dossierUrl,
  className,
  style,
  config,
  loginMode,
  username,
  password,
  loadingComponent = <div>Loading...</div>,
  errorComponent = defaultErrorComponent,
}: DashboardEmbedWithAuthProps) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  // H-02: getInfoFromUrl throws on malformed input — do not let it escape render.
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

  // C-04: stabilise config identity so the effect does not re-run every render.
  const mergedConfig = useMemo(
    () => ({
      url: dossierUrl,
      enableResponsive: true,
      enableCustomAuthentication: true,
      containerHeight: "600px",
      containerWidth: "100%",
      ...config,
    }),
    [dossierUrl, config],
  );

  const { isAuthenticating, error } = useCreateDashboardWithAuth({
    serverUrlLibrary: parsed.info?.serverUrlLibrary ?? "",
    placeholder: container,
    config: mergedConfig,
    loginMode,
    username,
    password,
  });

  const shownError = parsed.parseError ?? error;

  return (
    <div
      style={{ position: "relative", width: "100%", height: "600px", ...style }}
    >
      <div
        ref={setContainer}
        className={clsx(className)}
        style={{ width: "100%", height: "100%" }}
      />
      {isAuthenticating && <div style={OVERLAY}>{loadingComponent}</div>}
      {shownError && (
        <div style={OVERLAY}>
          {typeof errorComponent === "function"
            ? errorComponent(shownError)
            : errorComponent}
        </div>
      )}
    </div>
  );
};
```

> `mergedConfig` still changes identity whenever the caller passes a fresh `config` literal.
> That is the caller's contract to keep stable, and it should be documented on the prop. The
> hook-side defence against it is [C-04](#c-04--unbounded-instance-re-creation-with-no-teardown).

### Verification

Assert on **attachment**, not just on `create` having been called — that is the distinction
the current tests miss:

```tsx
const placeholder = createdWith[0]?.placeholder as HTMLElement;
expect(document.body.contains(placeholder)).toBe(true);
```

Run it with a non-`<div>` custom `loadingComponent`, which is the case that actually fails.

---

## C-04 — Unbounded instance re-creation with no teardown

**Severity:** 🔴 Critical
**Files:**

- `src/hooks/useCreateDashboardWithAuth.ts:227-238`
- `src/hooks/useCreateBotConsumptionPageWithAuth.ts:145-158`
- `src/hooks/useCreateLibraryPageWithAuth.ts:129-140`

### Observed behaviour

A single mount of `DashboardEmbedWithAuth` produced:

```
dossier.create call count: 2
```

Two dashboards created, one mount, nothing closed.

### Mechanism

Two independent bugs compounding.

**1. Unstable dependency identity.** `DashboardEmbedWithAuth.tsx:78` builds `config` as a fresh
object literal inside the render body:

```tsx
config: {
  url: dossierUrl,
  enableResponsive: true,
  enableCustomAuthentication: true,
  containerHeight: "600px",
  containerWidth: "100%",
  ...config,
},
```

A new object every render. `useCreateDashboardWithAuth.ts:230-238` lists `config` in its
dependency array:

```ts
}, [isSdkLoaded, placeholder, loginMode, serverUrlLibrary, config, username, password]);
```

`Object.is` comparison fails every time, so the effect re-runs on **every render** — each run
performing a fresh login `fetch` and a fresh `dossier.create`.

**2. No teardown.** The cleanup only flips a flag:

```ts
return () => {
  mounted = false; // ← that is the entire cleanup
};
```

`useCreateDashboard` (the non-auth hook) does this correctly at `useCreateDashboard.ts:71-81`:

```ts
return () => {
  mounted = false;
  if (dashboardRef.current) {
    try {
      dashboardRef.current.close();
    } catch {
      /* already closed */
    }
    dashboardRef.current = null;
  }
};
```

None of the three `*WithAuth` hooks do. Every superseded instance leaks: DOM subtrees, SDK
internals, registered event handlers, and — because each cycle re-runs `/api/auth/login` — a
server-side session per cycle.

### Impact

Any parent re-render (a resize handler, a Redux update, a router transition, a theme toggle)
re-authenticates and re-creates the embed. In a dashboard-heavy app this is unbounded growth in
memory and in MicroStrategy sessions. The measured 2× on a bare mount is the floor, not the
ceiling.

Note the interaction with C-01/C-02: in those two components the effect's `!placeholder` guard
returns early every time, so the re-runs are _cheap_ — which is the only reason the deadlocked
components do not also hammer the login endpoint. Fixing C-01 and C-02 **without** also fixing
C-04 would convert a silent deadlock into a login-request loop. **These must ship together.**

### Fix

**Step 1 — stabilise identity at the call site** (`useMemo`, as shown in C-03).

**Step 2 — add real teardown in every `*WithAuth` hook.** Pattern, using the dashboard hook:

```ts
const instanceRef = useRef<MicroStrategyDossier | null>(null);

useEffect(() => {
  if (!isSdkLoaded || !placeholder) return;

  let mounted = true;
  const controller = new AbortController();

  const initialize = async () => {
    setAuthState((prev) => ({ ...prev, isAuthenticating: true, error: null }));
    try {
      await authenticate({
        loginMode,
        serverUrlLibrary,
        username,
        password,
        signal: controller.signal,
      });
      if (!mounted) return;

      const dossier = await window.microstrategy.dossier.create({
        ...config,
        placeholder /* … */,
      });

      // Lost the race against unmount — close immediately rather than leak.
      if (!mounted) {
        try {
          dossier.close();
        } catch {
          /* noop */
        }
        return;
      }

      instanceRef.current = dossier;
      setDashboard(dossier);
      setAuthState((prev) => ({ ...prev, isAuthenticated: true }));
    } catch (error) {
      if (!mounted || controller.signal.aborted) return;
      setAuthState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : "Failed to initialize dashboard",
        isAuthenticated: false,
      }));
    } finally {
      if (mounted)
        setAuthState((prev) => ({ ...prev, isAuthenticating: false }));
    }
  };

  initialize();

  return () => {
    mounted = false;
    controller.abort();
    if (instanceRef.current) {
      try {
        instanceRef.current.close();
      } catch {
        /* already closed */
      }
      instanceRef.current = null;
    }
  };
}, [
  isSdkLoaded,
  placeholder,
  loginMode,
  serverUrlLibrary,
  config,
  username,
  password,
]);
```

The post-`await` `if (!mounted)` check before storing is important: `dossier.create` can resolve
_after_ unmount, and without that branch the instance is created and immediately orphaned with
no reference left to close it.

**Step 3 — pass `signal` to the auth `fetch` calls** so in-flight logins abort on unmount
rather than resolving into a dead component.

### Verification

```tsx
it("creates exactly one instance per mount and closes it on unmount", async () => {
  const close = vi.fn();
  window.microstrategy.dossier.create = vi.fn(async () => ({ close }));

  const { unmount, rerender } = render(<DashboardEmbedWithAuth {...props} />);
  await waitFor(() =>
    expect(window.microstrategy.dossier.create).toHaveBeenCalled(),
  );

  rerender(<DashboardEmbedWithAuth {...props} />); // parent re-render
  rerender(<DashboardEmbedWithAuth {...props} />);

  expect(window.microstrategy.dossier.create).toHaveBeenCalledTimes(1); // fails today

  unmount();
  expect(close).toHaveBeenCalledTimes(1); // fails today
});
```

Both assertions fail against `b4267ef`.

---

## Combined regression test

Add [`evidence/placeholder-repro.test.tsx`](./evidence/placeholder-repro.test.tsx) to
`src/tests/` as a permanent guard. It exercises all three components against the **real**
hooks — the seam the current suite mocks away
([H-01](./03-testing-strategy.md#h-01--component-tests-mock-the-hook-under-test)).

Measured against `b4267ef`:

```
× C-01: BotConsumptionPageWithAuth reaches the SDK          1543ms
× C-02: LibraryPageEmbedWithAuth leaves the loading state   1511ms
× C-03: DashboardEmbedWithAuth renders into an ATTACHED node  68ms
↓ C-04: instance lifecycle                                  [skipped]

Tests  3 failed | 1 skipped (4)
```

After C-01 … C-04 land, all four pass (unskip the C-04 case).

Note that C-03 fails here while the same component passed the looser "was `create` called"
assertion in the earlier probe — the difference is the non-`<div>` `loadingComponent`. That gap
between the two assertions _is_ the bug.
