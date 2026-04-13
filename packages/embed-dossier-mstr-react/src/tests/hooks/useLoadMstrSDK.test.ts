import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLoadMstrSDK } from "../../hooks/useLoadMstrSDK";

describe("useLoadMstrSDK", () => {
  const serverUrl = "https://demo.microstrategy.com/MicroStrategyLibrary";
  let scriptElement: HTMLScriptElement;

  beforeEach(() => {
    vi.clearAllMocks();

    scriptElement = document.createElement("script");
    vi.spyOn(document, "createElement").mockReturnValue(scriptElement);
    vi.spyOn(document.head, "appendChild").mockImplementation(
      () => scriptElement
    );
  });

  it("should create and append SDK script with correct attributes", () => {
    renderHook(() => useLoadMstrSDK({ serverUrlLibrary: serverUrl }));

    expect(scriptElement.type).toBe("text/javascript");
    expect(scriptElement.src).toBe(`${serverUrl}/javascript/embeddinglib.js`);
    expect(document.head.appendChild).toHaveBeenCalledWith(scriptElement);
  });

  it("should set isSdkLoaded to true when script loads successfully", async () => {
    const { result } = renderHook(() =>
      useLoadMstrSDK({ serverUrlLibrary: serverUrl })
    );

    expect(result.current.isSdkLoaded).toBe(false);
    expect(result.current.isSdkError.isError).toBe(false);

    await act(async () => {
      scriptElement.onload?.(new Event("load"));
    });

    expect(result.current.isSdkLoaded).toBe(true);
    expect(result.current.isSdkError.isError).toBe(false);
  });

  it("should set error state when script fails to load", async () => {
    const { result } = renderHook(() =>
      useLoadMstrSDK({ serverUrlLibrary: serverUrl })
    );

    await act(async () => {
      scriptElement.onerror?.(new Event("error"));
    });

    expect(result.current.isSdkLoaded).toBe(false);
    expect(result.current.isSdkError.isError).toBe(true);
    expect(result.current.isSdkError.message).toBe(`Failed to load MicroStrategy SDK from ${serverUrl}`);
  });

  it("should not create script if SDK is already loaded", () => {
    Object.defineProperty(window, "microstrategy", {
      value: {},
      writable: true,
    });

    vi.clearAllMocks();

    renderHook(() => useLoadMstrSDK({ serverUrlLibrary: serverUrl }));

    expect(document.createElement).not.toHaveBeenCalledWith("script");
    expect(document.head.appendChild).not.toHaveBeenCalled();
  });
});
