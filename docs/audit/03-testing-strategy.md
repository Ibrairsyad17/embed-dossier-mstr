# 03 — Testing Strategy

> The suite reports **80 passed (80)** and coverage clears every configured threshold, while
> two of three authenticated components are completely non-functional. This document explains
> how both statements are true at once, and what to change.

| ID                                                               | Severity  | Summary                                              |
| ---------------------------------------------------------------- | --------- | ---------------------------------------------------- |
| [H-01](#h-01--component-tests-mock-the-hook-under-test)          | 🟠 High   | All six component tests mock their own hook          |
| [M-02](#m-02--utilsts-is-30-covered-and-the-gaps-are-public-api) | 🟡 Medium | `getServerUrl` / `getAuthToken` effectively untested |
| [M-09](#m-09--a-dead-vitest-config-inside-src-skews-coverage)    | 🟡 Medium | Stray `src/vitest.config.ts` counted as source       |

---

## Current state

```
$ pnpm --filter embed-dossier-mstr-react test
 Test Files  14 passed (14)
      Tests  80 passed (80)
   Duration  7.55s
```

Fourteen files: six component tests, seven hook tests, one `main.test.ts`. Coverage thresholds
in `vitest.config.mts` (branches 70, functions 70, lines 75, statements 75) all pass at
83.77 / 79.10 / 78.37 / 83.77.

By every signal the project currently emits, the library is well tested.

---

## H-01 — Component tests mock the hook under test

**Files:** all six of `src/tests/components/*.test.tsx`

```
BotConsumptionPage.test.tsx          -> vi.mock(".../useCreateBotConsumptionPage")
BotConsumptionPageWithAuth.test.tsx  -> vi.mock(".../useCreateBotConsumptionPageWithAuth")
DashboardEmbed.test.tsx              -> vi.mock(".../useCreateDashboard")
DashboardEmbedWithAuth.test.tsx      -> vi.mock(".../useCreateDashboardWithAuth")
LibraryPageEmbed.test.tsx            -> vi.mock(".../useCreateLibraryPage")
LibraryPageEmbedWithAuth.test.tsx    -> vi.mock(".../useCreateLibraryPageWithAuth")
```

Every component test replaces the hook that component exists to drive.

### Why this hides C-01 … C-03

A component in this library is essentially _three lines of its own logic plus a hook call_.
Mock the hook and almost nothing real is left. Concretely, from
`BotConsumptionPageWithAuth.test.tsx:244-264`:

```tsx
vi.mocked(useCreateBotConsumptionPageWithAuth).mockReturnValue({
  botConsumptionPage: {},
  isAuthenticating: false,
  isAuthenticated: true, // ← forced true
  error: null,
});

const { container } = render(<BotConsumptionPageWithAuth {...defaultProps} />);
const element = container.firstChild as HTMLElement;
expect(element).toHaveClass("custom-class");
```

`isAuthenticated: true` is the state the real hook **can never reach** (C-01). The test asserts
the component renders correctly in a state that does not exist at runtime, and passes.

The hook tests have the mirror-image gap: `useCreateBotConsumptionPageWithAuth.test.ts` passes
a hand-constructed `placeholder` directly, so the hook is exercised with a non-null container
it never receives in production.

Each side tests a world where the other side works. The seam between them — _does the component
ever hand the hook a real node?_ — is tested by nothing. That seam is where all four critical
defects live.

### The structural lesson

Mocking is appropriate for **boundaries you do not own**: `window.microstrategy`, `fetch`,
timers. It is inappropriate for **the collaborator that constitutes the unit's behaviour**.
When a component's entire job is wiring a DOM node into a hook, mocking the hook tests the
wiring of nothing.

A useful heuristic: _if the mock's return value is the thing the bug would have made
impossible, the test cannot find the bug._

### Fix — three layers

**Layer 1: integration tests (new, highest value).**
Adopt [`evidence/placeholder-repro.test.tsx`](./evidence/placeholder-repro.test.tsx) —
components + real hooks, with only `window.microstrategy` and `fetch` stubbed. Cover per
component:

- the SDK create function is called exactly once per mount
- the `placeholder` it receives is non-null **and attached to the document**
- unmount closes the instance
- parent re-renders do not re-create
- auth failure surfaces through `errorComponent`
- custom `loadingComponent` of a non-`<div>` root still yields an attached placeholder ← C-03

**Layer 2: keep the existing component tests, narrow their claims.**
They are legitimate tests of _presentational branching_. Rename the describe blocks to say so
(`"renders loading state when hook reports isAuthenticating"`) so nobody reads them as
end-to-end coverage.

**Layer 3: hook tests, exercised through `renderHook` with realistic inputs.**
Include the transition that matters: `placeholder` starting `null` and becoming a node.

```tsx
const { result, rerender } = renderHook(
  ({ placeholder }) => useCreateDashboardWithAuth({ ...base, placeholder }),
  { initialProps: { placeholder: null as HTMLDivElement | null } },
);

expect(window.microstrategy.dossier.create).not.toHaveBeenCalled();

const node = document.createElement("div");
document.body.appendChild(node);
rerender({ placeholder: node });

await waitFor(() =>
  expect(window.microstrategy.dossier.create).toHaveBeenCalledTimes(1),
);
```

### A CI guard worth adding

Fail the build if a component test mocks its own hook:

```bash
# scripts/check-no-self-mocks.sh
set -euo pipefail
fail=0
for f in packages/embed-dossier-mstr-react/src/tests/components/*.test.tsx; do
  component=$(basename "$f" .test.tsx)
  hook="useCreate${component/Embed/}"
  if grep -q "vi.mock(.*${hook}" "$f" 2>/dev/null; then
    echo "::error file=$f::${component} test mocks its own hook — see docs/audit/03"
    fail=1
  fi
done
exit $fail
```

Treat it as a tripwire against regression, not a substitute for the integration layer.

---

## M-02 — `utils.ts` is 30% covered and the gaps are public API

```
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered
-------------------|---------|----------|---------|---------|------------------
 src               |   27.41 |      20  |   25    |   27.41 |
  utils.ts         |   30.35 |      25  |   33.33 |   30.35 | …9,73-80,98-120
  vitest.config.ts |    0    |      0   |    0    |    0    | 1-7
 src/components    |   99.5  |   96.15  |  100    |   99.5  |
 src/hooks         |   83.57 |   76.76  |   75    |   83.57 |
```

Lines `73-80` are the whole of `getServerUrl`; `98-120` are the whole of `getAuthToken`. Both
are exported, both are documented in the README's utilities table, and neither has a single
test.

The aggregate (83.77%) sails past the 75% threshold because the well-covered component files
outweigh `utils.ts` — the thresholds are global, so a fully untested public function is
invisible.

This directly compounds [H-08](./02-lifecycle-and-correctness.md#h-08--two-incompatible-ways-of-reading-the-auth-token):
if `getAuthToken` reads the wrong field, nothing in the suite would notice.

### Fix

Add per-file thresholds so a gap like this fails CI rather than averaging away:

```ts
// vitest.config.mts
coverage: {
  thresholds: {
    branches: 70, functions: 70, lines: 75, statements: 75,
    // per-file floors for the public surface
    "src/utils.ts":  { branches: 90, functions: 100, lines: 90, statements: 90 },
    "src/hooks/**":  { branches: 80, functions: 85,  lines: 85, statements: 85 },
  },
},
```

Then write the missing tests. `getInfoFromUrl` needs the error paths too — empty string,
non-string, unparseable, missing `/app/`, too few segments, and a URL with query/hash:

```ts
describe("getInfoFromUrl", () => {
  it.each([
    ["", /valid MicroStrategy dossier URL is required/],
    ["not-a-url", /Invalid URL format/],
    ["https://h/Lib/notapp/p/d", /Invalid MicroStrategy URL path/],
    ["https://h/Lib/app/p", /Invalid MicroStrategy URL path/],
  ])("rejects %j", (input, expected) => {
    expect(() => getInfoFromUrl(input as string)).toThrow(expected);
  });

  it("ignores query string and hash", () => {
    const i = getInfoFromUrl("https://h/Lib/app/PROJ/DOSS?x=1#frag");
    expect(i).toMatchObject({ projectId: "PROJ", dossierId: "DOSS" });
  });
});

describe("getAuthToken", () => {
  it("returns undefined on non-ok response", async () => {
    global.fetch = vi.fn(async () => ({ ok: false })) as never;
    await expect(
      getAuthToken({ serverUrlLibrary: "https://h/Lib" }),
    ).resolves.toBeUndefined();
  });

  it("returns undefined and does not throw on network failure", async () => {
    global.fetch = vi.fn(async () => {
      throw new Error("offline");
    }) as never;
    await expect(
      getAuthToken({ serverUrlLibrary: "https://h/Lib" }),
    ).resolves.toBeUndefined();
  });
});
```

`getServerUrl` deserves a note of its own: it is a naive `indexOf("/app/")` slice, unlike
`getInfoFromUrl` which parses properly. On `https://h/Lib/app/p/d?next=/app/x` the two disagree.
Either reimplement it on top of `getInfoFromUrl` or document it as the fast path it is.

---

## M-09 — A dead vitest config inside `src/` skews coverage

There are two vitest configs:

```
packages/embed-dossier-mstr-react/vitest.config.mts     739 B   ← the real one
packages/embed-dossier-mstr-react/src/vitest.config.ts  122 B   ← dead
```

The `src/` one is a stub:

```ts
import { defineConfig } from "vitest/config";
export default defineConfig({ test: { environment: "jsdom" } });
```

Vitest never loads it — the root `.mts` wins. But because coverage `include` is
`["src/**/*.{ts,tsx}"]` and the `exclude` list names `"vitest.config.mts"` (root) rather than
this file, it is counted as **source with 0% coverage**, dragging the `src` directory line down
to 27.41% and obscuring the real `utils.ts` gap.

### Fix

```bash
git rm packages/embed-dossier-mstr-react/src/vitest.config.ts
```

No config references it; nothing imports it. Deleting it raises reported `src` coverage without
changing a single test, which is worth doing _before_ setting per-file thresholds so the numbers
mean something.

---

## Missing test categories

Beyond the specific findings, these are simply absent:

| Area                     | Status | Why it matters                                                                                                                              |
| ------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| SSR / `window`-undefined | none   | Library targets React; docs site is Next.js — see [H-03](./06-api-design-and-dx.md#h-03--no-use-client-directives-breaks-nextjs-app-router) |
| Concurrent SDK loading   | none   | [H-09](./02-lifecycle-and-correctness.md#h-09--useloadmstrsdk-races-and-tears-down-a-shared-resource)                                       |
| Unmount-during-async     | none   | [C-04](./01-critical-defects.md#c-04--unbounded-instance-re-creation-with-no-teardown) — create resolving after unmount                     |
| React 19                 | none   | `peerDependencies` claims support; suite runs React 18 only                                                                                 |
| Build-output smoke test  | none   | Nothing imports `dist/` to confirm it loads                                                                                                 |
| Type-level tests         | none   | Public generics/`Omit`s can regress silently                                                                                                |

### React 19 in particular

`package.json` declares `"react": "^18.2.0 || ^19.0.0"` but `devDependencies` pins React 18 and
that is the only version tested. Given that [C-03](./01-critical-defects.md#c-03--dashboardembedwithauth-renders-into-a-detached-dom-node)
depends on React's reconciliation behaviour and callback-ref semantics changed in 19, the
supported-versions claim is currently unverified. Add a CI matrix dimension:

```yaml
strategy:
  matrix:
    node-version: [20, 22]
    react-version: [18, 19]
```

with a step that installs the pinned React before running tests.

### A build-output smoke test

Cheap, and catches the class of failure that only appears after packing:

```js
// scripts/smoke-dist.mjs — run in CI after build
import assert from "node:assert";
const cjs = require("../packages/embed-dossier-mstr-react/dist/index.js");
const esm = await import("../packages/embed-dossier-mstr-react/dist/index.mjs");
for (const name of [
  "DashboardEmbed",
  "useCreateDashboard",
  "getInfoFromUrl",
  "EVENT_TYPE",
]) {
  assert(cjs[name], `CJS missing ${name}`);
  assert(esm[name], `ESM missing ${name}`);
}
console.log("dist smoke OK");
```

This would also have caught [H-04](./02-lifecycle-and-correctness.md#h-04--circular-import-between-a-hook-and-the-barrel-file)
had the circular import ever resolved to `undefined`.
