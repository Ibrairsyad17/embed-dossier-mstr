import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCreateLibraryPageWithAuth } from "../../hooks/useCreateLibraryPageWithAuth";
import { useLoadMstrSDK } from "../../hooks/useLoadMstrSDK";
import { EmbedLibraryPage, MicroStrategySDK } from "../../types";

vi.mock("../../hooks/useLoadMstrSDK", () => ({
  useLoadMstrSDK: vi.fn(),
}));

describe("useCreateLibraryPageWithAuth", () => {
  const mockLibraryPage = {
    id: "test-library",
    close: vi.fn(),
    refresh: vi.fn(),
  } as unknown as EmbedLibraryPage;

  const defaultProps = {
    serverUrlLibrary: "https://demo.microstrategy.com/MicroStrategyLibrary",
    placeholder: document.createElement("div"),
    config: {
      containerHeight: "600px",
      containerWidth: "100%",
    },
    loginMode: "guest" as const,
  };

  const mockEmbedLibraryPage = vi.fn();
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
    global.window.microstrategy = {
      embeddingContexts: {
        embedLibraryPage: mockEmbedLibraryPage,
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

  it("should initialize with correct state", () => {
    const { result } = renderHook(() =>
      useCreateLibraryPageWithAuth(defaultProps)
    );

    expect(result.current).toEqual({
      libraryPage: null,
      isAuthenticated: false,
      error: null,
    });
  });

  it("should handle guest authentication successfully", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true }).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "x-mstr-authtoken": "test-token" }),
    });
    mockEmbedLibraryPage.mockResolvedValueOnce(mockLibraryPage);

    const { result } = renderHook(() =>
      useCreateLibraryPageWithAuth(defaultProps)
    );

    await vi.waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.libraryPage).toBe(mockLibraryPage);
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
    mockEmbedLibraryPage.mockResolvedValueOnce(mockLibraryPage);

    const { result } = renderHook(() =>
      useCreateLibraryPageWithAuth(standardProps)
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

  it("should handle authentication errors", async () => {
    const errorMessage = "Auth failed";
    mockFetch.mockRejectedValueOnce(new Error(errorMessage));
    mockEmbedLibraryPage.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() =>
      useCreateLibraryPageWithAuth(defaultProps)
    );

    await vi.waitFor(() => {
      expect(result.current.error).toBe(errorMessage); // Check for specific error message
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.libraryPage).toBeNull();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      `${defaultProps.serverUrlLibrary}/api/auth/login`,
      expect.any(Object)
    );
  });

  it("should handle library page creation with auth token", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true }).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "x-mstr-authtoken": "test-token" }),
    });
    mockEmbedLibraryPage.mockResolvedValueOnce(mockLibraryPage);

    const { result } = renderHook(() =>
      useCreateLibraryPageWithAuth(defaultProps)
    );

    await vi.waitFor(() => {
      expect(mockEmbedLibraryPage).toHaveBeenCalledWith(
        expect.objectContaining({
          serverUrl: defaultProps.serverUrlLibrary,
          enableCustomAuthentication: true,
          customAuthenticationType: "auth-token",
          getLoginToken: expect.any(Function),
        })
      );
      expect(result.current.libraryPage).toBe(mockLibraryPage);
    });
  });
});
