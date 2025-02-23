import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { DashboardEmbed } from "../../components/DashboardEmbed";
import { UseCreateDashboardProps } from "../../hooks/useCreateDashboard";

// Create mock element and useCreateDashboard implementation
const mockElement = document.createElement("div");
const mockUseCreateDashboard = vi.fn().mockImplementation((props) => ({
  containerRef: { current: mockElement },
  dashboard: null,
  isDashboardError: props.config.url === "invalid-url",
  isSdkLoaded: true,
}));

// Mock both the hook and utils
vi.mock("../../hooks/useCreateDashboard", () => ({
  useCreateDashboard: (props: UseCreateDashboardProps) =>
    mockUseCreateDashboard(props),
}));

vi.mock("../../utils", () => ({
  getInfoFromUrl: (url: string) => {
    if (url === "invalid-url") {
      throw new Error("Invalid URL format");
    }
    return {
      serverUrlLibrary: "https://demo.microstrategy.com/MicroStrategyLibrary",
    };
  },
}));

describe("DashboardEmbed", () => {
  const defaultProps = {
    dossierUrl:
      "https://demo.microstrategy.com/MicroStrategyLibrary/app/B7CA92F04B9FAE8D941C3E9B7E0CD754/27D332AC6D43352E0928B9A1FCAF4AB0",
  };

  beforeEach(() => {
    mockUseCreateDashboard.mockClear();
    mockElement.style.cssText = "";
    vi.clearAllMocks();
  });

  it("should renders without crashing", () => {
    const { container } = render(<DashboardEmbed {...defaultProps} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should applies custom className correctly", () => {
    const { container } = render(
      <DashboardEmbed {...defaultProps} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should applies custom style correctly", () => {
    const { container } = render(
      <DashboardEmbed {...defaultProps} style={{ backgroundColor: "red" }} />
    );

    const element = container.firstChild as HTMLElement;
    expect(element?.style.backgroundColor).toBe("red");
  });

  it("should calls useCreateDashboard with correct parameters", () => {
    const config = {
      enableResponsive: true,
      navigationBar: { enabled: true },
    };

    render(<DashboardEmbed {...defaultProps} config={config} />);

    expect(mockUseCreateDashboard).toHaveBeenCalledWith({
      serverUrlLibrary: "https://demo.microstrategy.com/MicroStrategyLibrary",
      config: expect.objectContaining({
        url: defaultProps.dossierUrl,
        enableResponsive: true,
        navigationBar: { enabled: true },
      }),
    });
  });

  it("should renders with minimal props", () => {
    const { container } = render(
      <DashboardEmbed dossierUrl={defaultProps.dossierUrl} />
    );
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute("class", "");
  });

  it("should handles empty config correctly", () => {
    render(<DashboardEmbed {...defaultProps} config={{}} />);

    expect(mockUseCreateDashboard).toHaveBeenCalledWith({
      serverUrlLibrary: "https://demo.microstrategy.com/MicroStrategyLibrary",
      config: {
        url: defaultProps.dossierUrl,
      },
    });
  });

  it("should handles malformed URLs gracefully", () => {
    const consoleSpy = vi.spyOn(console, "error");

    render(<DashboardEmbed dossierUrl="invalid-url" />);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to parse dossier URL:",
      expect.any(Error)
    );

    expect(mockUseCreateDashboard).toHaveBeenCalledWith({
      serverUrlLibrary: "",
      config: {
        url: "invalid-url",
      },
    });

    consoleSpy.mockRestore();
  });

  it("should extracts server URL correctly from dossier URL", () => {
    render(<DashboardEmbed {...defaultProps} />);

    expect(mockUseCreateDashboard).toHaveBeenCalledWith({
      serverUrlLibrary: "https://demo.microstrategy.com/MicroStrategyLibrary",
      config: {
        url: "https://demo.microstrategy.com/MicroStrategyLibrary/app/B7CA92F04B9FAE8D941C3E9B7E0CD754/27D332AC6D43352E0928B9A1FCAF4AB0",
      },
    });
  });
});
