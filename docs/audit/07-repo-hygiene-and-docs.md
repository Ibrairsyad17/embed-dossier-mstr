# 07 — Repository Hygiene & Documentation

> Low-severity findings. None break functionality; together they are the difference between a
> repository that reads as maintained and one that reads as drifting.

| ID                                                                  | Severity | Summary                                  |
| ------------------------------------------------------------------- | -------- | ---------------------------------------- |
| [L-01](#l-01--the-readme-contains-a-duplicated-block)               | 🔵 Low   | ~37 lines repeated verbatim              |
| [L-02](#l-02--test-resultsjson-is-committed)                        | 🔵 Low   | 72 KB build artifact in version control  |
| [L-06](#l-06--a-second-husky-installation-in-appsdocs)              | 🔵 Low   | Orphaned nested `.husky/`                |
| [L-07](#l-07--verceljson-corepack-workaround)                       | 🔵 Low   | Four commits' worth of workaround        |
| [L-08](#l-08--eslint-import-plugin-loaded-but-unused)               | 🔵 Low   | Plugin registered, zero rules configured |
| [L-09](#l-09--react-hooksexhaustive-deps-is-a-warning-not-an-error) | 🔵 Low   | The rule that would have caught C-04     |

---

## L-01 — The README contains a duplicated block

`README.md` lines **38–75** are repeated verbatim at lines **77–114**:

```
 38  **Peer dependencies:** React 18.2+ or React 19
 40  ## ⚡ Quick Start
 57  ## 🔐 With Authentication
 ---
 77  **Peer dependencies:** React 18.2+ or React 19    ← duplicate
 79  ## ⚡ Quick Start                                   ← duplicate
 96  ## 🔐 With Authentication                          ← duplicate
```

A reader scrolling the npm page hits "Quick Start" twice, with slightly different auth examples
(`loadingComponent`/`errorComponent` appear only in the second copy).

This is the README **published to npm** — `package.json:23-28` includes `README.md` in `files`,
and it is what renders on the package page.

### Fix

Delete the first copy (lines 38–75) and keep the second, which is the more complete of the two.
Then read the result end-to-end; the duplication suggests a bad merge, so check for other
artifacts of the same merge.

Worth adding a link-and-structure check to CI:

```yaml
- name: Lint markdown
  run: npx markdownlint-cli2 "**/*.md" "#node_modules"
```

`markdownlint`'s `MD024` (duplicate headings) catches exactly this.

---

## L-02 — `test-results.json` is committed

```
packages/embed-dossier-mstr-react/test-results.json    72,616 bytes    tracked
```

A test-run artifact in version control. `.gitignore` covers `coverage` and `report.json` but
not this filename, so it was committed and now churns on every run that regenerates it.

### Fix

```bash
git rm --cached packages/embed-dossier-mstr-react/test-results.json
```

```diff
 # Coverage & test reports
 coverage
 report.json
+test-results.json
 *.tsbuildinfo
```

Check where it comes from — if a vitest reporter is configured to emit it, either point the
output into `coverage/` or drop the reporter. It is not referenced by any script or workflow.

---

## L-06 — A second husky installation in `apps/docs`

```
apps/docs/.husky/          ← orphaned
apps/docs/package.json:14  "prepare": "husky"
```

The docs workspace runs its own `husky` install on every `pnpm install`, which fails audibly:

```
apps/docs prepare$ husky
apps/docs prepare: .git can't be found
apps/docs prepare: Done
```

Git hooks belong to the repository, not to a workspace. The root already installs husky
correctly (`package.json:8`).

### Fix

```bash
git rm -r apps/docs/.husky
```

```diff
   "format:check": "npx prettier --check .",
   "generate-content-json": "ts-node scripts/content.ts",
-  "prepare": "husky"
 }
```

Also drop `husky` from `apps/docs` devDependencies if it is listed there.

---

## L-07 — `vercel.json` corepack workaround

```json
{ "installCommand": "npx pnpm@9.15.4 install" }
```

The history shows four commits converging on this:

```
4dbcd17  fix(vercel): use npx pnpm to guarantee version override
435eb0a  fix(vercel): force corepack to use pnpm@9.15.4 in preinstall
b52ffa8  fix: update TypeScript configuration and add Vercel configuration file
49d22df  chore: update packageManager version to pnpm@9.15.4
4a33232  fix: update Node.js version requirement and remove Vercel configuration file
```

Vercel honours `packageManager` natively now. Retry without the override — if the build
succeeds, delete `vercel.json`.

If it must stay, add a one-line comment in the docs app README recording _why_, with the date
and the error it works around, so the next person does not spend another four commits
rediscovering it.

---

## L-08 — ESLint `import` plugin loaded but unused

`.eslintrc.js:26` registers the plugin:

```js
plugins: ["@typescript-eslint", "react", "react-hooks", "import"],
```

but `rules` contains no `import/*` entry, and `extends` does not include
`plugin:import/recommended`. The plugin is loaded — costing resolution time on every lint — and
enforces nothing.

Had `import/no-cycle` been enabled, it would have caught
[H-04](./02-lifecycle-and-correctness.md#h-04--circular-import-between-a-hook-and-the-barrel-file)
at authoring time.

### Fix

```js
extends: [
  "eslint:recommended",
  "plugin:@typescript-eslint/recommended",
  "plugin:react/recommended",
  "plugin:react-hooks/recommended",
  "plugin:import/recommended",
  "plugin:import/typescript",
],
rules: {
  "import/no-cycle": ["error", { maxDepth: Infinity }],
  "import/no-self-import": "error",
  "import/no-extraneous-dependencies": ["error", {
    devDependencies: ["**/*.test.{ts,tsx}", "**/tests/**", "**/*.config.{ts,mts}"],
  }],
  "import/order": ["warn", {
    groups: [["builtin", "external"], "internal", ["parent", "sibling", "index"]],
    "newlines-between": "always",
  }],
},
```

`import/no-extraneous-dependencies` is the valuable one for a published package: it catches a
devDependency leaking into shipped code, which would break every consumer's install.

### Related: ESLint 8 is end-of-life

`eslint@^8.57.0` no longer receives fixes, and it is the root of a large share of the
transitive advisories in [M-07](./05-security-and-dependencies.md#m-07--143-advisories-across-the-workspace)
(`minimatch`, `brace-expansion`, `glob`, `js-yaml`). Migrating to ESLint 9 flat config is worth
scheduling as its own task — do it together with the rule changes above rather than twice.

---

## L-09 — `react-hooks/exhaustive-deps` is a warning, not an error

Inherited from `plugin:react-hooks/recommended`, the rule is a **warning**. Current output:

```
$ pnpm lint
useCreateLibraryPage.ts
  43:6  warning  React Hook useEffect has missing dependencies: 'createLibraryPage',
                 'libraryPage', and 'libraryPageState.isLoading'
  54:6  warning  React Hook useEffect has missing dependencies: 'createLibraryPage'
                 and 'libraryPage'

✖ 2 problems (0 errors, 2 warnings)
```

CI passes. Two more suppressions are inline:

```
useCreateDashboard.ts:82              // eslint-disable-next-line react-hooks/exhaustive-deps
useCreateBotConsumptionPage.ts:55     // eslint-disable-next-line react-hooks/exhaustive-deps
```

So the rule that most directly governs this library's core correctness — effect dependencies
in hooks that manage external resources — is advisory in two places and switched off in two
others. Every dependency-array defect in this audit
([C-04](./01-critical-defects.md#c-04--unbounded-instance-re-creation-with-no-teardown),
[M-06](./02-lifecycle-and-correctness.md#m-06--usecreatelibrarypage-effect-wiring-is-unsound))
sits behind one of those four.

### Fix

Promote it, and fail on warnings:

```js
rules: {
  "react-hooks/exhaustive-deps": "error",
  "react-hooks/rules-of-hooks": "error",
}
```

```diff
-"lint": "eslint \"src/**/*.ts*\"",
+"lint": "eslint \"src/**/*.ts*\" --max-warnings 0",
```

Sequence this **after** the C-04 and M-06 fixes, since those are what the rule is currently
flagging — otherwise you are choosing between a red build and re-adding the suppressions.

Where a suppression is genuinely correct (a mount-once effect), replace the bare disable with
one that states the reasoning:

```ts
// The dashboard is created once per SDK load; `config` changes are handled by
// the dedicated re-creation effect below. See docs/audit/01-critical-defects.md#c-04
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [isSdkLoaded]);
```

---

## Documentation observations

Not numbered findings, but worth acting on.

### The docs site is a genuine asset

65 MDX pages, clean build in ~15 s, 71 static routes, per-component "Security Considerations"
sections, search data, sitemap and robots.txt. Well above the norm for a project this size.

### But it documents behaviour that does not work

Every page for `BotConsumptionPageWithAuth` and `LibraryPageEmbedWithAuth` describes components
that cannot function ([C-01](./01-critical-defects.md#c-01--botconsumptionpagewithauth-deadlocks-and-never-renders),
[C-02](./01-critical-defects.md#c-02--librarypageembedwithauth-never-leaves-the-loading-state)).
The examples are correct as _intent_ — they will work once the fix lands — so no doc rewrite is
needed, but consider a temporary banner on those pages until a fixed version ships.

### Version drift

`apps/docs/contents/docs/.../tasty-feet-doubt.md` and several MDX pages reference version
`0.1.0`; the package is at `2.0.0`. Add a docs check that reads the version from
`packages/embed-dossier-mstr-react/package.json` rather than hardcoding it.

### The README's own claims to revisit after the fixes

| Claim                                                   | Status                                                                                                                                                            |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "production-ready"                                      | Not until C-01 … C-04 ship                                                                                                                                        |
| "Comprehensive tests — All components and hooks tested" | Technically true, materially misleading ([H-01](./03-testing-strategy.md#h-01--component-tests-mock-the-hook-under-test))                                         |
| "no `any` in your code"                                 | One `any` on the public event handler ([L-04](./06-api-design-and-dx.md#l-04--any-in-the-public-event-type))                                                      |
| "Reports" in the title                                  | No report embedding exists ([L-05](./06-api-design-and-dx.md#l-05--declared-but-unreachable-sdk-surface))                                                         |
| "Automatic cleanup — Dashboards are closed on unmount"  | True of `useCreateDashboard` only; false for all three `*WithAuth` hooks ([C-04](./01-critical-defects.md#c-04--unbounded-instance-re-creation-with-no-teardown)) |

That last row is the one to prioritise — it is the specific guarantee C-04 violates.

### Missing from CONTRIBUTING.md

- Where to run `pnpm changeset` from (root — see [H-06](./04-build-release-ci.md#h-06--three-changesets-are-being-silently-discarded))
- The testing policy from [03](./03-testing-strategy.md#h-01--component-tests-mock-the-hook-under-test):
  do not mock the hook a component exists to drive
- How to test against a real MicroStrategy server (the demo server URL in the README is a good
  starting point and should be documented as the manual-verification path)
