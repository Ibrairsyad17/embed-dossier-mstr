import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCreateBotConsumptionPageWithAuth } from "../../hooks/useCreateBotConsumptionPageWithAuth";
import { useLoadMstrSDK } from "../../hooks/useLoadMstrSDK";
import { EmbedBotConsumptionPage, MicroStrategySDK } from "../../types";

// Mock useLoadMstrSDK
vi.mock("../../hooks/useLoadMstrSDK", () => ({
  useLoadMstrSDK: vi.fn(),
}));

describe("useCreateBotConsumptionPageWithAuth", () => {
  const mockBotPage = {
    id: "test-bot",
    close: vi.fn(),
    refresh: vi.fn(),
  } as unknown as EmbedBotConsumptionPage;

  const defaultProps = {
    serverUrlLibrary: "https://demo.microstrategy.com/MicroStrategyLibrary",
    placeholder: document.createElement("div"),
    projectId: "B7CA92F04B9FAE8D941C3E9B7E0CD754",
    objectId: "27D332AC6D43352E0928B9A1FCAF4AB0",
    config: {
      containerHeight: "600px",
      containerWidth: "100%",
    },
    loginMode: "guest" as const,
  };

  const mockEmbedBotPage = vi.fn();
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch.mockReset();
    global.window.microstrategy = {
      embeddingContexts: {
        embedBotConsumptionPage: mockEmbedBotPage.mockReset(),
      },
      dossier: {
        CustomAuthenticationType: {
          AUTH_TOKEN: "auth-token",
          IDENTITY_TOKEN: "identity-token",
        },
      },
      auth: {
        oidcLogin: vi.fn(),
        samlLogin: vi.fn(),
      },
    } as unknown as MicroStrategySDK;

    vi.mocked(useLoadMstrSDK).mockReturnValue({
      isSdkLoaded: true,
      isSdkError: { isError: false, message: "" },
    });
  });

  it("should handle guest authentication successfully", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true }).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "x-mstr-authtoken": "test-token" }),
    });
    mockEmbedBotPage.mockResolvedValueOnce(mockBotPage);

    const { result } = renderHook(() =>
      useCreateBotConsumptionPageWithAuth(defaultProps)
    );

    await vi.waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.botConsumptionPage).toBe(mockBotPage);
      expect(result.current.error).toBeNull();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      `${defaultProps.serverUrlLibrary}/api/auth/login`,
      expect.objectContaining({
        body: JSON.stringify({ loginMode: 8 }),
      })
    );
  });

  it("should handle standard authentication", async () => {
    const standardProps = {
      ...defaultProps,
      loginMode: "standard" as const,
      username: "testuser",
      password: "testpass",
    };

    mockFetch.mockResolvedValueOnce({ ok: true }).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "x-mstr-authtoken": "test-token" }),
    });
    mockEmbedBotPage.mockResolvedValueOnce(mockBotPage);

    const { result } = renderHook(() =>
      useCreateBotConsumptionPageWithAuth(standardProps)
    );

    await vi.waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      `${defaultProps.serverUrlLibrary}/api/auth/login`,
      expect.objectContaining({
        body: JSON.stringify({
          loginMode: 1,
          username: "testuser",
          password: "testpass",
        }),
      })
    );
  });

  it("should handle authentication error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Auth failed"));

    const { result } = renderHook(() =>
      useCreateBotConsumptionPageWithAuth(defaultProps)
    );

    await vi.waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.botConsumptionPage).toBeNull();
    });
  });

  it("should handle bot page creation with auth token", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true }).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "x-mstr-authtoken": "test-token" }),
    });
    mockEmbedBotPage.mockResolvedValueOnce(mockBotPage);

    const { result } = renderHook(() =>
      useCreateBotConsumptionPageWithAuth(defaultProps)
    );

    await vi.waitFor(() => {
      expect(mockEmbedBotPage).toHaveBeenCalledWith(
        expect.objectContaining({
          serverUrl: defaultProps.serverUrlLibrary,
          projectId: defaultProps.projectId,
          objectId: defaultProps.objectId,
          enableCustomAuthentication: true,
          customAuthenticationType: "auth-token",
          getLoginToken: expect.any(Function),
        })
      );
      expect(result.current.botConsumptionPage).toBe(mockBotPage);
    });
  });
});
