import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { LibraryPageEmbed } from "../../components/LibraryPageEmbed";
import { useCreateLibraryPage } from "../../hooks/useCreateLibraryPage";
import "@testing-library/jest-dom";

// Mock useCreateLibraryPage hook
vi.mock("../../hooks/useCreateLibraryPage", () => ({
  useCreateLibraryPage: vi.fn(),
}));

describe("LibraryPageEmbed", () => {
  const defaultProps = {
    serverUrlLibrary: "https://demo.microstrategy.com/MicroStrategyLibrary",
  };

  const mockRef = { current: document.createElement("div") };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCreateLibraryPage).mockReturnValue({
      libraryPage: null,
      libraryPageRef: mockRef,
      isSdkLoaded: true,
      isLoading: false,
      error: null,
    });
  });

  it("should render without crashing", () => {
    const { container } = render(<LibraryPageEmbed {...defaultProps} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <LibraryPageEmbed {...defaultProps} className="test-class" />
    );
    expect(container.firstChild).toHaveClass("test-class");
  });

  it("should apply custom styles", () => {
    const customStyle = { backgroundColor: "red" };
    const { container } = render(
      <LibraryPageEmbed {...defaultProps} style={customStyle} />
    );
    const element = container.firstChild as HTMLElement;
    expect(element.style.backgroundColor).toBe("red");
  });

  it("should pass correct config to hook", () => {
    const testConfig = {
      containerHeight: "600px",
      containerWidth: "100%",
    };

    render(
      <LibraryPageEmbed
        serverUrlLibrary={defaultProps.serverUrlLibrary}
        config={testConfig}
      />
    );

    expect(useCreateLibraryPage).toHaveBeenCalledWith(
      expect.objectContaining({
        serverUrlLibrary: defaultProps.serverUrlLibrary,
        config: expect.objectContaining({
          containerHeight: "600px",
          containerWidth: "100%",
        }),
      })
    );
  });

  it("should render with provided ref", () => {
    const { container } = render(<LibraryPageEmbed {...defaultProps} />);
    expect(container.firstChild).toBeTruthy();
    expect(mockRef.current.parentElement).toBe(container);
  });

  it("should pass minimal props correctly", () => {
    render(
      <LibraryPageEmbed serverUrlLibrary={defaultProps.serverUrlLibrary} />
    );

    expect(useCreateLibraryPage).toHaveBeenCalledWith({
      serverUrlLibrary: defaultProps.serverUrlLibrary,
      config: undefined,
    });
  });
});
