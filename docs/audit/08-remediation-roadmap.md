# 08 — Remediation Roadmap

> Execution order for all 33 findings, grouped into five shippable phases with dependencies,
> effort estimates and a release plan.

Estimates assume one developer familiar with the codebase. They are for _implementation plus
tests plus review_, not just typing.

---

## Dependency graph

Some fixes must land together, and some must not land before others. The constraints that
actually matter:

```
C-01 ─┐
C-02 ─┼─▶ MUST ship with C-04
C-03 ─┘   (unblocking the deadlock without fixing the effect loop
           converts a silent hang into a login-request loop)

H-01 ─────▶ should land with Phase 1 as the regression guard

C-04 ─────▶ M-06, L-09
            (promote exhaustive-deps to error only AFTER the
             dependency-array defects it flags are fixed)

H-07 ─────▶ H-03
            (SSR guards belong in the same pass as requireSdk())

H-06 ─────▶ any release
            (resolve the orphaned changesets before `changeset version`
             runs again, or the next release inherits the problem)

M-09 ─────▶ M-02
            (delete the dead config before setting per-file thresholds,
             so the numbers mean something)
```

**The one hard rule:** C-01, C-02, C-03 and C-04 ship as a single unit. Splitting them makes
things worse, not better.

---

## Phase 1 — Critical fixes → patch release

**Goal:** the published package does what it advertises.
**Effort:** 2–3 days · **Ship as:** `2.0.1`

| ID   | Task                                                          | Effort |
| ---- | ------------------------------------------------------------- | ------ |
| C-01 | `BotConsumptionPageWithAuth` — callback ref + overlay pattern | 2h     |
| C-02 | `LibraryPageEmbedWithAuth` — same                             | 2h     |
| C-03 | `DashboardEmbedWithAuth` — same, plus `useMemo` on config     | 3h     |
| C-04 | Teardown + `AbortController` in all three `*WithAuth` hooks   | 4h     |
| H-02 | Guard `getInfoFromUrl` in `DashboardEmbedWithAuth` render     | 1h     |
| H-01 | Integration tests — real hooks, no mocking                    | 6h     |
| H-04 | Fix circular import (one line)                                | 5m     |

### Order of work

1. **Write the failing tests first.** Copy
   [`evidence/placeholder-repro.test.tsx`](./evidence/placeholder-repro.test.tsx) into
   `src/tests/`. Confirm 3 failures — that is your baseline.
2. **Fix C-01 and C-02** (identical pattern, mechanical).
3. **Fix C-04** in all three hooks before touching C-03 — otherwise unblocking C-03 starts a
   re-authentication loop against a real server.
4. **Fix C-03** and H-02 together; they touch the same render body.
5. **Fix H-04** — trivial, but do it here so the barrel is clean before anything else imports
   through it.
6. **Unskip the C-04 lifecycle test.** All four must pass.
7. **Manual verification against a real MicroStrategy server.** The unit suite cannot prove the
   SDK renders correctly into the container — only that it is handed an attached node. Verify
   each of the six components by hand before shipping.

### Exit criteria

- [ ] All four cases in `placeholder-repro.test.tsx` pass
- [ ] `dossier.create` called exactly once per mount; `.close()` called on unmount
- [ ] Parent re-renders do not re-create instances
- [ ] Custom non-`<div>` `loadingComponent` still yields an attached placeholder
- [ ] Manual verification of all six components against a live server
- [ ] `npx madge --circular --extensions ts,tsx src/` reports none

### Release note

This is a **bug-fix release with a behavioural change**: components that previously rendered
nothing now render. Anyone who built a workaround (a wrapper forcing a mount, a manual
placeholder) may see doubled embeds. Call that out explicitly in the changelog.

---

## Phase 2 — Release integrity

**Goal:** the next version publishes what you intend, from a reproducible tree.
**Effort:** 1 day · **Ship as:** part of `2.0.1` or immediately after

| ID   | Task                                                            | Effort       |
| ---- | --------------------------------------------------------------- | ------------ |
| H-06 | Resolve the orphaned `.changeset/` directory                    | 1h           |
| H-05 | Fix the `release` script filter; add `prepublishOnly`           | 30m          |
| M-03 | Un-ignore the lockfile; `--frozen-lockfile` in all four CI jobs | 1h           |
| M-04 | Give `apps/docs` a real lint script                             | 2h + backlog |
| M-05 | Pre-commit runs `lint-staged`; add pre-push typecheck           | 30m          |
| M-08 | Reconcile `engines.node` with the CI matrix                     | 15m          |
| L-02 | Untrack `test-results.json`                                     | 5m           |

**Do H-06 first.** Until the orphaned changesets are dealt with, every release inherits the
problem — and Phase 1 needs to publish.

M-04 may uncover a real lint backlog in the docs app. Timebox the triage; if it is large, land
the script with an explicit warning budget and ratchet it down rather than blocking Phase 2.

### Exit criteria

- [ ] `npx turbo build --filter=embed-dossier-mstr-react --dry=json` lists the build task
- [ ] Exactly one `.changeset/` directory exists, at the root
- [ ] `pnpm install --frozen-lockfile` succeeds from a clean clone
- [ ] `pnpm lint` actually lints `apps/docs`
- [ ] A test commit triggers `lint-staged`, not the full suite

---

## Phase 3 — Correctness hardening

**Goal:** close the defects that will resurface as bugs once Phase 1 unblocks real usage.
**Effort:** 3–4 days · **Ship as:** `2.1.0`

| ID   | Task                                                                                                        | Effort |
| ---- | ----------------------------------------------------------------------------------------------------------- | ------ |
| H-09 | `useLoadMstrSDK` module-level promise cache + ref counting                                                  | 4h     |
| H-08 | Resolve the auth-token inconsistency; single shared helper                                                  | 3h     |
| H-07 | `window.microstrategy?` optional + `requireSdk()` accessor                                                  | 3h     |
| M-06 | Rewrite `useCreateLibraryPage` effect wiring                                                                | 4h     |
| M-10 | Remove the no-op state update                                                                               | 5m     |
| M-11 | Unify `*WithAuth` hook return shapes                                                                        | 2h     |
| —    | Check auth response status codes ([05](./05-security-and-dependencies.md#auth-responses-are-never-checked)) | 2h     |
| M-02 | Test `getServerUrl` / `getAuthToken`; per-file thresholds                                                   | 4h     |
| M-09 | Delete `src/vitest.config.ts`                                                                               | 5m     |

**H-08 needs a live server** to resolve — schedule the probe early so it does not block the
rest of the phase.

M-11 changes hook return shapes. Adding `isAuthenticating` to `useCreateLibraryPageWithAuth` is
additive and safe; making `config` optional on `BotConsumptionPageWithAuth` is
source-compatible. Neither needs a major.

### Exit criteria

- [ ] Two components mounting concurrently produce exactly one `<script>` tag
- [ ] Unmounting one embed does not break its siblings
- [ ] `getAuthToken` verified against a real server and covered by tests
- [ ] `utils.ts` coverage ≥ 90%
- [ ] All three `*WithAuth` hooks return `{ isAuthenticated, isAuthenticating, error }`

---

## Phase 4 — Compatibility & DX

**Goal:** the library works where its users actually build.
**Effort:** 2–3 days · **Ship as:** `2.2.0`

| ID   | Task                                                          | Effort |
| ---- | ------------------------------------------------------------- | ------ |
| H-03 | `"use client"` directives + SSR guards + SSR test             | 4h     |
| M-01 | `getInfoFromUrl` tuple destructuring; export `DossierUrlInfo` | 2h     |
| L-03 | Prefix console output; optional logger                        | 3h     |
| L-04 | `EventHandler<T>` with an incremental payload map             | 4h     |
| —    | React 19 CI matrix dimension                                  | 2h     |
| —    | `publint` + `arethetypeswrong` in CI                          | 1h     |
| —    | Build-output smoke test                                       | 2h     |

H-03 is the highest-value item here: it is the difference between "works in Next.js" and
"user has to write a wrapper and figure out why".

M-01 changes an exported type signature from `string | undefined` to `string`. That is a
_widening_ of what consumers can do, so it is not breaking — existing null-checks still
compile.

### Exit criteria

- [ ] `renderToString` works in a `node` environment with no `window`
- [ ] A Next.js App Router server component can import the package directly
- [ ] `npx publint` and `npx @arethetypeswrong/cli --pack` both clean
- [ ] CI green on React 18 **and** 19

---

## Phase 5 — Hygiene & long tail

**Goal:** the repository reads as maintained.
**Effort:** 2 days · **Ship as:** rolling

| ID   | Task                                                                                                             | Effort |
| ---- | ---------------------------------------------------------------------------------------------------------------- | ------ |
| M-07 | Upgrade vitest (critical advisory), Next.js, mermaid                                                             | 4h     |
| —    | Dependabot/Renovate config                                                                                       | 1h     |
| L-01 | Remove the duplicated README block                                                                               | 15m    |
| L-08 | ESLint `import` rules; plan the ESLint 9 migration                                                               | 3h     |
| L-09 | Promote `exhaustive-deps` to `error`; `--max-warnings 0`                                                         | 1h     |
| L-06 | Remove `apps/docs/.husky`                                                                                        | 10m    |
| L-07 | Retry removing the `vercel.json` workaround                                                                      | 30m    |
| L-05 | Implement report embedding **or** scope the claim down                                                           | 1–8h   |
| —    | Update README claims (see [07](./07-repo-hygiene-and-docs.md#the-readmes-own-claims-to-revisit-after-the-fixes)) | 1h     |
| —    | Expand `CONTRIBUTING.md`                                                                                         | 1h     |

**L-09 must come after Phase 1 and M-06** — it is the rule currently flagging those defects.

**M-07's vitest upgrade** is the one item here worth pulling forward: it is a critical advisory
with a live attack path against developers running `pnpm test:ui`.

L-05 is a product decision, not a bug: implement `ReportPageEmbed` (~8h, types already exist) or
correct the README, `package.json` description and docs (~1h).

---

## Summary

| Phase | Focus                 | Effort         | Version |
| ----- | --------------------- | -------------- | ------- |
| 1     | Critical fixes        | 2–3 days       | `2.0.1` |
| 2     | Release integrity     | 1 day          | `2.0.1` |
| 3     | Correctness hardening | 3–4 days       | `2.1.0` |
| 4     | Compatibility & DX    | 2–3 days       | `2.2.0` |
| 5     | Hygiene & long tail   | 2 days         | rolling |
|       | **Total**             | **~2.5 weeks** |         |

### If you only do one thing

Phase 1. Two of six components are non-functional in a package that is on npm and described as
production-ready. Everything else can wait; that cannot.

### If you only do two

Phase 1 and **H-01** (the integration tests inside it). The tests are what stop this recurring
— without them, the next refactor reintroduces the same class of bug with the same green CI.

---

## A note on what this audit did not cover

Stated plainly so the gaps are not mistaken for clean bills of health:

- **No live MicroStrategy server.** Every SDK interaction was verified against a stub. Whether
  the SDK renders correctly into a correctly-attached container is unverified — hence the
  manual-verification step in Phase 1's exit criteria. [H-08](./02-lifecycle-and-correctness.md#h-08--two-incompatible-ways-of-reading-the-auth-token)
  is explicitly unresolved for the same reason.
- **No browser testing.** Everything ran in jsdom. Real reconciliation behaviour, CSP
  interactions with script injection, and cross-origin header exposure need a real browser.
- **The docs app was audited shallowly** — it builds, it lints (once M-04 lands), and its
  dependencies were scanned. Its ~30 components were not reviewed line by line.
- **No performance work.** Bundle size (26 KB ESM) is reasonable; nothing was profiled.
- **No accessibility audit.** The embed containers are bare `<div>`s with no ARIA; the
  MicroStrategy iframe's own a11y is outside this repository's control, but the loading and
  error states this library renders are not, and they currently announce nothing to screen
  readers. Worth a dedicated pass.
