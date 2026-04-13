import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCreateDashboard } from "../../hooks/useCreateDashboard";
import { useLoadMstrSDK } from "../../hooks/useLoadMstrSDK";
import { MicroStrategyDossier, MicroStrategySDK } from "../../types";

vi.mock("../../hooks/useLoadMstrSDK", () => ({
  useLoadMstrSDK: vi.fn(),
}));

describe("useCreateDashboard", () => {
  const mockDashboard = {
    id: "test-dashboard",
    close: vi.fn(),
    refresh: vi.fn(),
    resize: vi.fn(),
    getCurrentChapter: vi.fn(),
    getCurrentPage: vi.fn(),
    getChapterList: vi.fn(),
    navigateToPage: vi.fn(),
  } as unknown as MicroStrategyDossier;

  const defaultConfig = {
    url: "https://demo.microstrategy.com/MicroStrategyLibrary/app/B7CA92F04B9FAE8D941C3E9B7E0CD754/27D332AC6D43352E0928B9A1FCAF4AB0",
    enableResponsive: true,
    navigationBar: { enabled: true },
  };

  const defaultProps = {
    serverUrlLibrary: "https://demo.microstrategy.com/MicroStrategyLibrary",
    config: defaultConfig,
  };

  const mockCreate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.window.microstrategy = {
      dossier: {
        create: mockCreate,
        CustomAuthenticationType: {
          AUTH_TOKEN: "auth-token",
          IDENTITY_TOKEN: "identity-token",
        },
        EventType: {},
      },
      auth: {
        oidcLogin: vi.fn(),
        samlLogin: vi.fn(),
      },
      embedding: {
        featureFlags: {},
      },
      embeddingContexts: {
        embedLibraryPage: vi.fn(),
        embedDossierConsumptionPage: vi.fn(),
        embedBotConsumptionPage: vi.fn(),
        embedReportPage: vi.fn(),
      },
    } as unknown as MicroStrategySDK;

    vi.mocked(useLoadMstrSDK).mockReturnValue({
      isSdkLoaded: true,
      isSdkError: { isError: false, message: "" },
    });
  });

  it("should return initial state correctly", () => {
    const { result } = renderHook(() => useCreateDashboard(defaultProps));

    expect(result.current).toEqual({
      dashboard: null,
      containerRef: { current: null },
      isSdkLoaded: true,
      isDashboardError: false,
    });
  });

  it("should not create dashboard when SDK is not loaded", () => {
    vi.mocked(useLoadMstrSDK).mockReturnValue({
      isSdkLoaded: false,
      isSdkError: { isError: false, message: "" },
    });
    renderHook(() => useCreateDashboard(defaultProps));
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("should create dashboard with correct config when SDK is loaded", async () => {
    mockCreate.mockResolvedValueOnce(mockDashboard);

    const { result } = renderHook(() => useCreateDashboard(defaultProps));

    await vi.waitFor(
      () => {
        expect(mockCreate).toHaveBeenCalledWith({
          url: defaultProps.config.url,
          enableResponsive: true,
          navigationBar: { enabled: true },
          placeholder: null,
        });
        expect(result.current.dashboard).not.toBeNull();
      },
      {
        timeout: 1000,
        interval: 50,
      }
    );

    // Verify final state
    expect(result.current.dashboard).toEqual(mockDashboard);
    expect(result.current.isDashboardError).toBe(false);
  });

  it("should handle dashboard creation error correctly", async () => {
    const error = new Error("Failed to create dashboard");
    mockCreate.mockRejectedValue(error);
    const consoleSpy = vi.spyOn(console, "error");

    const { result } = renderHook(() => useCreateDashboard(defaultProps));

    await vi.waitFor(() => {
      expect(result.current.isDashboardError).toBe(true);
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it("should handle config updates", async () => {
    const mockDashboardInstance = { ...mockDashboard };
    mockCreate.mockImplementation(() => Promise.resolve(mockDashboardInstance));

    // const { result } = 
    renderHook(() => useCreateDashboard(defaultProps));

    await vi.waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        url: defaultProps.config.url,
        enableResponsive: true,
        navigationBar: { enabled: true },
        placeholder: null,
      });
    });

    const newConfig = {
      url: defaultProps.config.url,
      enableResponsive: false,
      navigationBar: { enabled: false },
    };

    renderHook(() =>
      useCreateDashboard({
        ...defaultProps,
        config: newConfig,
      })
    );

    await vi.waitFor(() => {
      expect(mockCreate).toHaveBeenLastCalledWith({
        ...newConfig,
        placeholder: null,
      });
    });
  });
});
