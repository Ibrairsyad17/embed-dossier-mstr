# 05 — Security & Dependencies

> No hardcoded secrets, no vulnerable runtime dependency in the published package. The real
> exposure is in the toolchain and in an API design that encourages credentials in client code.

| ID                                                 | Severity  | Summary                                                                    |
| -------------------------------------------------- | --------- | -------------------------------------------------------------------------- |
| [M-07](#m-07--143-advisories-across-the-workspace) | 🟡 Medium | 2 critical / 50 high advisories, all dev-scope                             |
| —                                                  | 🟡 Medium | [Credential-in-props design](#design-review--credentials-as-react-props)   |
| —                                                  | 🔵 Low    | [Auth error handling swallows failures](#auth-responses-are-never-checked) |

---

## Scope note: the published package is clean

Worth stating plainly before the numbers, because `143 vulnerabilities` reads alarmingly.

`embed-dossier-mstr-react` ships with exactly **one** runtime dependency:

```json
"dependencies": { "clsx": "^2.1.1" }
```

Verified against the advisory database:

```
clsx affected:  False
react affected: False
```

React and React DOM are `peerDependencies` (correct), and everything else is
`devDependencies`, which npm does not install for consumers. **No advisory in this workspace
reaches an application that installs this package.** Everything below is developer-machine and
CI exposure.

---

## M-07 — 143 advisories across the workspace

```
$ pnpm audit
143 vulnerabilities found
Severity: 16 low | 65 moderate | 60 high | 2 critical
Total dependencies scanned: 1517
```

Distribution by workspace root:

| Root                                | Advisories |
| ----------------------------------- | ---------- |
| `apps/docs`                         | 91         |
| `packages/embed-dossier-mstr-react` | 61         |
| repo root                           | 31         |

_(Counts overlap where a package is reachable from more than one root.)_

### The two critical advisories

**1. `vitest` — arbitrary file read/execute via the UI server**
[GHSA-5xrq-8626-4rwp](https://github.com/advisories/GHSA-5xrq-8626-4rwp) · via
`packages/embed-dossier-mstr-react`

When the Vitest UI server is listening, a malicious page in the same browser can read and
execute arbitrary files. This project ships a script that starts it:

```json
"test:ui": "vitest --ui"
```

documented in `README.md:239`. A developer running `pnpm test:ui` while browsing is exposed.
This is the one advisory here with a plausible, concrete attack path against a real person on
this project.

**2. `form-data` — unsafe random boundary generation**
[GHSA-fjxv-7rqg-78g4](https://github.com/advisories/GHSA-fjxv-7rqg-78g4) · transitive dev
dependency

Predictable multipart boundaries permit request-splitting in some server configurations.
Transitive and dev-scope; low practical risk here.

### High-severity concentrations

```
next (11)            minimatch (6)       brace-expansion (6)
fast-uri (4)         vite (3)            rollup (2)
cross-spawn (2)      flatted (2)         picomatch (2)
js-yaml (2)          postcss (2)         braces, glob, tmp, ws, sharp, lodash…
```

`next` dominates with 11 — the docs app is on `next@^16.2.3` resolving to a version with
outstanding advisories. Since the docs site is publicly deployed (Vercel), these are the ones
with genuine internet-facing exposure, unlike the rest.

The `dompurify` chain (via `mermaid@11.4.1`) accounts for several XSS-class advisories. The
docs site renders Mermaid diagrams from MDX authored in-repo, so there is no untrusted input
path today — but it is worth pinning rather than relying on that staying true.

### Remediation, in priority order

**1. Vitest — highest value, smallest change.**

```bash
pnpm --filter embed-dossier-mstr-react up vitest @vitest/ui @vitest/coverage-v8 --latest
```

Keep the three in lockstep; `@vitest/coverage-v8` is currently pinned exactly (`3.0.6`) while
`vitest` floats (`^3.0.6`), which will drift. Pin all three the same way.

Until it is patched, prefer `pnpm coverage` over `pnpm test:ui`, and never leave the UI server
running while browsing.

**2. Next.js and the docs tree.**

```bash
pnpm --filter embed-dossier-mstr-docs up next mermaid --latest
pnpm --filter embed-dossier-mstr-docs audit --fix
```

Then rebuild and re-run the docs build — `next@16` majors move fast.

**3. Transitive-only advisories** (`minimatch`, `brace-expansion`, `braces`, `glob`, …) mostly
flow through ESLint 8, which is end-of-life. Migrating to ESLint 9 + flat config clears a large
block at once and is worth scheduling as its own task
([L-08](./07-repo-hygiene-and-docs.md#l-08--eslint-import-plugin-loaded-but-unused) touches the
same config).

**4. Pin what you cannot upgrade** using pnpm overrides:

```json
// root package.json
"pnpm": {
  "overrides": {
    "dompurify": ">=3.4.9"
  }
}
```

**5. Automate.** Add Dependabot or Renovate so this does not accumulate again:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule: { interval: weekly }
    groups:
      dev-dependencies:
        dependency-type: development
```

And add a non-blocking audit step to CI so the count is visible per-PR:

```yaml
- name: Audit (advisory)
  run: pnpm audit --audit-level=high || true
```

> **Do not reach for `pnpm audit --prod` as a blocking gate without scoping it first.** > `pnpm audit` scans the whole workspace regardless of the directory it is run from, so
> `--prod` currently reports **76 advisories (8 low / 42 moderate / 26 high)** — every one of
> which traces to `apps/docs`, the deployed documentation site, not to the published library:
>
> ```
> $ pnpm audit --prod
> 76 vulnerabilities found
> Paths: apps/docs > mermaid@11.4.1 > dompurify@3.2.4      (and similar)
> ```
>
> The published package's runtime tree is a single dependency:
>
> ```
> $ pnpm ls --prod --depth=10
> embed-dossier-mstr-react@2.0.0
> dependencies:
>   clsx 2.1.1
> ```
>
> which carries no advisories. A blocking gate is worth having, but it must be scoped to the
> library — e.g. run `npm audit --omit=dev` inside a packed tarball of
> `packages/embed-dossier-mstr-react`, or filter the JSON output by path prefix. A naive
> workspace-wide `--prod` gate fails on day one for reasons unrelated to what you ship.

---

## Design review — credentials as React props

Not a vulnerability in the code as written, but the most consequential security property of the
API.

All three `*WithAuth` components accept:

```tsx
username?: string;
password?: string;
```

and the documented usage is literal:

```tsx
// README.md:66-68
<DashboardEmbedWithAuth
  loginMode="standard"
  username="analyst"
  password="password"
/>
```

### What this means in practice

These are client components. A password reaching them is a password that:

- exists in the JavaScript bundle or in client-side memory,
- is visible in React DevTools' props inspector to anyone with the extension,
- appears in component-tree snapshots captured by error reporters (Sentry, LogRocket, Datadog
  RUM) unless explicitly scrubbed,
- is serialised into Next.js RSC payloads / `__NEXT_DATA__` if passed from a server component,
- and is submitted to `POST /api/auth/login` from the browser, so it is in the network tab.

The library cannot prevent any of this — it is inherent to accepting the credential
client-side. What the library _can_ do is stop presenting it as the default path.

### The docs already say the right thing, in the wrong place

Several MDX pages carry a **Security Considerations** section:

```
apps/docs/contents/docs/api-reference/dashboard-embed-with-auth/index.mdx:239
  1. Avoid hardcoding credentials in your code; use environment variables or a
     secure credential management system
```

Good advice, but (a) it sits ~240 lines below the copy-pasteable example, and (b) _"use
environment variables"_ is misleading for a client component: `NEXT_PUBLIC_*` and Vite `VITE_*`
variables are **inlined into the client bundle at build time**. Following that advice literally
produces a password embedded in shipped JavaScript — arguably worse than a prop, because it is
now static and identical for every user.

### Recommendations

**1. Correct the environment-variable guidance.** Replace with the accurate version:

> Credentials passed to these components are handled in the browser. Do **not** source them
> from `NEXT_PUBLIC_*` / `VITE_*` variables — those are inlined into the client bundle. Either
> collect them from a user-facing login form, or avoid the credential path entirely by using
> `loginMode="saml"` / `"oidc"`, or by establishing the session server-side and letting the
> component reuse the existing cookie.

**2. Lead with the safe path.** `guest`, `saml` and `oidc` require no credentials in client
code. Reorder the docs so the credential-based modes are presented as the fallback they should
be, and move the security note **above** the first example.

**3. Support the session-reuse pattern explicitly.** The most secure integration —
authenticate server-side, let the browser reuse the cookie — is already technically possible
(`getAuthToken` exists) but is not documented as a first-class option. It deserves its own docs
page and arguably a `loginMode="existing-session"` that skips the login call entirely.

**4. Accept a token supplier instead of raw credentials.** A forward-compatible prop that keeps
secrets out of the component tree:

```tsx
/** Supplies a MicroStrategy auth token. Preferred over username/password:
 *  the credential never enters the React tree. */
getAuthToken?: () => Promise<string>;
```

The hooks already build a `getLoginToken` closure internally, so this is a small change with a
large security payoff.

**5. Add a development-time warning.** Cheap, and it reaches people who never read docs:

```ts
if (process.env.NODE_ENV !== "production" && password) {
  console.warn(
    "[embed-dossier-mstr-react] `password` is handled in the browser and is visible " +
      "in React DevTools and error-reporter snapshots. Prefer loginMode 'saml'/'oidc', " +
      "or server-side session establishment. See <docs-url>.",
  );
}
```

**6. Change the README example.** `password="password"` is the kind of line that gets copied
verbatim. Use `password={password}` sourced from component state with a comment pointing at the
security section.

---

## Auth responses are never checked

**Files:** all three `*WithAuth` hooks — e.g. `useCreateDashboardWithAuth.ts:130`

```ts
await fetch(`${serverUrlLibrary}/api/auth/login`, standardOptions);
break;
```

The response is awaited and discarded. `fetch` rejects only on network failure — an HTTP 401,
403 or 500 resolves normally. So **failed authentication is indistinguishable from success**:
the code proceeds to `dossier.create`, which then fails for an unrelated-looking reason, and
the error surfaced to the user describes the wrong problem.

The same pattern appears in `useCreateBotConsumptionPageWithAuth.ts:64`/`:75` and
`useCreateLibraryPageWithAuth.ts:51`/`:62`.

### Fix

```ts
const response = await fetch(
  `${serverUrlLibrary}/api/auth/login`,
  standardOptions,
);
if (!response.ok) {
  const detail = await response.text().catch(() => "");
  throw new Error(
    `MicroStrategy authentication failed (${response.status} ${response.statusText})` +
      (detail ? `: ${detail.slice(0, 200)}` : ""),
  );
}
```

Two cautions:

- **Do not log the request body.** It contains the password. Only echo the _response_.
- **Truncate the server response** before surfacing it (as above) — MicroStrategy error bodies
  can be large HTML pages.

Add tests for 401, 403 and 500 asserting the error reaches `errorComponent` with a message
naming authentication.

---

## Positive findings

Verified and worth recording:

- **No hardcoded secrets.** A scan for API keys, tokens, private keys and Slack/GitHub token
  patterns across all tracked files (excluding the lockfile) returned nothing. Every
  `password=` occurrence is a documentation placeholder.
- **No secrets in CI.** `release.yml` correctly sources `NPM_TOKEN` / `NODE_AUTH_TOKEN` from
  GitHub secrets; nothing is inlined.
- **Least-privilege workflow permissions.** `release.yml:14-17` scopes to
  `contents: write`, `pull-requests: write`, `id-token: write` rather than defaulting to broad
  access.
- **`credentials: "include"` + `mode: "cors"`** is set consistently on every auth call, which
  is required for MicroStrategy's cookie-based session model.
- **Actions are version-pinned** to major tags (`actions/checkout@v4`, `pnpm/action-setup@v4`).
  Pinning to full commit SHAs would be stronger still, and is worth considering for the release
  workflow specifically, since it has publish rights.
- **`concurrency` with `cancel-in-progress`** on CI prevents redundant runs.

### One workflow hardening suggestion

`release.yml` triggers on every push to `main` and holds npm publish rights. Consider adding an
environment gate so publishes require approval:

```yaml
jobs:
  release:
    environment: npm-publish # configure required reviewers in repo settings
```

Combined with SHA-pinned actions, this meaningfully reduces the blast radius if a dependency of
the workflow itself is ever compromised.
