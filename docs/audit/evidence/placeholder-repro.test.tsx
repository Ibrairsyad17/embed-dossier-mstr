/**
 * REGRESSION GUARD — critical defects C-01, C-02, C-03
 *
 * Unlike every existing component test, this file does NOT mock the hook layer.
 * It renders the real components driving the real hooks against a stubbed
 * `window.microstrategy`, which is the seam where C-01..C-04 live.
 *
 * Expected results
 *   against b4267ef (pre-fix) : 3 failures, 1 skipped
 *   after C-01..C-04 are fixed: 3 passes (unskip the 4th)
 *
 * Note: C-03 below deliberately uses a non-<div> custom loadingComponent.
 * With the DEFAULT loader that case passes by coincidence — see C-03 in the
 * audit for why. The custom loader is the honest assertion.
 *
 * Install: copy to packages/embed-dossier-mstr-react/src/tests/
 * Run:     pnpm --filter embed-dossier-mstr-react test -- placeholder-repro
 *
 * See docs/audit/01-critical-defects.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BotConsumptionPageWithAuth } from "../components/BotConsumptionPageWithAuth";
import { LibraryPageEmbedWithAuth } from "../components/LibraryPageEmbedWithAuth";
import { DashboardEmbedWithAuth } from "../components/DashboardEmbedWithAuth";

const SERVER = "https://demo.microstrategy.com/MicroStrategyLibrary";
const DOSSIER_URL = `${SERVER}/app/PROJECT123/DOSSIER456`;

/** Every config object the SDK was asked to render with, in call order. */
let createdWith: Record<string, unknown>[] = [];

beforeEach(() => {
  createdWith = [];

  // Pre-seed the SDK so useLoadMstrSDK resolves immediately and script
  // injection is not part of what is under test here.
  (window as unknown as { microstrategy: unknown }).microstrategy = {
    dossier: {
      create: vi.fn(async (cfg: Record<string, unknown>) => {
        createdWith.push(cfg);
        return { close: vi.fn() };
      }),
      CustomAuthenticationType: { AUTH_TOKEN: "auth-token" },
    },
    embeddingContexts: {
      embedBotConsumptionPage: vi.fn(async (cfg: Record<string, unknown>) => {
        createdWith.push(cfg);
        return {};
      }),
      embedLibraryPage: vi.fn(async (cfg: Record<string, unknown>) => {
        createdWith.push(cfg);
        return {};
      }),
    },
    auth: { samlLogin: vi.fn(), oidcLogin: vi.fn() },
  };

  global.fetch = vi.fn(async () => ({
    ok: true,
    json: async () => ({ token: "test-token" }),
    headers: { get: () => "test-token" },
  })) as unknown as typeof fetch;
});

afterEach(() => {
  delete (window as unknown as { microstrategy?: unknown }).microstrategy;
  vi.restoreAllMocks();
});

describe("WithAuth components — real hooks, no mocking", () => {
  /**
   * C-01. The container <div> is gated behind `isAuthenticated`, which can only
   * become true after the container exists. Deadlock: the SDK is never called.
   */
  it("C-01: BotConsumptionPageWithAuth reaches the SDK", async () => {
    render(
      <BotConsumptionPageWithAuth
        serverUrlLibrary={SERVER}
        projectId="PROJECT123"
        objectId="OBJECT789"
        config={{}}
        loginMode="guest"
      />
    );

    await waitFor(
      () => {
        expect(
          window.microstrategy.embeddingContexts.embedBotConsumptionPage
        ).toHaveBeenCalled();
      },
      { timeout: 1500 }
    );
  });

  /**
   * C-02. Same deadlock, gated on `!isAuthenticated || !libraryPage`.
   * Symptom is a permanent loading state rather than a blank render.
   */
  it("C-02: LibraryPageEmbedWithAuth leaves the loading state", async () => {
    render(
      <LibraryPageEmbedWithAuth serverUrlLibrary={SERVER} loginMode="guest" />
    );

    await waitFor(
      () => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      },
      { timeout: 1500 }
    );
  });

  /**
   * C-03. This one calls the SDK, so asserting on "was create called" passes
   * and hides the bug. The real question is whether the node the SDK rendered
   * into is still attached to the document.
   *
   * A custom loadingComponent whose root is not a <div> — the case the
   * component's own JSDoc recommends — defeats React's host-node reuse and
   * leaves the SDK rendering into an orphan.
   */
  it("C-03: DashboardEmbedWithAuth renders into an ATTACHED node", async () => {
    const Spinner = () => <span>Authenticating…</span>;

    render(
      <DashboardEmbedWithAuth
        dossierUrl={DOSSIER_URL}
        loginMode="guest"
        loadingComponent={<Spinner />}
      />
    );

    await waitFor(
      () => expect(window.microstrategy.dossier.create).toHaveBeenCalled(),
      { timeout: 1500 }
    );

    const placeholder = createdWith[0]?.placeholder as HTMLElement | null;
    expect(placeholder).toBeTruthy();

    // The assertion that matters: a detached node renders nothing the user sees.
    expect(document.body.contains(placeholder!)).toBe(true);
  });
});

/**
 * C-04. Instance lifecycle. Both assertions fail against b4267ef:
 * `config` is a fresh object literal each render and sits in the effect's
 * dependency array, and cleanup never calls .close().
 *
 * Unskip once C-04 is fixed.
 */
describe.skip("C-04: instance lifecycle", () => {
  it("creates one instance per mount and closes it on unmount", async () => {
    const close = vi.fn();
    window.microstrategy.dossier.create = vi.fn(async () => ({ close })) as never;

    const props = { dossierUrl: DOSSIER_URL, loginMode: "guest" as const };
    const { unmount, rerender } = render(<DashboardEmbedWithAuth {...props} />);

    await waitFor(() =>
      expect(window.microstrategy.dossier.create).toHaveBeenCalled()
    );

    rerender(<DashboardEmbedWithAuth {...props} />);
    rerender(<DashboardEmbedWithAuth {...props} />);

    expect(window.microstrategy.dossier.create).toHaveBeenCalledTimes(1);

    unmount();
    expect(close).toHaveBeenCalledTimes(1);
  });
});
