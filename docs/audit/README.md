# Repository Audit — `embed-dossier-mstr`

**Audit date:** 2026-08-01
**Commit audited:** `b4267ef` (merge of PR #11)
**Package version:** `embed-dossier-mstr-react@2.0.0` (published to npm)
**Scope:** full monorepo — library package, docs app, build/release pipeline, CI, dependencies, documentation

---

## How to read this audit

Every finding has a stable ID (`C-01`, `H-03`, …) so it can be referenced in issues and PRs.
Findings are grouped by theme across eight documents, and sequenced for execution in
[`08-remediation-roadmap.md`](./08-remediation-roadmap.md).

| #   | Document                                                     | Findings                                       |
| --- | ------------------------------------------------------------ | ---------------------------------------------- |
| 01  | [Critical defects](./01-critical-defects.md)                 | C-01 … C-04                                    |
| 02  | [Lifecycle & correctness](./02-lifecycle-and-correctness.md) | H-02, H-04, H-07, H-08, H-09, M-06, M-10, M-11 |
| 03  | [Testing strategy](./03-testing-strategy.md)                 | H-01, M-02, M-09                               |
| 04  | [Build, release & CI](./04-build-release-ci.md)              | H-05, H-06, M-03, M-04, M-05, M-08             |
| 05  | [Security & dependencies](./05-security-and-dependencies.md) | M-07, plus credential-handling review          |
| 06  | [API design & DX](./06-api-design-and-dx.md)                 | H-03, M-01, L-03, L-04, L-05                   |
| 07  | [Repo hygiene & docs](./07-repo-hygiene-and-docs.md)         | L-01, L-02, L-06, L-07, L-08, L-09             |
| 08  | [Remediation roadmap](./08-remediation-roadmap.md)           | sequencing, effort, release plan               |

Reproduction code referenced throughout lives in
[`evidence/placeholder-repro.test.tsx`](./evidence/placeholder-repro.test.tsx).

### Evidence standard

Every finding in this audit was **executed and observed**, not inferred from reading code.
Where a claim rests on a command, the command and its real output are quoted inline. Two
findings are explicitly marked _unverified_ because they depend on a live MicroStrategy
server that this audit had no access to — they are flagged as **verify against your
environment**, not asserted as defects (see H-08 and the SAML/OIDC note in
[02](./02-lifecycle-and-correctness.md)).

---

## Executive summary

The repository presents well: TypeScript-first with ~40 exported interfaces, a 65-page
Next.js documentation site that builds clean, a four-job CI matrix, changesets-based
releases, conventional commits with husky and commitlint, and an 80-test suite that passes
green. The architecture — a thin, lazily-loading React wrapper over MicroStrategy's imperative
Embedding SDK — is the right shape for the problem.

Underneath that, **two of the three authenticated embed components cannot work at all**, and a
third works only by coincidence. The cause is a single mistaken React pattern repeated in all
three components. The test suite does not catch it because all six component test files mock
away the exact layer where the bug lives.

The published artifact — `embed-dossier-mstr-react@2.0.0`, currently on npm — is affected.

### Severity distribution

| Severity    | Count  | Meaning                                                           |
| ----------- | ------ | ----------------------------------------------------------------- |
| 🔴 Critical | 4      | Advertised functionality does not work; shipped to npm            |
| 🟠 High     | 9      | Breaks real integrations, silently corrupts release/CI guarantees |
| 🟡 Medium   | 11     | Correctness/maintenance risk, degraded DX                         |
| 🔵 Low      | 9      | Hygiene, docs, consistency                                        |
|             | **33** |                                                                   |

### The headline defect

All three `*WithAuth` components read a `useRef` container **during render** and hand
`ref.current` to the SDK as its render target:

```tsx
const containerRef = useRef<HTMLDivElement>(null);

const { isAuthenticated } = useCreateBotConsumptionPageWithAuth({
  placeholder: containerRef.current, // null on first render
  /* … */
});

if (!isAuthenticated) return null; // …so the <div> never mounts
```

A ref is `null` on first render and **mutating it does not trigger a re-render**. The hook
guards its effect with `if (!isSdkLoaded || !placeholder) return;`. So when the container
`<div>` is gated behind auth state, the ref can never populate, the guard never passes, auth
never runs, and `isAuthenticated` never flips. It is a closed loop with no exit.

Measured behaviour, running the real hooks against a stubbed `window.microstrategy`:

| Component                    | Observed                                                            |
| ---------------------------- | ------------------------------------------------------------------- |
| `BotConsumptionPageWithAuth` | `embedBotConsumptionPage` **never called** — renders `null` forever |
| `LibraryPageEmbedWithAuth`   | **Never leaves `Loading…`**                                         |
| `DashboardEmbedWithAuth`     | Works — **only by accident** (see C-03)                             |

`DashboardEmbedWithAuth` survives because its default `loadingComponent` is
`<div>Loading...</div>`. React reconciles that `<div>` against the container `<div>` at the
same tree position and reuses the same DOM node, so the ref happens to survive the swap. Pass
a custom loading component whose root is not a `<div>` — precisely what the README and the
component's own JSDoc recommend — and the SDK renders into a **detached** node: blank area, no
error, no warning.

```
default <div>Loading...</div>  → placeholder attached to document: true
custom  <Spinner/> (a <span>)  → placeholder attached to document: FALSE
```

Separately, the same mount was measured calling `dossier.create` **twice**, because `config`
is rebuilt as a fresh object literal on every render and sits in the effect's dependency
array. Nothing calls `.close()` on the superseded instance.

### What is genuinely good

These are worth protecting through the refactor:

- **`useCreateDashboard`** is the reference implementation — it holds the instance in a ref,
  closes it on unmount inside a `try`/`catch`, and guards against post-unmount `setState` with
  a `mounted` flag. The `*WithAuth` hooks should be brought up to it, not the reverse.
- **`getInfoFromUrl`** validates properly via the `URL` constructor with actionable error
  messages that quote the offending input and state the expected format.
- **`tsconfig.json`** is genuinely strict — `strict`, `noUncheckedIndexedAccess`,
  `noUnusedLocals`, `noUnusedParameters`. Stricter than most published React libraries.
- **Documentation site** — 65 MDX pages, builds clean in ~15s, includes per-component
  "Security Considerations" sections. Substantial and well organised.
- **Build output** is correct: dual ESM/CJS with a proper `exports` map, `sideEffects: false`,
  React externalised, 26 KB ESM.
- **Coverage thresholds are configured and enforced** in `vitest.config.mts` — the mechanism
  is right, the assertions underneath it are what need work.

### The pattern behind the pattern

Three of the four critical findings and several high ones share one root cause: **the DOM
node's existence is coupled to the state that only becomes true after the DOM node exists.**
Fixing it is mechanical and is specified in full in
[C-01](./01-critical-defects.md#c-01--botconsumptionpagewithauth-deadlocks-and-never-renders):
always render the container, use a **callback ref** so attachment is an observable event, and
overlay loading/error states on top of the container rather than replacing it.

The second recurring cause is **unstable object identity in dependency arrays** — inline
`config` literals passed into effects, producing either infinite re-creation or (where masked
by an early-return guard) silently dead effects.

The third is **tests written against mocks of the unit under test**, which convert integration
bugs into invisible ones.

Fix those three patterns and roughly two thirds of this audit closes.

### Suggested sequencing

1. **Ship a patch release fixing C-01 … C-04** with the integration tests from
   [`evidence/`](./evidence/placeholder-repro.test.tsx) as regression guards. This is the only
   change that alters published runtime behaviour, and it should go out on its own.
2. **Close the release-integrity gaps** (H-05, H-06, M-03) so subsequent versions publish what
   you think they publish — H-06 in particular means three pending `major` changesets are
   currently being silently discarded.
3. **Repair the test strategy** (H-01) before further feature work, so the next regression is
   caught by CI rather than by users.
4. Work down High → Medium → Low as capacity allows.

Full sequencing with effort estimates and a proposed release plan is in
[`08-remediation-roadmap.md`](./08-remediation-roadmap.md).

---

## Reproducing this audit

```bash
pnpm install --no-frozen-lockfile

# Unit suite (passes — see 03 for why that is misleading)
pnpm --filter embed-dossier-mstr-react test

# Coverage, including the utils.ts gap
pnpm --filter embed-dossier-mstr-react coverage

# Typecheck + lint
pnpm -r exec tsc --noEmit
pnpm lint

# Release-filter defect (H-05) — resolves to zero tasks
npx turbo build --filter=embed-dossier-mstr-docs^... --dry=json

# Dependency advisories (M-07)
pnpm audit
```

To reproduce the critical defects, copy
[`evidence/placeholder-repro.test.tsx`](./evidence/placeholder-repro.test.tsx) into
`packages/embed-dossier-mstr-react/src/tests/` and run it. All three of its active cases fail
against `b4267ef`; all three should pass once C-01 … C-03 are fixed. A fourth case for C-04 is
committed `.skip`-ped, since it cannot pass until the lifecycle fix lands.
