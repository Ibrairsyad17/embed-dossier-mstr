import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCreateBotConsumptionPage } from "../../hooks/useCreateBotConsumptionPage";
import { useLoadMstrSDK } from "../../exports";
import { MicroStrategySDK } from "../../types";

// ...existing code if any...

vi.mock("../../exports", () => ({
  useLoadMstrSDK: vi.fn(),
}));

describe("useCreateBotConsumptionPage", () => {
  const mockEmbedBotConsumptionPage = vi.fn();
  const mockRef = document.createElement("div");

  beforeEach(() => {
    vi.clearAllMocks();

    global.window.microstrategy = {
      embeddingContexts: {
        embedBotConsumptionPage: mockEmbedBotConsumptionPage,
      },
    } as unknown as MicroStrategySDK;

    vi.mocked(useLoadMstrSDK).mockReturnValue({
      isSdkLoaded: true,
      isSdkError: { isError: false, message: "" },
    });
  });

  it("should create bot consumption page when SDK is loaded", async () => {
    mockEmbedBotConsumptionPage.mockResolvedValueOnce({});
    const { result } = renderHook(() =>
      useCreateBotConsumptionPage({
        serverUrlLibrary: "test-server",
        projectId: "test-project",
        objectId: "test-object",
        config: { containerHeight: "500px" },
      })
    );

    await vi.waitFor(() => {
      expect(mockEmbedBotConsumptionPage).toHaveBeenCalledWith(
        expect.objectContaining({
          serverUrl: "test-server",
          projectId: "test-project",
          objectId: "test-object",
          containerHeight: "500px",
        })
      );
      expect(result.current.botConsumptionPage).not.toBeNull();
    });
  });

  it("should not create if SDK is not loaded", () => {
    vi.mocked(useLoadMstrSDK).mockReturnValue({
      isSdkLoaded: false,
      isSdkError: { isError: false, message: "" },
    });
    renderHook(() =>
      useCreateBotConsumptionPage({
        serverUrlLibrary: "test-server",
        projectId: "test-project",
        objectId: "test-object",
        config: { containerHeight: "500px" },
      })
    );
    expect(mockEmbedBotConsumptionPage).not.toHaveBeenCalled();
  });

  it("should handle creation error correctly", async () => {
    mockEmbedBotConsumptionPage.mockRejectedValueOnce(new Error("Failed"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() =>
      useCreateBotConsumptionPage({
        serverUrlLibrary: "test-server",
        projectId: "test-project",
        objectId: "test-object",
        config: { containerHeight: "500px" },
      })
    );

    await vi.waitFor(() => {
      expect(result.current.isBotConsumptionPageError).toBe(true);
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});
