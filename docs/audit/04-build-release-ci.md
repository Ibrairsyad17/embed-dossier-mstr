# 04 — Build, Release & CI

> The release pipeline currently discards pending version bumps and runs a build step that
> resolves to zero tasks. CI reports green on jobs that check nothing.

| ID                                                                     | Severity  | Summary                                             |
| ---------------------------------------------------------------------- | --------- | --------------------------------------------------- |
| [H-05](#h-05--pnpm-release-builds-nothing)                             | 🟠 High   | `release` script's turbo filter matches no packages |
| [H-06](#h-06--three-changesets-are-being-silently-discarded)           | 🟠 High   | Orphaned nested `.changeset/` directory             |
| [M-03](#m-03--the-lockfile-is-gitignored-and-ci-never-enforces-it)     | 🟡 Medium | Non-reproducible installs across all jobs           |
| [M-04](#m-04--the-docs-lint-script-is-a-no-op)                         | 🟡 Medium | CI Lint job green while linting nothing             |
| [M-05](#m-05--pre-commit-runs-the-wrong-thing-and-lint-staged-is-dead) | 🟡 Medium | `lint-staged` configured but never invoked          |
| [M-08](#m-08--enginesnode-contradicts-the-ci-matrix)                   | 🟡 Medium | `20.x` declared, 20 and 22 tested                   |

---

## H-05 — `pnpm release` builds nothing

**File:** `package.json:13`

```json
"release": "turbo build --filter=embed-dossier-mstr-docs^... && changeset publish"
```

Measured:

```
$ npx turbo build --filter=embed-dossier-mstr-docs^... --dry=json
packages in scope: []
tasks: []
```

Zero packages, zero tasks.

### Why

The `^...` suffix means _"the dependencies of this package, excluding the package itself"_. So
the filter reads: build everything `embed-dossier-mstr-docs` depends on. But
`apps/docs/package.json` has **no dependency on `embed-dossier-mstr-react`** — the docs site
renders MDX describing the library rather than importing it:

```
$ grep -n "embed-dossier-mstr-react" apps/docs/package.json
NO DEPENDENCY
```

With no workspace dependencies, `^...` selects the empty set. The `&&` still succeeds — a
no-op turbo run exits 0 — so `changeset publish` proceeds regardless.

The intent was almost certainly `--filter=embed-dossier-mstr-react`, and the git history
supports that reading: commit `64fb519` ("fix(workspace): update turbo filters to use correct
package name for docs") edited this line while chasing a different problem.

### Why it has not caused an incident yet

`.github/workflows/release.yml:35` runs a separate full `pnpm build` before invoking
`changeset publish`, so `dist/` exists by the time publish runs. The release script is
load-bearing in name only — its safety comes entirely from the workflow around it.

That is a latent failure. Anyone running `pnpm release` locally, or any workflow refactor that
trusts the script to build, publishes whatever stale or absent `dist/` happens to be on disk.
`package.json`'s `files` array includes `"dist"`, so a missing build yields a package with no
entry points and `main`/`module`/`types` pointing at nothing.

### Fix

```diff
-"release": "turbo build --filter=embed-dossier-mstr-docs^... && changeset publish"
+"release": "turbo build --filter=embed-dossier-mstr-react && changeset publish"
```

Then make the guarantee explicit rather than incidental — add a `prepublishOnly` to the package
so the artifact cannot be published unbuilt regardless of entry point:

```json
// packages/embed-dossier-mstr-react/package.json
"scripts": {
  "prepublishOnly": "pnpm run build && pnpm run test"
}
```

Verify:

```bash
npx turbo build --filter=embed-dossier-mstr-react --dry=json | jq '.tasks[].taskId'
# → "embed-dossier-mstr-react#build"
```

---

## H-06 — Three changesets are being silently discarded

There are **two** changesets installations:

```
.changeset/                                    ← root; the one changesets reads
├── README.md
└── config.json                                  "access": "public",  schema 2.0.0

packages/embed-dossier-mstr-react/.changeset/  ← orphaned
├── README.md
├── config.json                                  "access": "restricted", schema 3.0.5
├── mean-papers-do.md      → "embed-dossier-mstr-react": major
├── tasty-feet-doubt.md    → "embed-dossier-mstr-react": major
└── ten-cloths-march.md    → "embed-dossier-mstr-react": major
```

`changeset version` and `changeset publish` run from the repo root (`package.json:12-13`) and
read the **root** `.changeset/` only. The three pending changesets in the package directory are
never consumed — they describe real, shipped work:

- _"Adding some properties in MicroStategyDossier interface"_
- _"embed-dossier-mstr-react is a React package that provides components and utilities…"_
- _"Added authentication support for embedding dossiers, dashboards, bot consumption page, and library page."_

All three are marked `major`. All three have been ignored.

### Impact

1. **Version bumps are lost.** Three major bumps' worth of intent never reached the version
   number. The package sits at `2.0.0`; per these changesets it should be considerably higher.
2. **The changelog has holes.** `CHANGELOG.md` is generated from consumed changesets, so this
   work is undocumented for consumers — including the entire authentication feature.
3. **Conflicting config.** The nested config declares `"access": "restricted"` against the
   root's `"public"`. Inert today, but if anyone ever runs changesets from the package
   directory, it would attempt a restricted (private) publish.
4. **It is a trap.** A contributor running `pnpm changeset` inside the package directory gets
   a changeset written to the orphaned folder, and their version bump silently vanishes too.

This is a leftover from the package having once been its own repository — the nested config's
schema version (3.0.5) is _newer_ than the root's (2.0.0), consistent with it being generated
later by a different CLI invocation.

### Fix

```bash
# 1. Preserve the intent — move pending changesets to the root
git mv packages/embed-dossier-mstr-react/.changeset/mean-papers-do.md   .changeset/
git mv packages/embed-dossier-mstr-react/.changeset/tasty-feet-doubt.md .changeset/
git mv packages/embed-dossier-mstr-react/.changeset/ten-cloths-march.md .changeset/

# 2. Remove the orphaned installation
git rm -r packages/embed-dossier-mstr-react/.changeset
```

**Before running `changeset version`, review those three.** They are all `major`, and applying
them as-is bumps `2.0.0 → 3.0.0` (changesets collapses multiple majors into one bump). Since
they describe already-released work, the honest options are:

- **Rewrite them as an empty changeset** documenting the history without bumping, or
- **Delete them** and note the gap in `CHANGELOG.md` by hand, or
- **Let them bump** if you accept 3.0.0 as the next version.

The `tasty-feet-doubt.md` one in particular is not a changelog entry at all — it is the
package description, and its text ("currently at version 0.1.0") is stale. Do not ship it.

Given that the C-01 … C-04 fixes are themselves shipping imminently, the cleanest path is:
delete the three stale changesets, add a hand-written `CHANGELOG.md` note covering the
undocumented auth feature, and let the critical-defect fix generate its own changeset.

### Prevention

Add to `CONTRIBUTING.md`: _"Run `pnpm changeset` from the repository root. There is exactly one
`.changeset/` directory, at the root."_

---

## M-03 — The lockfile is gitignored and CI never enforces it

Two mutually inconsistent facts:

```
$ grep -n "pnpm-lock" .gitignore
3:pnpm-lock.yaml

$ git ls-files --error-unmatch pnpm-lock.yaml
pnpm-lock.yaml          ← tracked anyway (486 KB)
```

`.gitignore` has no effect on already-tracked files, so the lockfile _is_ versioned. But the
ignore entry means a contributor who deletes and regenerates it will not see it in
`git status`, and dependency changes silently fail to be committed.

Compounding it, **all four CI jobs** install with `--no-frozen-lockfile`:

```
.github/workflows/ci.yml:30   pnpm install --no-frozen-lockfile
.github/workflows/ci.yml:51   pnpm install --no-frozen-lockfile
.github/workflows/ci.yml:75   pnpm install --no-frozen-lockfile
.github/workflows/release.yml:32  pnpm install --no-frozen-lockfile
```

That flag tells pnpm: _if the lockfile disagrees with `package.json`, resolve fresh and carry
on._ In CI it is the opposite of what you want. The point of a lockfile is that CI tests the
exact tree that will ship.

### Impact

- CI can pass on a dependency tree no developer has ever run.
- A transitive dependency publishing a breaking patch fails the build with no repo change,
  and the failure is not reproducible locally.
- Lockfile drift never fails the build, so it accumulates.

This is the mechanism by which a mismatch like `@types/react` v19 against React 18
devDependencies persists undetected — commit `daf177a` ("fix(types): update @types/react to v19
to fix typecheck errors") is exactly that class of after-the-fact fix.

### Fix

```diff
 # Dependencies
 node_modules
-pnpm-lock.yaml
```

```diff
-      - run: pnpm install --no-frozen-lockfile
+      - run: pnpm install --frozen-lockfile
```

Apply to all four occurrences. Then commit a regenerated lockfile once so the first frozen
install has something consistent to check against:

```bash
pnpm install --lockfile-only
git add pnpm-lock.yaml
```

If a frozen install then fails, that failure is the finding — it means `package.json` and the
lockfile genuinely disagree today.

---

## M-04 — The docs `lint` script is a no-op

**File:** `apps/docs/package.json:8`

```json
"lint": "true"
```

`pnpm lint` fans out through turbo to both workspaces. The docs workspace runs `true`, exits 0,
and reports success:

```
embed-dossier-mstr-docs:lint: > embed-dossier-mstr-docs@1.0.0 lint
embed-dossier-mstr-docs:lint: > true
```

The CI **Lint** job is therefore green while roughly half the repository's TypeScript — 30+
components under `apps/docs/components/` plus the `app/` routes — is never linted. A real
`lint:fix` script exists on the next line (`npx eslint . --fix`), so the tooling is present;
only the check is disabled.

### Fix

```diff
-"lint": "true",
+"lint": "next lint",
```

Expect a first run to surface a backlog. Land it in two steps so the fix is reviewable:

```bash
cd apps/docs
npx next lint --fix                     # mechanical fixes
npx next lint --format json > /tmp/docs-lint.json   # triage what remains
```

If the remaining count is large, gate progress rather than blocking the fix:

```json
"lint": "next lint --max-warnings 0"
```

after clearing warnings, or start with an explicit budget and ratchet it down.

---

## M-05 — Pre-commit runs the wrong thing and `lint-staged` is dead

**Files:** `.husky/pre-commit`, `.lintstagedrc.json`

```sh
# .husky/pre-commit
npm test
```

```json
// .lintstagedrc.json — configured, never invoked
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml,css}": ["prettier --write"]
}
```

Three problems:

1. **`lint-staged` never runs.** It is installed (`package.json:24`) and configured, but no hook
   calls it. Staged files are neither linted nor formatted before commit.
2. **Wrong package manager.** The repo declares `"packageManager": "pnpm@9.15.4"` and CI uses
   pnpm throughout; the hook shells out to `npm`. It works by accident (npm can run the script)
   but bypasses the pnpm workspace protocol and can resolve differently.
3. **Wrong granularity.** Running the _entire_ test suite on every commit costs ~8 s plus
   turbo overhead and checks files the commit does not touch. That is what CI is for. Slow
   hooks train contributors to reach for `--no-verify`.

### Fix

```sh
# .husky/pre-commit
pnpm exec lint-staged
```

Add type safety at the push boundary instead, where a slower check is acceptable:

```sh
# .husky/pre-push
pnpm -r exec tsc --noEmit
```

Also worth extending `.lintstagedrc.json` to typecheck changed TS:

```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml,css}": ["prettier --write"]
}
```

(keep as-is — per-file `tsc` is unreliable; the pre-push hook covers it properly.)

---

## M-08 — `engines.node` contradicts the CI matrix

```json
// package.json:28-30
"engines": { "node": "20.x" }
```

```yaml
# .github/workflows/ci.yml:59-61
strategy:
  matrix:
    node-version: [20, 22]
```

CI asserts support for Node 22 while the manifest declares 20 only. Node 22 users installing
the package get an engine warning — the same warning this audit's own runs produced:

```
WARN  Unsupported engine: wanted: {"node":"20.x"} (current: {"node":"v22.22.2"})
```

With `engine-strict=true` in a consumer's `.npmrc`, that warning becomes an install **failure**.

Note that `engines` here is on the **root private workspace** manifest. The published package
(`packages/embed-dossier-mstr-react/package.json`) declares **no** `engines` field at all, so
consumers are currently unconstrained — which is arguably worse, since nothing communicates the
supported range.

### Fix

Root manifest — match what CI proves:

```diff
-"engines": { "node": "20.x" }
+"engines": { "node": ">=20" }
```

Published package — state the real requirement. The build targets `es2019` and the runtime
needs only `fetch` and DOM APIs, so this is about the toolchain, not the runtime:

```json
"engines": { "node": ">=18" }
```

Pick the floor deliberately and add it to the CI matrix if you intend to support it.

---

## Additional observations

### `vercel.json` works around corepack

```json
{ "installCommand": "npx pnpm@9.15.4 install" }
```

The history shows four commits converging on this (`4dbcd17`, `435eb0a`, `b52ffa8`, `49d22df`).
Vercel now honours `packageManager` natively; retry removing the override and letting corepack
handle it. If it must stay, add a comment in the docs app README explaining why so it is not
re-litigated a fifth time.

### CI has no build-artifact verification

The **Build** job's final step is:

```yaml
- name: Check package size
  run: |
    cd packages/embed-dossier-mstr-react
    npx -y pkgroll --dry-run 2>/dev/null || true
    ls -lh dist/
```

`pkgroll` is not a dependency of this project (it builds with tsup), the invocation is
suppressed with `2>/dev/null || true`, and `ls -lh` is informational. The step cannot fail and
verifies nothing.

Replace it with checks that can actually fail:

```yaml
- name: Verify package contents
  run: |
    cd packages/embed-dossier-mstr-react
    npm pack --dry-run
    node -e "
      const fs = require('fs');
      for (const f of ['dist/index.js','dist/index.mjs','dist/index.d.ts','dist/index.d.mts']) {
        if (!fs.existsSync(f)) { console.error('missing ' + f); process.exit(1); }
      }
    "

- name: Smoke-test build output
  run: node scripts/smoke-dist.mjs # see 03 — Testing Strategy
```

Consider adding [`publint`](https://publint.dev) and `@arethetypeswrong/cli`, which catch
`exports`-map and dual-package-hazard mistakes that are otherwise only discovered by consumers:

```yaml
- run: npx publint packages/embed-dossier-mstr-react
- run: npx @arethetypeswrong/cli --pack packages/embed-dossier-mstr-react
```

### No CI enforcement of the changeset requirement

Nothing checks that a PR touching `packages/**` includes a changeset. Given H-06 already lost
three of them, add:

```yaml
- name: Require a changeset
  if: github.event_name == 'pull_request'
  run: npx changeset status --since=origin/main
```
