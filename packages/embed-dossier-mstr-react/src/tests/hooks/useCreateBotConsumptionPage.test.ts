import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCreateBotConsumptionPage } from "../../hooks/useCreateBotConsumptionPage";
import { useLoadMstrSDK } from "../../exports";
import { MicroStrategySDK } from "../../types";

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
        serverUrlLibrary: "https://demo.microstrategy.com/MicroStrategyLibrary",
        projectId: "38328E048D427571975C388F7C402AD8",
        objectId: "A81721DEC24012C1C40522B8A8EC36DE",
        config: {
          containerHeight: "500px",
          customApplicationId: "C2B2023642F6753A2EF159A75E0CFF29",
        },
      })
    );

    await vi.waitFor(() => {
      expect(mockEmbedBotConsumptionPage).toHaveBeenCalledWith(
        expect.objectContaining({
          serverUrl: "https://demo.microstrategy.com/MicroStrategyLibrary",
          projectId: "38328E048D427571975C388F7C402AD8",
          objectId: "A81721DEC24012C1C40522B8A8EC36DE",
          containerHeight: "500px",
          customApplicationId: "C2B2023642F6753A2EF159A75E0CFF29",
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
        serverUrlLibrary: "https://demo.microstrategy.com/MicroStrategyLibrary",
        projectId: "38328E048D427571975C388F7C402AD8",
        objectId: "A81721DEC24012C1C40522B8A8EC36DE",
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
        serverUrlLibrary: "https://demo.microstrategy.com/MicroStrategyLibrary",
        projectId: "38328E048D427571975C388F7C402AD8",
        objectId: "A81721DEC24012C1C40522B8A8EC36DE",
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
