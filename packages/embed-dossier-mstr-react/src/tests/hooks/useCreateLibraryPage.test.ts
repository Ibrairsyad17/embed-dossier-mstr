import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCreateLibraryPage } from "../../hooks/useCreateLibraryPage";
import { useLoadMstrSDK } from "../../hooks/useLoadMstrSDK";
import { EmbedLibraryPage, MicroStrategySDK } from "../../types";

vi.mock("../../hooks/useLoadMstrSDK", () => ({
  useLoadMstrSDK: vi.fn(),
}));

describe("useCreateLibraryPage", () => {
  const mockLibraryPage = {
    id: "test-library",
    close: vi.fn(),
    refresh: vi.fn(),
  } as unknown as EmbedLibraryPage;

  const defaultProps = {
    serverUrlLibrary: "https://demo.microstrategy.com/MicroStrategyLibrary",
    config: {
      containerHeight: "600px",
      containerWidth: "100%",
    },
  };

  const mockEmbedLibraryPage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.window.microstrategy = {
      embeddingContexts: {
        embedLibraryPage: mockEmbedLibraryPage,
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

  it("should create library page with correct config", () => {
    mockEmbedLibraryPage.mockResolvedValueOnce(mockLibraryPage);

    renderHook(() =>
      useCreateLibraryPage({
        serverUrlLibrary: defaultProps.serverUrlLibrary,
        config: {
          containerHeight: "600px",
          containerWidth: "100%",
        },
      })
    );

    expect(mockEmbedLibraryPage).toHaveBeenCalledWith(
      expect.objectContaining({
        serverUrl: defaultProps.serverUrlLibrary,
        containerHeight: "600px",
        containerWidth: "100%",
      })
    );
  });

  it("should handle error during library page creation", async () => {
    const error = new Error("Failed to create library page");
    mockEmbedLibraryPage.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useCreateLibraryPage(defaultProps));

    await vi.waitFor(() => {
      expect(result.current.error).not.toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });
});
