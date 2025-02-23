import { it, expect, describe, vi, beforeEach } from "vitest";
import { MicroStrategyDossier, MicroStrategySDK } from "../../types";
import { useLoadMstrSDK } from "../../hooks/useLoadMstrSDK";
import { renderHook } from "@testing-library/react";
import { useCreateDashboardWithAuth } from "../../exports";

// Mock useLoadMstrSDK
vi.mock("../../hooks/useLoadMstrSDK", () => ({
  useLoadMstrSDK: vi.fn(),
}));

describe("useCreateDashboardWithAuth", () => {
  const mockDashboard = {
    id: "test-dashboard",
    close: vi.fn(),
    refresh: vi.fn(),
    resize: vi.fn(),
  } as unknown as MicroStrategyDossier;

  const defaultProps = {
    serverUrlLibrary: "https://demo.microstrategy.com/MicroStrategyLibrary",
    placeholder: document.createElement("div"),
    config: {
      url: "https://demo.microstrategy.com/MicroStrategyLibrary/app/B7CA92F04B9FAE8D941C3E9B7E0CD754/27D332AC6D43352E0928B9A1FCAF4AB0",
      enableResponsive: true,
    },
    loginMode: "guest" as const,
  };

  const mockCreate = vi.fn();
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch.mockReset();
    global.window.microstrategy = {
      dossier: {
        create: mockCreate.mockReset(),
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
    // Ensure mock fetch returns a resolved promise initially
    mockFetch.mockResolvedValue({ ok: true });
    mockCreate.mockResolvedValue(null);

    const { result } = renderHook(() =>
      useCreateDashboardWithAuth(defaultProps)
    );

    // Test each property individually
    expect(result.current.dashboard).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should handle guest authentication successfully", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true }) // Login response
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "x-mstr-authtoken": "test-token" }),
      }); // Token response
    mockCreate.mockResolvedValueOnce(mockDashboard);

    const { result } = renderHook(() =>
      useCreateDashboardWithAuth(defaultProps)
    );

    await vi.waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.dashboard).toBe(mockDashboard);
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
    mockCreate.mockResolvedValueOnce(mockDashboard);

    const { result } = renderHook(() =>
      useCreateDashboardWithAuth(standardProps)
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

  it("should handle SAML authentication", async () => {
    const { result } = renderHook(() =>
      useCreateDashboardWithAuth({
        ...defaultProps,
        loginMode: "saml",
      })
    );

    expect(window.microstrategy.auth.samlLogin).toHaveBeenCalledWith(
      defaultProps.serverUrlLibrary
    );
  });

  it("should handle OIDC authentication", async () => {
    const { result } = renderHook(() =>
      useCreateDashboardWithAuth({
        ...defaultProps,
        loginMode: "oidc",
      })
    );

    expect(window.microstrategy.auth.oidcLogin).toHaveBeenCalledWith(
      defaultProps.serverUrlLibrary
    );
  });

  it("should handle authentication errors", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Auth failed"));

    const { result } = renderHook(() =>
      useCreateDashboardWithAuth(defaultProps)
    );

    await vi.waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.dashboard).toBeNull();
    });
  });

  it("should handle missing credentials for standard auth", async () => {
    const { result } = renderHook(() =>
      useCreateDashboardWithAuth({
        ...defaultProps,
        loginMode: "standard",
      })
    );

    await vi.waitFor(() => {
      expect(result.current.error).toContain(
        "Username and password are required"
      );
    });
  });

  it("should handle dashboard creation after successful auth", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true }).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "x-mstr-authtoken": "test-token" }),
    });
    mockCreate.mockResolvedValueOnce(mockDashboard);

    const { result } = renderHook(() =>
      useCreateDashboardWithAuth(defaultProps)
    );

    await vi.waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          ...defaultProps.config,
          enableCustomAuthentication: true,
          customAuthenticationType: "auth-token",
          getLoginToken: expect.any(Function),
        })
      );
      expect(result.current.dashboard).toBe(mockDashboard);
    });
  });
});
